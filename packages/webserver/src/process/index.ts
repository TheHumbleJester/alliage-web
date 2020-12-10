import { AbstractProcess } from 'alliage-process-manager/process';
import { Arguments, CommandBuilder } from 'alliage/core/utils/cli';

import { AbstractAdapter } from '../adapter';
import { Config } from '../config';
import { AbstractController } from '../controller';
import { AbstractMiddleware } from '../middleware';

export class WebProcess extends AbstractProcess {
  private config: Config;

  private adapter: AbstractAdapter;

  private middlewares: AbstractMiddleware[];

  private controllers: AbstractController[];

  constructor(
    config: Config,
    adapter: AbstractAdapter,
    middlewares: AbstractMiddleware[],
    controllers: AbstractController[],
  ) {
    super();
    this.config = config;
    this.adapter = adapter;
    this.middlewares = middlewares;
    this.controllers = controllers;
  }

  getName = () => 'web';

  configure(config: CommandBuilder) {
    config.addArgument('port', {
      describe: "Server's port",
      type: 'number',
      default: this.config.port,
    });
  }

  async execute(args: Arguments) {
    const port = args.get<number>('port');

    await this.adapter
      .setControllers(this.controllers)
      .setMiddlewares(this.getSortedMiddlewares())
      .start({
        ...this.config,
        port,
      });
    process.stdout.write(`Webserver started - Listening on: ${port}\n`);

    return this.waitToBeShutdown();
  }

  async terminate() {
    await this.adapter.stop();
  }

  private getSortedMiddlewares() {
    return this.middlewares.sort((m1, m2) => {
      // m1 before m2
      if (
        m1.applyBefore().includes(m2.constructor as typeof AbstractMiddleware) ||
        m2.applyAfter().includes(m1.constructor as typeof AbstractMiddleware)
      ) {
        return -1;
      }
      // m2 before m1
      if (
        m1.applyAfter().includes(m2.constructor as typeof AbstractMiddleware) ||
        m2.applyBefore().includes(m1.constructor as typeof AbstractMiddleware)
      ) {
        return 1;
      }
      return 0;
    });
  }
}
