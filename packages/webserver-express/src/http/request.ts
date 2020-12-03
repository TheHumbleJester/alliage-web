import { Duplex } from 'stream';

import { Request as NativeRequest } from 'express';
import { AbstractRequest } from 'alliage-webserver/http/request';
import { HTTP_METHOD, Params } from 'alliage-webserver/http';

export class Request<B = any> extends AbstractRequest<B, NativeRequest> {
  private extraPayload: Record<string, unknown> = {};

  constructor(private nativeRequest: NativeRequest) {
    super();
  }

  getBaseUrl() {
    return this.nativeRequest.baseUrl;
  }

  getBody(): B {
    return this.nativeRequest.body;
  }

  setBody(body: B) {
    this.nativeRequest.body = body;
    return this;
  }

  getCookies() {
    return this.nativeRequest.cookies;
  }

  isFresh() {
    return this.nativeRequest.fresh;
  }

  getHostName() {
    return this.nativeRequest.hostname;
  }

  getIP() {
    return this.nativeRequest.ip;
  }

  getIPs() {
    return this.nativeRequest.ips;
  }

  getMethod() {
    return this.nativeRequest.method as HTTP_METHOD;
  }

  getOriginalUrl() {
    return this.nativeRequest.originalUrl;
  }

  getParams() {
    return this.nativeRequest.params;
  }

  getPath() {
    return this.nativeRequest.path;
  }

  getProtocol(): string {
    return this.nativeRequest.protocol;
  }

  getQuery() {
    return this.nativeRequest.query as Params;
  }

  isSecure() {
    return this.nativeRequest.secure;
  }

  getSignedCookies() {
    return this.nativeRequest.signedCookies;
  }

  isStale() {
    return this.nativeRequest.stale;
  }

  getSubdomains() {
    return this.nativeRequest.subdomains;
  }

  isXHR() {
    return this.nativeRequest.xhr;
  }

  accepts(accept?: string | string[]) {
    return this.nativeRequest.accepts(accept as any) as any;
  }

  acceptsCharsets(accept?: string | string[]) {
    return this.nativeRequest.acceptsCharsets(accept as any) as any;
  }

  acceptsEncodings(accept?: string | string[]) {
    return this.nativeRequest.acceptsEncodings(accept as any) as any;
  }

  acceptsLanguages(accept?: string | string[]) {
    return this.nativeRequest.acceptsLanguages(accept as any) as any;
  }

  getHeader(name: string) {
    return this.nativeRequest.header(name);
  }

  is(type: string | string[]) {
    return this.nativeRequest.is(type as any);
  }

  // Http.IncomingMessage
  isAborted() {
    return this.nativeRequest.aborted;
  }

  isComplete() {
    return this.nativeRequest.complete;
  }

  destroy(error?: Error) {
    this.nativeRequest.destroy(error);
    return this;
  }

  getHttpVersion() {
    return this.nativeRequest.httpVersion;
  }

  getSocket(): Duplex {
    return this.nativeRequest.socket;
  }

  getTrailers() {
    return this.nativeRequest.trailers;
  }

  onClose(callback: () => any) {
    this.nativeRequest.on('close', callback);
    return this;
  }

  onAborted(callback: () => any) {
    this.nativeRequest.on('aborted', callback);
    return this;
  }

  getReadableStream() {
    return this.nativeRequest;
  }

  getExtraPayload<T = any>(name: string) {
    const req: any = this.nativeRequest;
    return (req[name] ?? this.extraPayload[name]) as T;
  }

  setExtraPayload<T>(name: string, value: T) {
    this.extraPayload[name] = value;
    return this;
  }

  getNativeRequest() {
    return this.nativeRequest;
  }
}
