import { EventEmitter } from 'events';

import nock from 'nock';
import { Sandbox } from 'alliage-sandbox';

import { TimeoutExceededError, WebserverSandbox } from '..';

function createSandbox() {
  const dummySandbox = {
    run: jest.fn(),
  };
  const webserverSandbox = WebserverSandbox.create((dummySandbox as unknown) as Sandbox);

  return { webserverSandbox, dummySandbox };
}

function startSandbox(options?: Parameters<WebserverSandbox['start']>[0]) {
  const { webserverSandbox, dummySandbox } = createSandbox();
  const dummyProcess = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: jest.fn(),
  });
  dummySandbox.run.mockReturnValueOnce({
    process: dummyProcess,
  });
  const promise = webserverSandbox.start(options);

  return {
    webserverSandbox,
    dummyProcess,
    dummySandbox,
    promise,
  };
}

describe('webserver-sandbox', () => {
  describe('WebserverSandbox', () => {
    describe('#start', () => {
      it('should use the sandbox to start the server', async () => {
        const { dummySandbox, dummyProcess, promise } = startSandbox({
          port: 8080,
          commandOptions: {
            env: { FOO: 'BAR' },
          },
        });

        expect(dummySandbox.run).toHaveBeenCalledWith(['web', '8080', '--env=production'], {
          env: { FOO: 'BAR' },
        });

        dummyProcess.stdout.emit('data', 'Webserver started - Listening on: 8080\n');

        await promise;
      });

      it('should raise a timeout error when the server takes to much time to start', async () => {
        const { dummyProcess, promise } = startSandbox({
          port: 8080,
          timeout: 100,
        });

        dummyProcess.stdout.emit('data', 'test stdout');
        dummyProcess.stderr.emit('data', 'test stderr');

        let error: TimeoutExceededError;
        try {
          await promise;
        } catch (e) {
          error = e;
        }

        expect(error!).toBeInstanceOf(TimeoutExceededError);
        expect(error!.stdout).toEqual('test stdout');
        expect(error!.stderr).toEqual('test stderr');
      });
    });

    describe('#getClient', () => {
      it('should return a client allowing to make request on the server', async () => {
        const { dummyProcess, promise, webserverSandbox } = startSandbox({
          port: 8080,
        });

        dummyProcess.stdout.emit('data', 'Webserver started - Listening on: 8080\n');
        await promise;

        const serverNock = nock('http://localhost:8080').get('/test').reply(200, 'OK');

        const res = await webserverSandbox.getClient().get('/test');

        serverNock.done();
        expect(res.status).toEqual(200);
        expect(res.data).toEqual('OK');
      });

      it('should perform HTTPS requests if the server is secured', async () => {
        const { dummyProcess, promise, webserverSandbox } = startSandbox({
          port: 443,
          isSecure: true,
        });

        dummyProcess.stdout.emit('data', 'Webserver started - Listening on: 443\n');
        await promise;

        const serverNock = nock('https://localhost:443').get('/test').reply(200, 'OK');

        const res = await webserverSandbox.getClient().get('/test');

        serverNock.done();
        expect(res.status).toEqual(200);
        expect(res.data).toEqual('OK');
      });

      it('should choose a port by automatically if none is provided', async () => {
        const { dummyProcess, promise, webserverSandbox } = startSandbox();

        setTimeout(() => {
          dummyProcess.stdout.emit('data', 'Webserver started - Listening on: 8080\n');
        }, 0);

        await promise;

        const serverNock = nock(/http:\/\/localhost:\d+/)
          .get('/test')
          .reply(200, 'OK');

        const res = await webserverSandbox.getClient().get('/test');

        serverNock.done();
        expect(res.status).toEqual(200);
        expect(res.data).toEqual('OK');
      });

      it('should throw an error if the sandbox is not started yet', () => {
        const { webserverSandbox } = createSandbox();

        expect(() => webserverSandbox.getClient()).toThrowError('Server has not been started yet.');
      });
    });

    describe('#getProcess', () => {
      it('should return the child process', async () => {
        const { dummyProcess, promise, webserverSandbox } = startSandbox({
          port: 8080,
        });

        dummyProcess.stdout.emit('data', 'Webserver started - Listening on: 8080\n');

        await promise;
        expect(webserverSandbox.getProcess()).toBe(dummyProcess);
      });

      it('should throw an error if the sandbox is not started', () => {
        const { webserverSandbox } = createSandbox();

        expect(() => webserverSandbox.getProcess()).toThrowError(
          'Server has not been started yet.',
        );
      });
    });

    describe('#stop', () => {
      it('should stop the process', async () => {
        const { dummyProcess, promise, webserverSandbox } = startSandbox({
          port: 8080,
        });

        dummyProcess.stdout.emit('data', 'Webserver started - Listening on: 8080\n');
        await promise;

        const stopPromise = webserverSandbox.stop();

        expect(dummyProcess.kill).toHaveBeenCalled();

        dummyProcess.emit('exit');

        await stopPromise;
      });
    });
  });
});
