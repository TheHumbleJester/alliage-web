import { AbstractMiddleware } from '../middleware';
import { AbstractController } from '../controller';

export enum REQUEST_PHASE {
  PRE_CONTROLLER = 'PRE_CONTROLLER',
  POST_CONTROLLER = 'POST_CONTROLLER',
}

export type ServerOptions = {
  port: number;
  host?: string;
} & (
  | {
      isSecured: true;
      privateKey: string;
      certificate: string;
    }
  | {
      isSecured?: false;
    }
);

export abstract class AbstractAdapter {
  abstract setMiddlewares(middlewares: AbstractMiddleware[]): this;

  abstract setControllers(controllers: AbstractController[]): this;

  abstract start(options: ServerOptions): Promise<void>;

  abstract stop(): Promise<void>;
}
