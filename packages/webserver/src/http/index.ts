export enum HTTP_METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  CONNECT = 'CONNECT',
  TRACE = 'TRACE',
}

// eslint-disable-next-line no-use-before-define
export type ParamsValue = string | string[] | Params | Params[];
export type Params = { [key: string]: ParamsValue };
