import { REQUEST_PHASE } from '../adapter';

import { Context } from './context';

export abstract class AbstractMiddleware {
  applyBefore = (): Array<typeof AbstractMiddleware> => [];

  applyAfter = (): Array<typeof AbstractMiddleware> => [];

  abstract getRequestPhase(): REQUEST_PHASE;

  abstract apply(context: Context, error?: Error): Promise<void> | void;
}
