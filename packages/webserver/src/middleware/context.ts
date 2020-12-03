import { AbstractRequest } from '../http/request';
import { AbstractResponse } from '../http/response';

export class Context {
  constructor(
    private request: AbstractRequest,
    private response: AbstractResponse,
    private adapter: string,
  ) {}

  getRequest() {
    return this.request;
  }

  getResponse() {
    return this.response;
  }

  getAdapter() {
    return this.adapter;
  }
}
