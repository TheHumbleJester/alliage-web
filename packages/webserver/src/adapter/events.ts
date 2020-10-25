/* eslint-disable max-classes-per-file */
import { AbstractEvent, AbstractWritableEvent } from 'alliage-lifecycle/events';

import { AbstractRequest } from '../http/request';
import { AbstractResponse } from '../http/response';
import { AbstractController, RouteHandler } from '../controller';

import { ServerOptions } from '.';

export enum ADAPTER_EVENTS {
  PRE_REQUEST = '@webserver/ADAPTER_EVENTS/PRE_REQUEST',
  POST_REQUEST = '@webserver/ADAPTER_EVENTS/POST_REQUEST',
  NOT_FOUND = '@webserver/ADAPTER_EVENTS/NOT_FOUND',

  PRE_CONTROLLER = '@webserver/ADAPTER_EVENTS/PRE_CONTROLLER',
  POST_CONTROLLER = '@webserver/ADAPTER_EVENTS/POST_CONTROLLER',

  SERVER_STARTED = '@webserver/ADAPTER_EVENTS/SERVER_STARTED',
  SERVER_STOPPED = '@webserver/ADAPTER_EVENTS/SERVER_STOPPED',
}

export interface AdapterRequestEventPayload {
  request: AbstractRequest;
  response: AbstractResponse;
  adapter: string;
}

class AbstractAdapterRequestEvent extends AbstractEvent<
  ADAPTER_EVENTS,
  AdapterRequestEventPayload
> {
  constructor(
    event: ADAPTER_EVENTS,
    request: AbstractRequest,
    response: AbstractResponse,
    adapter: string,
  ) {
    super(event, { request, response, adapter });
  }

  getRequest() {
    return this.getPayload().request;
  }

  getResponse() {
    return this.getPayload().response;
  }

  getAdapter() {
    return this.getPayload().adapter;
  }
}

export class AdapterPreRequestEvent extends AbstractAdapterRequestEvent {
  constructor(request: AbstractRequest, response: AbstractResponse, adapter: string) {
    super(ADAPTER_EVENTS.PRE_REQUEST, request, response, adapter);
  }
}

export class AdapterPostRequestEvent extends AbstractAdapterRequestEvent {
  constructor(request: AbstractRequest, response: AbstractResponse, adapter: string) {
    super(ADAPTER_EVENTS.POST_REQUEST, request, response, adapter);
  }
}

export class AdapterNotFoundEvent extends AbstractAdapterRequestEvent {
  constructor(request: AbstractRequest, response: AbstractResponse, adapter: string) {
    super(ADAPTER_EVENTS.NOT_FOUND, request, response, adapter);
  }
}

interface AdapterPreControllerEventPayload {
  controller: AbstractController;
  handler: RouteHandler;
  request: AbstractRequest;
  response: AbstractResponse;
  arguments: any[];
  adapter: string;
}

export class AdapterPreControllerEvent extends AbstractWritableEvent<
  ADAPTER_EVENTS,
  AdapterPreControllerEventPayload
> {
  constructor(
    controller: AbstractController,
    handler: RouteHandler,
    request: AbstractRequest,
    response: AbstractResponse,
    args: any[],
    adapter: string,
  ) {
    super(ADAPTER_EVENTS.PRE_CONTROLLER, {
      controller,
      handler,
      request,
      response,
      arguments: args,
      adapter,
    });
  }

  getController() {
    return this.getPayload().controller;
  }

  getHandler() {
    return this.getPayload().handler;
  }

  getRequest() {
    return this.getPayload().request;
  }

  getResponse() {
    return this.getPayload().response;
  }

  getArguments() {
    return this.getWritablePayload().arguments;
  }

  getAdapter() {
    return this.getPayload().adapter;
  }

  setArguments(args: any[]) {
    this.getWritablePayload().arguments = args;
    return this;
  }
}

interface AdapterPostControllerEventPayload {
  controller: AbstractController;
  handler: RouteHandler;
  request: AbstractRequest;
  response: AbstractResponse;
  returnedValue: any;
  adapter: string;
}

export class AdapterPostControllerEvent extends AbstractEvent<
  ADAPTER_EVENTS,
  AdapterPostControllerEventPayload
> {
  constructor(
    controller: AbstractController,
    handler: RouteHandler,
    request: AbstractRequest,
    response: AbstractResponse,
    returnedValue: any,
    adapter: string,
  ) {
    super(ADAPTER_EVENTS.POST_CONTROLLER, {
      controller,
      handler,
      request,
      response,
      returnedValue,
      adapter,
    });
  }

  getController() {
    return this.getPayload().controller;
  }

  getHandler() {
    return this.getPayload().handler;
  }

  getRequest() {
    return this.getPayload().request;
  }

  getResponse() {
    return this.getPayload().response;
  }

  getReturnedValue() {
    return this.getPayload().returnedValue;
  }

  getAdapter() {
    return this.getPayload().adapter;
  }
}

export interface AdapterServerStartedEventPayload {
  options: ServerOptions;
  adapter: string;
}

export class AdapterServerStartedEvent extends AbstractEvent<
  ADAPTER_EVENTS,
  AdapterServerStartedEventPayload
> {
  constructor(options: ServerOptions, adapter: string) {
    super(ADAPTER_EVENTS.SERVER_STARTED, { options, adapter });
  }

  getOptions() {
    return this.getPayload().options;
  }

  getAdapter() {
    return this.getPayload().adapter;
  }
}

interface AdapterServerStoppedEventPayload {
  adapter: string;
}

export class AdapterServerStoppedEvent extends AbstractEvent<
  ADAPTER_EVENTS,
  AdapterServerStoppedEventPayload
> {
  constructor(adapter: string) {
    super(ADAPTER_EVENTS.SERVER_STOPPED, { adapter });
  }

  getAdapter() {
    return this.getPayload().adapter;
  }
}
