/* eslint-disable max-classes-per-file */
import http from 'http';
import https from 'https';

import getPort from 'get-port';
import bodyParser from 'body-parser';
import axios, { AxiosError } from 'axios';
import { EventManager } from 'alliage-lifecycle/event-manager';

import { ADAPTER_NAME, ExpressAdapter } from '..';
import { AbstractController } from '../../../../webserver/src/controller';
import { Request } from '../../http/request';
import { Response } from '../../http/response';
import { Delete, Get, Post, Put } from '../../../../webserver/src/controller/decorations';
import { createNativeMiddleware } from '../../middleware/native-middleware';
import { AbstractMiddleware } from '../../../../webserver/src/middleware';
import { REQUEST_PHASE } from '../../../../webserver/src/adapter';
import { Context } from '../../../../webserver/src/middleware/context';
import {
  AdapterNotFoundEvent,
  AdapterPostControllerEvent,
  AdapterPostRequestEvent,
  AdapterPreControllerEvent,
  AdapterPreRequestEvent,
  AdapterServerStartedEvent,
  AdapterServerStoppedEvent,
  ADAPTER_EVENTS,
} from '../../../../webserver/src/adapter/events';
import { AbstractRequest } from '../../../../webserver/src/http/request';
import { AbstractResponse } from '../../../../webserver/src/http/response';

class Controller1 extends AbstractController {
  @Get('/controller1/get/:param')
  getAction(req: Request, res: Response, _adapter: string, extraArg: string) {
    res.setBody({
      param: req.getParams().param,
      extraArg,
    });
    return 'dummy-return-value';
  }

  @Post('/controller1/post')
  postAction(req: Request<{ param: string }>, res: Response) {
    res.setBody({
      param: req.getBody().param,
    });
  }
}

class Controller2 extends AbstractController {
  @Delete('/controller2/delete/:id')
  deleteAction(req: Request) {
    throw new Error(`error with id: ${req.getParams().id}`);
  }

  @Put('/controller2/put')
  putAction(_req: Request, res: Response) {
    res.setBody({ message: 'Request ended by controller' }).end();
  }
}

const BodyParserMiddleware = createNativeMiddleware(bodyParser.json, {
  args: () => [{ strict: true }],
});

class RequestEndingMiddleware extends AbstractMiddleware {
  getRequestPhase = () => REQUEST_PHASE.PRE_CONTROLLER;

  apply(context: Context) {
    const { endRequest } = context.getRequest().getQuery();
    if (endRequest) {
      context.getResponse().setBody({ message: 'Request ended by middleware' }).end();
    }
  }
}

class ErrorTriggeringMiddleware extends AbstractMiddleware {
  getRequestPhase = () => REQUEST_PHASE.PRE_CONTROLLER;

  apply(context: Context) {
    const { error } = context.getRequest().getQuery();
    if (error) {
      throw new Error(error as string);
    }
  }
}

class ResponseTransformerMiddleware extends AbstractMiddleware {
  getRequestPhase = () => REQUEST_PHASE.POST_CONTROLLER;

  apply(context: Context) {
    const res = context.getResponse() as Response<Record<string, unknown>>;
    res.setBody({
      ...res.getBody(),
      transformed: true,
    });
  }
}

class ErrorHandlerMiddleware extends AbstractMiddleware {
  getRequestPhase = () => REQUEST_PHASE.POST_CONTROLLER;

  apply(context: Context, error: Error) {
    context.getResponse().setStatus(500).setBody({
      message: error.message,
      adapter: context.getAdapter(),
    });
  }
}

