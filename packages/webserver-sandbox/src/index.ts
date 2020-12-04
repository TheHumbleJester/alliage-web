/* eslint-disable max-classes-per-file */
import { CommandOptions, Sandbox } from 'alliage-sandbox';
import getPort from 'get-port';
import axios, { AxiosInstance } from 'axios';

interface WebserverOptions {
  isSecure?: boolean;
  port?: number;
  commandOptions?: CommandOptions;
  environment?: string;
  timeout?: number;
}

export class TimeoutExceededError extends Error {
  constructor(public stdout: string, public stderr: string) {
    super('Timeout Exceeded.');
  }
}

export class WebserverSandbox {
  private sandbox: Sandbox;

  private command: ReturnType<Sandbox['run']> | undefined;

  private started = false;

  private client: AxiosInstance | undefined;

  constructor(sandbox: Sandbox) {
    this.sandbox = sandbox;
  }

  async start({
    isSecure = false,
    port,
    commandOptions,
    environment = 'production',
    timeout = 5000,
  }: WebserverOptions = {}) {
    const serverPort = port ?? (await getPort());
    this.command = this.sandbox.run(
      ['web', serverPort.toString(), `--env=${environment}`],
      commandOptions,
    );
    this.client = axios.create({
      baseURL: `http${isSecure ? 's' : ''}://localhost:${serverPort}`,
    });
    await new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const timer = setTimeout(
        () => reject(new TimeoutExceededError(output, errorOutput)),
        timeout,
      );
      this.command!.process.stderr!.on('data', (data) => {
        errorOutput += data;
      });
      this.command!.process.stdout!.on('data', (data) => {
        output += data;
        if (/Webserver started - Listening on: \d+/g.test(output)) {
          clearTimeout(timer);
          this.started = true;
          resolve();
        }
      });
    });
  }

  private throwIfNotStarted() {
    if (!this.started) {
      throw new Error('Server has not been started yet.');
    }
  }

  getClient() {
    this.throwIfNotStarted();
    return this.client!;
  }

  getProcess() {
    this.throwIfNotStarted();
    return this.command!.process;
  }

  stop() {
    this.throwIfNotStarted();
    const promise = this.command!.waitCompletion();
    this.command!.process.kill();
    return promise;
  }

  static create(sandbox: Sandbox) {
    return new WebserverSandbox(sandbox);
  }
}
