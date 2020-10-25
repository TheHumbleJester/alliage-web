import { NextFunction, Request as NativeRequest, Response as NativeResponse } from 'express';

import { REQUEST_PHASE } from '../../../../webserver/src/adapter';
import { AbstractMiddleware } from '../../../../webserver/src/middleware';
import { Context } from '../../../../webserver/src/middleware/context';
import { Request } from '../../http/request';
import { Response } from '../../http/response';
import { createNativeMiddleware } from '../native-middleware';

describe('webserver-express/middleware/native-middleware', () => {
  describe('#createNativeMiddleware', () => {
    describe('simple use case', () => {
      const dummyMiddleware = jest.fn();
      const NativeMiddleware = createNativeMiddleware(dummyMiddleware);

      let middleware: AbstractMiddleware;
      it('should create a middleware', () => {
        middleware = new NativeMiddleware();
        expect(middleware).toBeInstanceOf(AbstractMiddleware);
      });

      it('should have 0 dependencies by default', () => {
        expect(middleware.getDependencies()).toEqual([]);
      });

      it('should have a REQUEST_PHASE.PRE_CONTROLLER by default', () => {
        expect(middleware.getRequestPhase()).toEqual(REQUEST_PHASE.PRE_CONTROLLER);
      });

      it('should have an apply method taking only 1 arg', () => {
        expect(middleware.apply.length).toEqual(1);
      });

      it("should call the middleware when 'apply' method is executed", () => {
        const dummyNativeRequest = ({ dummy: 'request' } as unknown) as NativeRequest;
        const dummyNativeResponse = ({
          dummy: 'response',
          on: () => undefined,
        } as unknown) as NativeResponse;
        const dummyRequest = new Request(dummyNativeRequest);
        const dummyResponse = new Response(dummyNativeResponse);
        const context = new Context(dummyRequest, dummyResponse, 'test-adapter');

        middleware.apply(context);

        expect(dummyMiddleware).toHaveBeenCalledWith(
          dummyNativeRequest,
          dummyNativeResponse,
          expect.any(Function),
        );
      });
    });

    describe('complex use case', () => {
      class DummyDependency extends AbstractMiddleware {
        getRequestPhase = () => REQUEST_PHASE.POST_CONTROLLER;

        apply() {
          // empty
        }
      }
      const dummyMiddleware = jest.fn();
      const dummyMiddlewareCreator = jest
        .fn()
        .mockReturnValue(
          (err: Error, req: NativeRequest, res: NativeResponse, next: NextFunction) =>
            dummyMiddleware(err, req, res, next),
        );
      const argsBuilder = jest.fn().mockReturnValue(['arg1', 'arg2']);
      const NativeMiddleware = createNativeMiddleware(dummyMiddlewareCreator, {
        args: argsBuilder,
        requestPhase: REQUEST_PHASE.POST_CONTROLLER,
        dependencies: [DummyDependency],
      });
      const middleware = new NativeMiddleware('dep1', 'dep2', 'dep3');
      it('should have the dependencies defined during the creation', () => {
        expect(middleware.getDependencies()).toEqual([DummyDependency]);
      });

      it('should have a REQUEST_PHASE.POST_CONTROLLER as defined during the creation', () => {
        expect(middleware.getRequestPhase()).toEqual(REQUEST_PHASE.POST_CONTROLLER);
      });

      it("should have called the 'args' function with the arguments passed to the constructor", () => {
        expect(argsBuilder).toHaveBeenCalledWith('dep1', 'dep2', 'dep3');
      });

      it("should have instanciated the native middleware with the arguments returned by the 'args' function", () => {
        expect(dummyMiddlewareCreator).toHaveBeenCalledWith('arg1', 'arg2');
      });

      it('should have an apply method taking 2 args', () => {
        expect(middleware.apply.length).toEqual(2);
      });

      it("should call the middleware when 'apply' method is executed", () => {
        const error = new Error();
        const dummyNativeRequest = ({ dummy: 'request' } as unknown) as NativeRequest;
        const dummyNativeResponse = ({
          dummy: 'response',
          on: () => undefined,
        } as unknown) as NativeResponse;
        const dummyRequest = new Request(dummyNativeRequest);
        const dummyResponse = new Response(dummyNativeResponse);
        const context = new Context(dummyRequest, dummyResponse, 'test-adapter');

        middleware.apply(context, error);

        expect(dummyMiddleware).toHaveBeenCalledWith(
          error,
          dummyNativeRequest,
          dummyNativeResponse,
          expect.any(Function),
        );
      });
    });
  });
});