describe('webserver/adapter', () => {
  describe('ExpressAdapter', () => {
    const eventManager = new EventManager();

    const preRequestEventHandler = jest.fn();
    const postRequestEventHandler = jest.fn();
    const notFoundEventHandler = jest.fn();
    const preControllerEventHandler = jest.fn();
    const postControllerEventHandler = jest.fn();
    const serverStartedEventHandler = jest.fn();
    const serverStoppedEventHandler = jest.fn();

    eventManager.on(ADAPTER_EVENTS.PRE_CONTROLLER, preRequestEventHandler);
    eventManager.on(ADAPTER_EVENTS.POST_CONTROLLER, postRequestEventHandler);
    eventManager.on(ADAPTER_EVENTS.NOT_FOUND, notFoundEventHandler);
    eventManager.on(ADAPTER_EVENTS.PRE_CONTROLLER, preControllerEventHandler);
    eventManager.on(ADAPTER_EVENTS.POST_CONTROLLER, postControllerEventHandler);
    eventManager.on(ADAPTER_EVENTS.SERVER_STARTED, serverStartedEventHandler);
    eventManager.on(ADAPTER_EVENTS.SERVER_STOPPED, serverStoppedEventHandler);

    const adapter = new ExpressAdapter(
      {
        settings: {
          'x-powered-by': false,
        },
      },
      eventManager,
    );
    adapter
      .setControllers([new Controller1(), new Controller2()])
      .setMiddlewares([
        new RequestEndingMiddleware(),
        new ErrorTriggeringMiddleware(),
        new BodyParserMiddleware(),
        new ResponseTransformerMiddleware(),
        new ErrorHandlerMiddleware(),
      ]);

    let port: number;
    beforeAll(async () => {
      port = await getPort();
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    describe('unsecured server', () => {
      describe('#start', () => {
        it('should start a webserver with the given middlewares and controllers', async () => {
          serverStartedEventHandler.mockImplementationOnce((event: AdapterServerStartedEvent) => {
            expect(event.getOptions()).toEqual({ port });
            expect(event.getAdapter()).toEqual(ADAPTER_NAME);
          });

          await adapter.start({ port });

          expect(serverStartedEventHandler).toHaveBeenCalledTimes(1);

          // Test parameter in the path + middleware that transforms the body
          preRequestEventHandler.mockImplementationOnce((event: AdapterPreRequestEvent) => {
            expect(event.getRequest()).toBeInstanceOf(AbstractRequest);
            expect(event.getResponse()).toBeInstanceOf(AbstractResponse);
            expect(event.getAdapter()).toEqual(ADAPTER_NAME);
          });

          preControllerEventHandler.mockImplementationOnce((event: AdapterPreControllerEvent) => {
            expect(event.getController()).toBeInstanceOf(Controller1);
            expect(event.getHandler()).toBe(Controller1.prototype.getAction);
            expect(event.getRequest()).toBeInstanceOf(AbstractRequest);
            expect(event.getResponse()).toBeInstanceOf(AbstractResponse);
            expect(event.getArguments()).toEqual([
              event.getRequest(),
              event.getResponse(),
              event.getAdapter(),
            ]);
            expect(event.getAdapter()).toEqual(ADAPTER_NAME);

            event.setArguments([...event.getArguments(), 'dummy-extra-arg']);
          });

          postControllerEventHandler.mockImplementationOnce((event: AdapterPostControllerEvent) => {
            expect(event.getController()).toBeInstanceOf(Controller1);
            expect(event.getHandler()).toBe(Controller1.prototype.getAction);
            expect(event.getRequest()).toBeInstanceOf(AbstractRequest);
            expect(event.getResponse()).toBeInstanceOf(AbstractResponse);
            expect(event.getReturnedValue()).toEqual('dummy-return-value');
            expect(event.getAdapter()).toEqual(ADAPTER_NAME);
          });

          postRequestEventHandler.mockImplementationOnce((event: AdapterPostRequestEvent) => {
            expect(event.getRequest()).toBeInstanceOf(AbstractRequest);
            expect(event.getResponse()).toBeInstanceOf(AbstractResponse);
            expect(event.getAdapter()).toEqual(ADAPTER_NAME);
          });

          const res1 = await axios.get(`http://localhost:${port}/controller1/get/test1`);
          expect(res1.data).toEqual({
            param: 'test1',
            extraArg: 'dummy-extra-arg',
            transformed: true,
          });
          expect(res1.headers['x-powered-by']).toBeUndefined();
          expect(preRequestEventHandler).toHaveBeenCalledTimes(1);
          expect(postRequestEventHandler).toHaveBeenCalledTimes(1);
          expect(preControllerEventHandler).toHaveBeenCalledTimes(1);
          expect(postControllerEventHandler).toHaveBeenCalledTimes(1);

          // Test request body
          const res2 = await axios.post(`http://localhost:${port}/controller1/post`, {
            param: 'test2',
          });
          expect(res2.data).toEqual({
            param: 'test2',
            transformed: true,
          });

          // Test error catching middleware
          let error1: AxiosError;
          try {
            await axios.delete(`http://localhost:${port}/controller2/delete/4242`);
          } catch (e) {
            error1 = e;
          }

          expect(error1!).toBeInstanceOf(Error);
          expect(error1!.response?.status).toEqual(500);
          expect(error1!.response?.data).toEqual({
            message: 'error with id: 4242',
            adapter: 'express-4.17.1',
          });

          // Test that middleware are not called when controller has ended the request
          const res3 = await axios.put(`http://localhost:${port}/controller2/put`);
          expect(res3.data).toEqual({ message: 'Request ended by controller' });

          // Test thar errors in the middlewares are also caught
          let error2: AxiosError;
          try {
            await axios.get(
              `http://localhost:${port}/controller1/get/test1?error=middleware_error`,
            );
          } catch (e) {
            error2 = e;
          }
          expect(error2!).toBeInstanceOf(Error);
          expect(error2!.response?.status).toEqual(500);
          expect(error2!.response?.data).toEqual({
            message: 'middleware_error',
            adapter: 'express-4.17.1',
          });

          // Test that controllers are not called when the request has ended in a middleware
          const res4 = await axios.get(
            `http://localhost:${port}/controller1/get/test1?endRequest=1`,
          );
          expect(res4.data).toEqual({
            message: 'Request ended by middleware',
          });

          // Test 404 error
          notFoundEventHandler.mockImplementationOnce((event: AdapterNotFoundEvent) => {
            expect(event.getRequest()).toBeInstanceOf(AbstractRequest);
            expect(event.getResponse()).toBeInstanceOf(AbstractResponse);
            expect(event.getAdapter()).toEqual(ADAPTER_NAME);
          });

          let error3: AxiosError;
          try {
            await axios.get(`http://localhost:${port}/non-existing-path`);
          } catch (e) {
            error3 = e;
          }

          expect(notFoundEventHandler).toHaveBeenCalledTimes(1);
          expect(error3!).toBeInstanceOf(Error);
          expect(error3!.response?.status).toEqual(404);
          expect(error3!.response?.data).toEqual('Not found');
        });
      });

      describe('#stop', () => {
        it('should stop the server', async () => {
          serverStoppedEventHandler.mockImplementationOnce((event: AdapterServerStoppedEvent) => {
            expect(event.getAdapter()).toEqual(ADAPTER_NAME);
          });

          await adapter.stop();

          expect(serverStoppedEventHandler).toHaveBeenCalledTimes(1);

          let error: AxiosError;
          try {
            await axios.get(`http://localhost:${port}/controller1/get/test1`);
          } catch (e) {
            error = e;
          }

          expect(error!).toBeDefined();
          expect(error!.code).toEqual('ECONNREFUSED');
        });

        it('should throw an error if an error happens while stopping the server', async () => {
          const createServerMock = jest.spyOn(http, 'createServer');

          await adapter.start({ port });
          const server: http.Server = createServerMock.mock.results[0].value;

          const error = new Error('close error');
          jest.spyOn(server, 'close').mockImplementation((callback: any) => callback(error));

          let thrownError: Error;
          try {
            await adapter.stop();
          } catch (e) {
            thrownError = e;
          }

          expect(thrownError!).toBeInstanceOf(Error);
          expect(thrownError!.message).toEqual('close error');
          jest.restoreAllMocks();
          server.close();
        });

        it('should do nothing and not fail if the server has not been started', async () => {
          let error: Error;
          const newAdapter = new ExpressAdapter(
            {
              settings: {
                'x-powered-by': false,
              },
            },
            eventManager,
          );
          try {
            await newAdapter.stop();
          } catch (e) {
            error = e;
          }

          expect(error!).toBeUndefined();
        });
      });
    });

    describe('secured server', () => {
      const certificate = `-----BEGIN CERTIFICATE-----
MIIDFjCCAf4CCQDYUuUSZJem/jANBgkqhkiG9w0BAQsFADBNMQswCQYDVQQGEwJG
UjEOMAwGA1UECAwFUGFyaXMxDjAMBgNVBAcMBVBhcmlzMQ4wDAYDVQQKDAVCb3Jp
czEOMAwGA1UECwwFQm9yaXMwHhcNMjAxMDMxMTQzMjUxWhcNMjExMDMxMTQzMjUx
WjBNMQswCQYDVQQGEwJGUjEOMAwGA1UECAwFUGFyaXMxDjAMBgNVBAcMBVBhcmlz
MQ4wDAYDVQQKDAVCb3JpczEOMAwGA1UECwwFQm9yaXMwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQDMqoHR7BhpfkMS1PM1HAMU0poZGKydfQFQxR1m1I/8
FTPu/Sg6BRDuOWg/HkAfk/a4uDGQy6sotrcSWpO9kCMLmEOx92aGSwIqVMJayHpg
KPB4/pmZ5qPyxfc3EzVDVsItDY5qxfZMNgOtpL03B6CcK93kNkIL16QBNaAollZt
YQc0qxin9fvmSRle12wICKhcFNZoAYOM3zjQ7moqaJFFKiYGyq7UcDyLL8sSo+bn
5BAgxyDYXt97NIrzhyHvSeLOs0MHYQUD/kZx5rRDapzdJoAFWkUoc7kFKCjXx9K+
YY98Ydm2RB/RuvImhQVc7SpXemPfUSAu1b3Cn6q5RLyPAgMBAAEwDQYJKoZIhvcN
AQELBQADggEBAHvoWlCG9CAq+cyFtBi5r8PJUGfprspd2I6KcobnZ8fFiJiGmrR9
bmAgbaqglIn6AuwckCvs7yYTwAX5fkv662TQOPWBmkRcqZnAoY5EOGQAF5XnKHha
hSnkyeQescuiMVZ4VBLEeIFkOUrUZ8e3ia//w3cYacuRSzmeng+oIntEqu8rFquU
1l5oV3mUK6U/s4IQtvIaXiEE2LvlOLFzYCdwQqLypRFUnZLaFlGxWyynb0yRTCeD
AXtcpgt2K0jQKuLEBOBf2McXJRZXqsYLL7J09PQdTnbErZ1lrgsGNWX+cGfPUj18
60ZH+b/zfHVk48rIhFkKewmJqe3uWoKLeBk=
-----END CERTIFICATE-----`;

      const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMqoHR7BhpfkMS
1PM1HAMU0poZGKydfQFQxR1m1I/8FTPu/Sg6BRDuOWg/HkAfk/a4uDGQy6sotrcS
WpO9kCMLmEOx92aGSwIqVMJayHpgKPB4/pmZ5qPyxfc3EzVDVsItDY5qxfZMNgOt
pL03B6CcK93kNkIL16QBNaAollZtYQc0qxin9fvmSRle12wICKhcFNZoAYOM3zjQ
7moqaJFFKiYGyq7UcDyLL8sSo+bn5BAgxyDYXt97NIrzhyHvSeLOs0MHYQUD/kZx
5rRDapzdJoAFWkUoc7kFKCjXx9K+YY98Ydm2RB/RuvImhQVc7SpXemPfUSAu1b3C
n6q5RLyPAgMBAAECggEAXEaT+X2lFAslWpxAezWB/iVl7OK/ENKHgU8eDnrP4Cv/
GkVxmZcnJwEjCzIsXxBrMKV7U3lAVj7rE49bBSCzbEreWqLcyreO5l8Isb2pzykm
IqdHwafHS3IOH/q9DPtU2NM/3swaXAoOZn/b/6+krkTo6je8V3KGMzVmXGZL2UwT
c9abN/9kkHCFczMXeC3z2U7E4BHWXAV9LnQH5OGg3jD++GkulfHXpX7V6Ze1vQUX
cBR8uVpEgnDkfUQmm77TOj0WoXyS90ku1lDZVBhF+Xb2ePhykD4ZEPhgZSwsWein
d8YRXagNA1Q4Q6wXksiz0Fj2blvGNUihadOtZ/0AYQKBgQDnu/WMtMRwY++iP1AR
sRAzwYpcbXrVvfMbkC0jx2mlqCjA28Jf/rVUnVV+VTXtvvYeZ2xzDyw4cUO4j07G
00iwwlN3ls6+EhQmGJ2WqTBQypRwlEXlX4GTFyd0ZRFpCqkTGKNfhVK9RpLHwSGF
aKY6CQzDptQc5amftbpVIcBhIwKBgQDiGPAxIUwe712/CSL3rpE3cXOVv2o9iwiX
NMDxVZIoBPSqo9/xaUoWr2HOzFofGe8Mm0YfBipja3vVj6NNxJdU+MqGqTSQls3U
P+unJFDf5dJ8Qq9tQovVd77qvWPij/KOeeAnDhoU/XCiPFGfxxV/WuXAmEHIHqj+
CsW8NanrpQKBgCghF3ufTik8VSIenqoBpJGh4WjyGIRtGW1bgUWh4byrKyuCot1m
yVX2zPhMn0Mlf49yT4h5RyobCyQpxPWPXxYlALlD51do4A5c0uVlNRW4jw4TzyrS
aCjlqJJychpjmzXQXXJMLzDRyNdIrZphre9847X57N94MfCTUsotRxhLAoGBAIul
V4UgycE5mq9JV12fZnXWDsvo5BeK7g1mOd1VOuaY2P0kJkcW/vmv7TsrIGahP/KL
XO4AguHRGzU2eGiqCcYjvAMcMyky24JC0Kv1VDZV3oF9NpjHR1LbmQGnZDAlNG0n
fXjhzt40AwNROiDzd6WnYMxpvgd6WGpAAQ1UH9U5AoGAdbBmZwhFI6mBomwOQ1ZR
d6QDcbKhIpnDMhc8gU4KM+o2+gvKFSvBfcHXDn5shJn/jZCxzYz9zX6TK7nqOaEG
fY6ZRu1ubKpTASih/IySLSHdA9HhNtgh42ZqYkO4HLMPBd32Qgbok2YA0iqK2Fsb
ezJ2DuJUnGLk5wyLyEau5cQ=
-----END PRIVATE KEY-----`;

      it('should allow to start a server using HTTPS', async () => {
        await adapter.start({ port, isSecured: true, certificate, privateKey });

        const res1 = await axios
          .create({
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          })
          .get(`https://localhost:${port}/controller1/get/test1`);
        expect(res1.data).toEqual({
          param: 'test1',
          transformed: true,
        });

        await adapter.stop();
      });
    });
  });
});
