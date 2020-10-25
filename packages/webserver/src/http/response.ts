/* eslint-disable max-classes-per-file */
import { Writable, Duplex } from 'stream';

import { ParamsValue } from '.';

interface CookieOptions {
  domain?: string;
  encode?: (value: string) => string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  signed?: boolean;
  sameSite?: boolean | string;
}

export class BodyAlreadySetError extends Error {
  constructor() {
    super("Can't send data when the body has been set.");
  }
}

export abstract class AbstractResponse<B = string | Buffer | object, N = any> {
  // Express response
  abstract headersAreSent(): boolean;

  abstract append(field: string, value: string | string[]): this;

  abstract addAttachment(filename?: string): this;

  abstract setCookie(name: string, value: ParamsValue, options: CookieOptions): this;

  abstract clearCookie(name: string, options: CookieOptions): this;

  abstract end(): void;

  abstract getHeader(name: string): string | number | string[] | undefined;

  abstract setHeader(name: string, value: string): this;

  abstract removeHeader(name: string): this;

  abstract redirect(url: string, code?: number): this;

  abstract send(body: string | Buffer | object): this;

  abstract setBody(body: B): this;

  abstract getBody(): B | undefined;

  abstract setStatus(status: number): this;

  abstract getStatus(): number;

  // Http.ServerResponse
  abstract onClose(callback: () => any): this;

  abstract onFinish(callback: () => any): this;

  abstract isFinished(): boolean;

  abstract isClosed(): boolean;

  abstract getWritableStream(): Writable;

  abstract addTrailers(headers: { [name: string]: string }): this;

  abstract getConnection(): Duplex | null;

  abstract writeHeaders(code: number, headers: { [name: string]: string }): this;

  abstract flushHeaders(): this;

  abstract getNativeResponse(): N;
}
