import http, { Server } from 'http';
import https from 'https';

import express, {
  Express,
  Request as NativeRequest,
  Response as NativeResponse,
  NextFunction,
} from 'express';
import { version as expressVersion } from 'express/package.json';
import { AbstractAdapter, REQUEST_PHASE, ServerOptions } from 'alliage-webserver/adapter';
import { AbstractController } from 'alliage-webserver/controller';
import { AbstractMiddleware } from 'alliage-webserver/middleware';
import { Context } from 'alliage-webserver/middleware/context';
import { EventManager } from 'alliage-lifecycle/event-manager';
import {
  AdapterNotFoundEvent,
  AdapterPostControllerEvent,
  AdapterPostRequestEvent,
  AdapterPreControllerEvent,
  AdapterPreRequestEvent,
  AdapterServerStartedEvent,
  AdapterServerStoppedEvent,
} from 'alliage-webserver/adapter/events';

import { Request } from '../http/request';
import { Response } from '../http/response';
import { Config } from '../config';

export const ADAPTER_NAME = `express-${expressVersion}`;

export class ExpressAdapter extends AbstractAdapter {
  private config: Config;

  private eventManager: EventManager;

  private app: Express;

  private server?: Server = undefined;

  private controllers: AbstractController[] = [];

  private middlewares: AbstractMiddleware[] = [];

  private requests = new Map<NativeRequest, Request>();

  private responses = new Map<NativeResponse, Response>();

  constructor(config: Config, eventManager: EventManager) {
    super();
    this.eventManager = eventManager;
    this.config = config;
    this.app = express();
  }

  setMiddlewares(middlewares: AbstractMiddleware[]) {
    this.middlewares = middlewares;
    return this;
  }

  setControllers(controllers: AbstractController[]) {
    this.controllers = controllers;
    return this;
  }

  start({ port, host, ...options }: ServerOptions) {
    Object.entries(this.config.settings).forEach(([key, value]) => this.app.set(key, value));

    const [preMiddlewares, postMiddlewares] = this.middlewares.reduce(
      ([pre, post], middleware) => {
        const part = middleware.getRequestPhase() === REQUEST_PHASE.PRE_CONTROLLER ? pre : post;
        part.push(middleware);
        return [pre, post];
      },
      [[], []] as [AbstractMiddleware[], AbstractMiddleware[]],
    );

    this.app.use(async (req, res, next) => {
      const request = this.getRequest(req);
      const response = this.getResponse(res);
      await this.eventManager.emit(
        ...AdapterPreRequestEvent.getParams(request, response, ADAPTER_NAME),
      );
      next();
    });

    this.registerMiddlewares(preMiddlewares);

    this.controllers.forEach((controller: AbstractController) => {
      const routes = controller.getRoutes();
      routes.forEach(([method, path, handler]) => {
        const verb = method.toLowerCase();
        (this.app as any)[verb](
          path,
          async (req: NativeRequest, res: NativeResponse, next: NextFunction) => {
            const request = this.getRequest(req);
            const response = this.getResponse(res);
            request.setExtraPayload('controller_matched', true);
            try {
              if (!response.isFinished()) {
                const preControllerEvent = new AdapterPreControllerEvent(
                  controller,
                  handler,
                  request,
                  response,
                  [request, response, ADAPTER_NAME],
                  ADAPTER_NAME,
                );
                await this.eventManager.emit(preControllerEvent.getType(), preControllerEvent);
                const returnedValue = await handler.call(
                  controller,
                  ...preControllerEvent.getArguments(),
                );
                await this.eventManager.emit(
                  ...AdapterPostControllerEvent.getParams(
                    controller,
                    handler,
                    request,
                    response,
                    returnedValue,
                    ADAPTER_NAME,
                  ),
                );
                // POST CONTROLLER EVENT
              }
              next();
            } catch (e) {
              next(e);
            }
          },
        );
      });
    });
    this.app.use(async (req: NativeRequest, res: NativeResponse, next: NextFunction) => {
      const request = this.getRequest(req);
      const response = this.getResponse(res);

      if (!request.getExtraPayload('controller_matched')) {
        response.setStatus(404).setBody('Not found');
        await this.eventManager.emit(
          ...AdapterNotFoundEvent.getParams(request, response, ADAPTER_NAME),
        );
        response.end();
      }
      next();
    });

    this.registerMiddlewares(postMiddlewares);

    // Remove unique Request and Response for the given req and res
    // and end the response
    this.app.use(async (req, res) => {
      const response = this.getResponse(res);
      const request = this.getRequest(req);
      response.end();
      await this.eventManager.emit(
        ...AdapterPostRequestEvent.getParams(request, response, ADAPTER_NAME),
      );
      this.removeRequest(req);
      this.removeResponse(res);
    });

    return new Promise<void>((resolve) => {
      this.server = options.isSecured
        ? https.createServer(
            {
              cert: options.certificate,
              key: options.privateKey,
            },
            this.app,
          )
        : http.createServer(this.app);

      this.server.listen(port, host as any, async () => {
        await this.eventManager.emit(
          ...AdapterServerStartedEvent.getParams({ port, host, ...options }, ADAPTER_NAME),
        );
        resolve();
      });
    });
  }

  stop() {
    return new Promise<void>((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close(async (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        await this.eventManager.emit(...AdapterServerStoppedEvent.getParams(ADAPTER_NAME));
        resolve();
      });
    });
  }

  private registerMiddlewares(middlewares: AbstractMiddleware[]) {
    middlewares.forEach((middleware) => {
      const handlesError = middleware.apply.length > 1;
      const handler = async (
        req: NativeRequest,
        res: NativeResponse,
        next: NextFunction,
        error?: Error,
      ) => {
        const request = this.getRequest(req);
        const response = this.getResponse(res);
        if (response.isFinished()) {
          next();
          return;
        }
        try {
          await middleware.apply(new Context(request, response, ADAPTER_NAME), error);
          next();
        } catch (e) {
          next(e);
        }
      };
      this.app.use(
        handlesError
          ? (err: Error, req: NativeRequest, res: NativeResponse, next: NextFunction) =>
              handler(req, res, next, err)
          : (req: NativeRequest, res: NativeResponse, next: NextFunction) =>
              handler(req, res, next),
      );
    });
  }

  private removeRequest(req: NativeRequest) {
    this.requests.delete(req);
  }

  private removeResponse(res: NativeResponse) {
    this.responses.delete(res);
  }

  private getRequest(req: NativeRequest) {
    let request = this.requests.get(req);
    if (!request) {
      request = new Request(req);
      this.requests.set(req, request);
    }
    return request;
  }

  private getResponse(res: NativeResponse) {
    let response = this.responses.get(res);
    if (!response) {
      response = new Response(res);
      this.responses.set(res, response);
    }
    return response;
  }
}
