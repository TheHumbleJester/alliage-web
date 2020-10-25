import { HTTP_METHOD } from '../http';

export type RouteHandler = (...args: unknown[]) => Promise<unknown> | unknown;
export type Route = [HTTP_METHOD, string, RouteHandler];

export abstract class AbstractController {
  private routing?: Route[];

  public addRoute(method: HTTP_METHOD, path: string, handler: RouteHandler) {
    if (!this.routing) {
      this.routing = [];
    }
    this.routing.push([method, path, handler]);
  }

  public getRoutes() {
    return this.routing ?? [];
  }
}
