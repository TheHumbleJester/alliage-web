import { Duplex, Readable } from 'stream';

import { HTTP_METHOD, Params } from '.';

export abstract class AbstractRequest<P = Params, Q = Params, B = any, N = any> {
  // Express Request
  abstract getBaseUrl(): string;

  abstract getBody(): B;

  abstract setBody(body: B): this;

  abstract getCookies(): { [key: string]: string };

  abstract isFresh(): boolean;

  abstract getHostName(): string;

  abstract getIP(): string;

  abstract getIPs(): string[];

  abstract getMethod(): HTTP_METHOD;

  abstract getOriginalUrl(): string;

  abstract getParams(): P;

  abstract getPath(): string;

  abstract getProtocol(): string;

  abstract getQuery(): Q;

  abstract isSecure(): boolean;

  abstract getSignedCookies(): Params;

  abstract isStale(): boolean;

  abstract getSubdomains(): string[];

  abstract isXHR(): boolean;

  abstract accepts(accept: string | string[]): false | string;

  abstract accepts(): string[];

  abstract acceptsCharsets(accept: string | string[]): false | string;

  abstract acceptsCharsets(): string[];

  abstract acceptsEncodings(accept: string | string[]): false | string;

  abstract acceptsEncodings(): string[];

  abstract acceptsLanguages(accept: string | string[]): false | string;

  abstract acceptsLanguages(): string[];

  abstract getHeader(name: string): string | undefined;

  abstract is(type: string | string[]): string | false | null;

  // Http.IncomingMessage
  abstract isAborted(): boolean;

  abstract isComplete(): boolean;

  abstract destroy(error?: Error): this;

  abstract getHttpVersion(): string;

  abstract getSocket(): Duplex;

  abstract getTrailers(): NodeJS.Dict<string>;

  abstract onClose(callback: () => any): this;

  abstract onAborted(callback: () => any): this;

  abstract getReadableStream(): Readable;

  abstract getExtraPayload<T = any>(name: string): T;

  abstract setExtraPayload<T>(name: string, value: T): this;

  abstract getNativeRequest(): N;
}
