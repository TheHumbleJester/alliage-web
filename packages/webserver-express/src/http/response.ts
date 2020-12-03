import { Response as NativeResponse, CookieOptions } from 'express';
import { ParamsValue } from 'alliage-webserver/http';
import { AbstractResponse, BodyAlreadySetError } from 'alliage-webserver/http/response';

export class Response<B = string | Buffer | object> extends AbstractResponse<B, NativeResponse> {
  private responseIsClosed = false;

  private body: B | undefined;

  private status: number = 200;

  constructor(private nativeResponse: NativeResponse) {
    super();
    const originalStatus = nativeResponse.status;
    // eslint-disable-next-line no-param-reassign
    nativeResponse.status = (code: number) => {
      this.status = code;
      return originalStatus.call(nativeResponse, code);
    };

    const originalRedirect = nativeResponse.redirect;
    // eslint-disable-next-line no-param-reassign
    nativeResponse.redirect = (arg1: any, arg2?: any) => {
      const result = originalRedirect.call(nativeResponse, arg1, arg2);
      if (typeof arg1 === 'number') {
        this.status = arg1;
      } else if (typeof arg2 === 'number') {
        this.status = arg2;
      } else {
        this.status = 302;
      }
      return result;
    };

    const originalWriteHeaders = nativeResponse.writeHead;
    // eslint-disable-next-line no-param-reassign
    nativeResponse.writeHead = (code: number, ...args: any[]) => {
      this.status = code;
      return originalWriteHeaders.call(nativeResponse, code, ...args);
    };

    nativeResponse.on('close', () => {
      this.responseIsClosed = true;
    });
  }

  // Express response
  headersAreSent() {
    return this.nativeResponse.headersSent;
  }

  append(field: string, value: string | string[]) {
    this.nativeResponse.append(field, value);
    return this;
  }

  addAttachment(filename?: string) {
    this.nativeResponse.attachment(filename);
    return this;
  }

  setCookie(name: string, value: ParamsValue, options: CookieOptions) {
    this.nativeResponse.cookie(name, value, options);
    return this;
  }

  clearCookie(name: string, options: CookieOptions) {
    this.nativeResponse.clearCookie(name, options);
    return this;
  }

  end() {
    if (!this.isFinished()) {
      if (this.body) {
        this.nativeResponse.send(this.body);
      }
      this.nativeResponse.end();
    }
  }

  getHeader(name: string) {
    return this.nativeResponse.getHeader(name);
  }

  setHeader(name: string, value: string) {
    this.nativeResponse.setHeader(name, value);
    return this;
  }

  removeHeader(name: string) {
    this.nativeResponse.removeHeader(name);
    return this;
  }

  redirect(url: string, code: number = 301) {
    this.nativeResponse.redirect(url, code);
    return this;
  }

  send(body: string | Buffer | object) {
    this.throwIfBodyIsSet();
    this.nativeResponse.send(body);
    return this;
  }

  setBody(body: B) {
    this.body = body;
    return this;
  }

  getBody() {
    return this.body;
  }

  setStatus(status: number) {
    this.nativeResponse.status(status);
    return this;
  }

  getStatus() {
    return this.status;
  }

  // Http.ServerResponse
  onClose(callback: () => any) {
    this.nativeResponse.on('close', callback);
    return this;
  }

  onFinish(callback: () => any) {
    this.nativeResponse.on('finish', callback);
    return this;
  }

  isFinished() {
    return this.nativeResponse.writableEnded;
  }

  isClosed() {
    return this.responseIsClosed;
  }

  getWritableStream() {
    return this.nativeResponse;
  }

  addTrailers(headers: { [name: string]: string }) {
    this.nativeResponse.addTrailers(headers);
    return this;
  }

  getConnection() {
    return this.nativeResponse.socket;
  }

  writeHeaders(code: number, headers: { [name: string]: string }) {
    this.nativeResponse.writeHead(code, headers);
    return this;
  }

  flushHeaders() {
    this.nativeResponse.flushHeaders();
    return this;
  }

  getNativeResponse() {
    return this.nativeResponse;
  }

  private throwIfBodyIsSet() {
    if (this.body) {
      throw new BodyAlreadySetError();
    }
  }
}
