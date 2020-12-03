import { AbstractController } from '..';
import { HTTP_METHOD } from '../../http';

describe('webserver/controller', () => {
  describe('AbstractController', () => {
    class DummyController extends AbstractController {}
    const controller = new DummyController();

    describe('#addRoute / #getRoutes', () => {
      it('should not have routes by default', () => {
        expect(controller.getRoutes()).toEqual([]);
      });

      it('should allow to add routes', () => {
        const handler1 = () => undefined;
        const handler2 = () => undefined;

        controller.addRoute(HTTP_METHOD.GET, '/whatever1', handler1);
        controller.addRoute(HTTP_METHOD.POST, '/whatever2', handler2);

        expect(controller.getRoutes()).toEqual([
          [HTTP_METHOD.GET, '/whatever1', handler1],
          [HTTP_METHOD.POST, '/whatever2', handler2],
        ]);
      });
    });
  });
});
