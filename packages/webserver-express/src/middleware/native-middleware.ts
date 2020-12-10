import { AbstractMiddleware } from 'alliage-webserver/middleware';
import { Context } from 'alliage-webserver/middleware/context';
import { REQUEST_PHASE } from 'alliage-webserver/adapter';

type Func = (...args: any) => any;

interface Options<T extends Func> {
  requestPhase?: REQUEST_PHASE;
  applyBefore?: Array<typeof AbstractMiddleware>;
  applyAfter?: Array<typeof AbstractMiddleware>;
  args?: (...args: any[]) => [...Parameters<T>] | undefined;
}

export function createNativeMiddleware<T extends Func>(
  nativeMiddleware: T,
  {
    requestPhase = REQUEST_PHASE.PRE_CONTROLLER,
    applyBefore = [],
    applyAfter = [],
    args: argsBuilder,
  }: Options<T> = {},
) {
  return class NativeMiddleware extends AbstractMiddleware {
    public middleware: Func;

    applyBefore = () => applyBefore;

    applyAfter = () => applyAfter;

    getRequestPhase = () => requestPhase;

    constructor(...args: any[]) {
      super();
      const middlewareArgs = argsBuilder && argsBuilder(...args);
      this.middleware = middlewareArgs ? nativeMiddleware(...middlewareArgs) : nativeMiddleware;

      const applyMiddleware = (context: Context, err?: Error) =>
        new Promise<void>((resolve) => {
          const nativeArgs = [
            context.getRequest().getNativeRequest(),
            context.getResponse().getNativeResponse(),
            resolve,
          ];
          this.middleware(
            ...(this.middleware.length > 3 && err ? [err, ...nativeArgs] : nativeArgs),
          );
        });
      this.apply =
        this.middleware.length > 3
          ? (context, err) => applyMiddleware(context, err)
          : (context) => applyMiddleware(context);
    }

    /* istanbul ignore next */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async apply(_context: Context, _err?: Error) {}
  };
}
