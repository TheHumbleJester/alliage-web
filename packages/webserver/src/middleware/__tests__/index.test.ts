import { AbstractMiddleware } from '..';
import { REQUEST_PHASE } from '../../adapter';

describe('webserver/middleware', () => {
  describe('AbstractMiddleware', () => {
    class DummyMiddleware extends AbstractMiddleware {
      getRequestPhase = () => REQUEST_PHASE.POST_CONTROLLER;

      apply = () => undefined;
    }

    describe('#getDependencies', () => {
      const middleware = new DummyMiddleware();
      it('should return a empty array by default', () => {
        expect(middleware.getDependencies()).toEqual([]);
      });
    });
  });
});
