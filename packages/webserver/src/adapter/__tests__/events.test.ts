import { AbstractController, RouteHandler } from '../../controller';
import { AbstractRequest } from '../../http/request';
import { AbstractResponse } from '../../http/response';
import {
  AdapterNotFoundEvent,
  AdapterPostControllerEvent,
  AdapterPostRequestEvent,
  AdapterPreControllerEvent,
  AdapterPreRequestEvent,
  AdapterServerStartedEvent,
  AdapterServerStoppedEvent,
  ADAPTER_EVENTS,
} from '../events';

describe('webserver/adapter/events', () => {
  const dummyRequest = ({} as unknown) as AbstractRequest;
  const dummyResponse = ({} as unknown) as AbstractResponse;

  describe('AdapterPreRequestEvent', () => {
    const event = new AdapterPreRequestEvent(dummyRequest, dummyResponse, 'dummy-adapter');

    describe('#getType', () => {
      it('should return the ADAPTER_EVENTS.PRE_REQUEST event type', () => {
        expect(event.getType()).toEqual(ADAPTER_EVENTS.PRE_REQUEST);
      });
    });

    describe('#getRequest', () => {
      it('should return the request', () => {
        expect(event.getRequest()).toBe(dummyRequest);
      });
    });

    describe('#getResponse', () => {
      it('should return the response', () => {
        expect(event.getResponse()).toBe(dummyResponse);
      });
    });

    describe('#getAdapter', () => {
      it('should return the adapter', () => {
        expect(event.getAdapter()).toEqual('dummy-adapter');
      });
    });
  });

  describe('AdapterPostRequestEvent', () => {
    const event = new AdapterPostRequestEvent(dummyRequest, dummyResponse, 'dummy-adapter');

    describe('#getType', () => {
      it('should return the ADAPTER_EVENTS.POST_REQUEST event type', () => {
        expect(event.getType()).toEqual(ADAPTER_EVENTS.POST_REQUEST);
      });
    });

    describe('#getRequest', () => {
      it('should return the request', () => {
        expect(event.getRequest()).toBe(dummyRequest);
      });
    });

    describe('#getResponse', () => {
      it('should return the response', () => {
        expect(event.getResponse()).toBe(dummyResponse);
      });
    });

    describe('#getAdapter', () => {
      it('should return the adapter', () => {
        expect(event.getAdapter()).toEqual('dummy-adapter');
      });
    });
  });

  describe('AdapterNotFoundEvent', () => {
    const event = new AdapterNotFoundEvent(dummyRequest, dummyResponse, 'dummy-adapter');

    describe('#getType', () => {
      it('should return the ADAPTER_EVENTS.NOT_FOUND event type', () => {
        expect(event.getType()).toEqual(ADAPTER_EVENTS.NOT_FOUND);
      });
    });

    describe('#getRequest', () => {
      it('should return the request', () => {
        expect(event.getRequest()).toBe(dummyRequest);
      });
    });

    describe('#getResponse', () => {
      it('should return the response', () => {
        expect(event.getResponse()).toBe(dummyResponse);
      });
    });

    describe('#getAdapter', () => {
      it('should return the adapter', () => {
        expect(event.getAdapter()).toEqual('dummy-adapter');
      });
    });
  });

  describe('AdapterPreControllerEvent', () => {
    const dummyController = ({} as unknown) as AbstractController;
    const dummyHandler = (() => undefined) as RouteHandler;
    const event = new AdapterPreControllerEvent(
      dummyController,
      dummyHandler,
      dummyRequest,
      dummyResponse,
      ['arg1', 'arg2', 'arg3'],
      'dummy-adapter',
    );

    describe('#getType', () => {
      it('should return the ADAPTER_EVENTS.PRE_CONTROLLER event type', () => {
        expect(event.getType()).toEqual(ADAPTER_EVENTS.PRE_CONTROLLER);
      });
    });

    describe('#getController', () => {
      it('should return the controller', () => {
        expect(event.getController()).toBe(dummyController);
      });
    });

    describe('#getHandler', () => {
      it('should return the handler', () => {
        expect(event.getHandler()).toBe(dummyHandler);
      });
    });

    describe('#getRequest', () => {
      it('should return the request', () => {
        expect(event.getRequest()).toBe(dummyRequest);
      });
    });

    describe('#getResponse', () => {
      it('should return the response', () => {
        expect(event.getResponse()).toBe(dummyResponse);
      });
    });

    describe('#getArguments / #setArguments', () => {
      it('should return the arguments', () => {
        expect(event.getArguments()).toEqual(['arg1', 'arg2', 'arg3']);
      });

      it('should allow to update the arguments', () => {
        event.setArguments(['arg4', 'arg5']);

        expect(event.getArguments()).toEqual(['arg4', 'arg5']);
      });
    });

    describe('#getAdapter', () => {
      it('should return the adapter', () => {
        expect(event.getAdapter()).toEqual('dummy-adapter');
      });
    });
  });

  describe('AdapterPostControllerEvent', () => {
    const dummyController = ({} as unknown) as AbstractController;
    const dummyHandler = (() => undefined) as RouteHandler;
    const event = new AdapterPostControllerEvent(
      dummyController,
      dummyHandler,
      dummyRequest,
      dummyResponse,
      'dummy-returned-value',
      'dummy-adapter',
    );

    describe('#getType', () => {
      it('should return the ADAPTER_EVENTS.POST_CONTROLLER event type', () => {
        expect(event.getType()).toEqual(ADAPTER_EVENTS.POST_CONTROLLER);
      });
    });

    describe('#getController', () => {
      it('should return the controller', () => {
        expect(event.getController()).toBe(dummyController);
      });
    });

    describe('#getHandler', () => {
      it('should return the handler', () => {
        expect(event.getHandler()).toBe(dummyHandler);
      });
    });

    describe('#getRequest', () => {
      it('should return the request', () => {
        expect(event.getRequest()).toBe(dummyRequest);
      });
    });

    describe('#getResponse', () => {
      it('should return the response', () => {
        expect(event.getResponse()).toBe(dummyResponse);
      });
    });

    describe('#getReturnedValue', () => {
      it('should return the returned value', () => {
        expect(event.getReturnedValue()).toEqual('dummy-returned-value');
      });
    });

    describe('#getAdapter', () => {
      it('should return the adapter', () => {
        expect(event.getAdapter()).toEqual('dummy-adapter');
      });
    });
  });

  describe('AdapterServerStartedEvent', () => {
    const event = new AdapterServerStartedEvent({ port: 8080 }, 'dummy-adapter');

    describe('#getType', () => {
      it('should return the ADAPTER_EVENTS.SERVER_STARTED event type', () => {
        expect(event.getType()).toEqual(ADAPTER_EVENTS.SERVER_STARTED);
      });
    });

    describe('#getOptions', () => {
      it('should return the options', () => {
        expect(event.getOptions()).toEqual({ port: 8080 });
      });
    });

    describe('#getAdapter', () => {
      it('should return the adapter', () => {
        expect(event.getAdapter()).toEqual('dummy-adapter');
      });
    });
  });

  describe('AdapterServerStoppedEvent', () => {
    const event = new AdapterServerStoppedEvent('dummy-adapter');

    describe('#getType', () => {
      it('should return the ADAPTER_EVENTS.SERVER_STOPPED event type', () => {
        expect(event.getType()).toEqual(ADAPTER_EVENTS.SERVER_STOPPED);
      });
    });

    describe('#getAdapter', () => {
      it('should return the adapter', () => {
        expect(event.getAdapter()).toEqual('dummy-adapter');
      });
    });
  });
});
