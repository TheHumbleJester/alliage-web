import { Sandbox } from 'alliage-sandbox';

import { WebserverSandbox } from '../../packages/webserver-sandbox/src';

describe('Main scenario', () => {
  const sandbox = new Sandbox({
    scenarioPath: __dirname,
  });

  const webserverSandbox = new WebserverSandbox(sandbox);

  beforeAll(async () => {
    await sandbox.init();
  });

  afterAll(async () => {
    await webserverSandbox.stop();
    await sandbox.clear();
  });

  it('should install correctly the alliage-webserver package', async () => {
    const { waitCompletion } = await sandbox.install(['alliage-webserver', '--env=development']);

    await waitCompletion();
  });

  it('should install correctly the alliage-webserver-express package', async () => {
    const { waitCompletion } = await sandbox.install([
      'alliage-webserver-express',
      '--env=development',
    ]);

    await waitCompletion();
  });

  it('should start a webserver', async () => {
    await webserverSandbox.start();

    const res = await webserverSandbox.getClient().get('/');

    expect(res.status).toEqual(200);
    expect(res.data).toEqual({ message: 'Hello world!' });
  });

  it('should be able to read params in the URL', async () => {
    const res = await webserverSandbox.getClient().get('/test/foo/bar');

    expect(res.status).toEqual(200);
    expect(res.data).toEqual({ PARAM1: 'foo', PARAM2: 'bar' });
  });

  it('should be able to use a native middleware to parse a JSON request body', async () => {
    const res = await webserverSandbox
      .getClient()
      .post('/test-post', { param1: 'foo', param2: 'BAR' });

    expect(res.status).toEqual(200);
    expect(res.data).toEqual({ MESSAGE: 'foo BAR' });
  });
});
