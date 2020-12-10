// eslint-disable-next-line max-classes-per-file
import { Arguments, CommandBuilder } from 'alliage/core/utils/cli';

import { WebProcess } from '..';
import { AbstractAdapter, REQUEST_PHASE } from '../../adapter';
import { AbstractController } from '../../controller';
import { AbstractMiddleware } from '../../middleware';

class DummyAdapter extends AbstractAdapter {
  setMiddlewares = jest.fn().mockReturnThis();

  setControllers = jest.fn().mockReturnThis();

  start = jest.fn().mockResolvedValue(undefined);

  stop = jest.fn().mockResolvedValue(undefined);
}

class DummyController1 extends AbstractController {}
class DummyController2 extends AbstractController {}

function createMiddleware(
  name: string,
  after: () => typeof AbstractMiddleware[] = () => [],
  before: () => typeof AbstractMiddleware[] = () => [],
) {
  class Middleware extends AbstractMiddleware {
    public name = name;

    getRequestPhase = () => REQUEST_PHASE.PRE_CONTROLLER;

    applyBefore = () => before();

    applyAfter = () => after();

    apply() {
      // empty
    }
  }

  return Middleware;
}

let Middleware2: any;
let Middleware3: any;
let Middleware4: any;
let Middleware5: any;
let Middleware6: any;

const Middleware1 = createMiddleware(
  'Middleware1',
  () => [],
  () => [Middleware2!],
);
Middleware2 = createMiddleware(
  'Middleware2',
  () => [],
  () => [Middleware3!],
);
Middleware3 = createMiddleware(
  'Middleware3',
  () => [Middleware1!],
  () => [Middleware4!],
);
Middleware4 = createMiddleware(
  'Middleware4',
  () => [],
  () => [Middleware5!, Middleware6!],
);
Middleware5 = createMiddleware('Middleware5', () => [Middleware1, Middleware3!]);
Middleware6 = createMiddleware('Middleware6', () => [Middleware1, Middleware3!]);

describe('webserver/process', () => {
  describe('WebProcess', () => {
    const middleware1 = new Middleware1();
    const middleware2 = new Middleware2();
    const middleware3 = new Middleware3();
    const middleware4 = new Middleware4();
    const middleware5 = new Middleware5();
    const middleware6 = new Middleware6();

    const controller1 = new DummyController1();
    const controller2 = new DummyController2();

    const adapter = new DummyAdapter();

    const processWriteSpy = jest.spyOn(process.stdout, 'write');

    const webProcess = new WebProcess(
      {
        port: 4242,
        host: 'localhost',
      },
      adapter,
      [middleware3, middleware2, middleware4, middleware1, middleware5, middleware6],
      [controller1, controller2],
    );

    describe('#getName', () => {
      it('should return the process name', () => {
        expect(webProcess.getName()).toEqual('web');
      });
    });

    describe('#configure', () => {
      const commandBuilder = CommandBuilder.create();
      webProcess.configure(commandBuilder);

      expect(commandBuilder.getArguments()).toEqual([
        { name: 'port', type: 'number', describe: "Server's port", default: 4242 },
      ]);
    });

    describe('#execute', () => {
      beforeAll(async () => {
        const args = Arguments.create({ port: 4242 });
        setTimeout(() => webProcess.shutdown(true), 1);
        await webProcess.execute(args);
      });

      it('should set the middleware in the right order on the adapter', () => {
        expect(adapter.setMiddlewares).toHaveBeenCalledWith([
          middleware1,
          middleware2,
          middleware3,
          middleware4,
          middleware5,
          middleware6,
        ]);
      });

      it('should set the controllers on the adapter', () => {
        expect(adapter.setControllers).toHaveBeenLastCalledWith([controller1, controller2]);
      });

      it('should start the adapter', () => {
        expect(adapter.start).toHaveBeenCalledWith({
          port: 4242,
          host: 'localhost',
        });
      });

      it('should display a message containing the port when the server is started', () => {
        expect(processWriteSpy).toHaveBeenCalledWith('Webserver started - Listening on: 4242\n');
      });
    });

    describe('#terminate', () => {
      it('should stop the adapter', async () => {
        await webProcess.terminate();
        expect(adapter.stop).toHaveBeenCalled();
      });
    });
  });
});
