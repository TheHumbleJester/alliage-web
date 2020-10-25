import { Socket } from 'net';

import { Request as NativeRequest } from 'express';

import { HTTP_METHOD } from '../../../../webserver/src/http';
import { Request } from '../request';

describe('webserver-express/http/request', () => {
  describe('Request', () => {
    const dummySocket = new Socket();
    const dummyRequest = {
      baseUrl: 'DUMMY_BASE_URL',
      body: undefined,
      cookies: { DUMMY_COOKIE: 'DUMMY_COOKIE_VALUE' },
      fresh: true,
      hostname: 'DUMMY_HOSTNAME',
      ip: 'DUMMY_IP',
      ips: ['DUMMY_IP'],
      method: HTTP_METHOD.POST,
      originalUrl: 'DUMMY_ORIGINAL_URL',
      params: {
        DUMMY_PARAM1: 'DUMMY_PARAM_VALUE1',
        DUMMY_PARAM2: 'DUMMY_PARAM_VALUE2',
      },
      path: 'DUMMY_PATH',
      protocol: 'DUMMY_PROTOCOL',
      query: {
        DUMMY_QUERY_PARAM1: 'DUMMY_QUERY_PARAM_VALUE1',
        DUMMY_QUERY_PARAM2: 'DUMMY_QUERY_PARAM_VALUE2',
      },
      secure: true,
      signedCookies: { DUMMY_SIGNED_COOKIE: 'DUMMY_SIGNED_COOKIE_VALUE' },
      stale: false,
      subdomains: ['DUMMY_SUBDOMAIN1', 'DUMMY_SUBDOMAIN2'],
      xhr: true,
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
      header: jest.fn(),
      is: jest.fn(),
      aborted: false,
      complete: true,
      destroy: jest.fn(),
      httpVersion: 'DUMMY_HTTP_VERSION',
      socket: dummySocket,
      trailers: {
        DUMMY_TRAILER1: 'DUMMY_TRAILER_VALUE1',
        DUMMY_TRAILER2: 'DUMMY_TRAILER_VALUE2',
      },
      on: jest.fn(),
      dummyExtraProperty: 'DUMMY_EXTRA_PROPERTY_VALUE',
    };
    const request = new Request((dummyRequest as unknown) as NativeRequest);

    beforeEach(() => {
      jest.resetAllMocks();
    });

    describe('#getBaseUrl', () => {
      it('should return the base URL', () => {
        expect(request.getBaseUrl()).toEqual('DUMMY_BASE_URL');
      });
    });

    describe('#setBody / #getBody', () => {
      it('should allow to set and get the request body', () => {
        expect(request.getBody()).toBeUndefined();
        request.setBody('DUMMY_BODY');
        expect(request.getBody()).toEqual('DUMMY_BODY');
      });
    });

    describe('#getCookies', () => {
      it('should return the cookies', () => {
        expect(request.getCookies()).toEqual({ DUMMY_COOKIE: 'DUMMY_COOKIE_VALUE' });
      });
    });

    describe('#isFresh', () => {
      it('should determine whether or not the request is fresh', () => {
        expect(request.isFresh()).toBe(true);
      });
    });

    describe('#getHostName', () => {
      it('should return the host name', () => {
        expect(request.getHostName()).toEqual('DUMMY_HOSTNAME');
      });
    });

    describe('#getIP', () => {
      it('should return the IP', () => {
        expect(request.getIP()).toEqual('DUMMY_IP');
      });
    });

    describe('#getIPs', () => {
      it('should return all the IPs', () => {
        expect(request.getIPs()).toEqual(['DUMMY_IP']);
      });
    });

    describe('#getMethod', () => {
      it('should return the HTTP method', () => {
        expect(request.getMethod()).toEqual(HTTP_METHOD.POST);
      });
    });

    describe('#getOriginalUrl', () => {
      it('should return the original url', () => {
        expect(request.getOriginalUrl()).toEqual('DUMMY_ORIGINAL_URL');
      });
    });

    describe('#getParams', () => {
      it('should return the params from the URL', () => {
        expect(request.getParams()).toEqual({
          DUMMY_PARAM1: 'DUMMY_PARAM_VALUE1',
          DUMMY_PARAM2: 'DUMMY_PARAM_VALUE2',
        });
      });
    });

    describe('#getPath', () => {
      it('should return the path', () => {
        expect(request.getPath()).toEqual('DUMMY_PATH');
      });
    });

    describe('#getProtocol', () => {
      it('should return the protocol', () => {
        expect(request.getProtocol()).toEqual('DUMMY_PROTOCOL');
      });
    });

    describe('#getQuery', () => {
      it('should return the query parameters', () => {
        expect(request.getQuery()).toEqual({
          DUMMY_QUERY_PARAM1: 'DUMMY_QUERY_PARAM_VALUE1',
          DUMMY_QUERY_PARAM2: 'DUMMY_QUERY_PARAM_VALUE2',
        });
      });
    });

    describe('#isSecure', () => {
      it('should determine if the request is secure or not', () => {
        expect(request.isSecure()).toEqual(true);
      });
    });

    describe('#getSignedCookies', () => {
      it('should return the signed cookies', () => {
        expect(request.getSignedCookies()).toEqual({
          DUMMY_SIGNED_COOKIE: 'DUMMY_SIGNED_COOKIE_VALUE',
        });
      });
    });

    describe('#isStale', () => {
      it('should determine whether or not the request is stale or not', () => {
        expect(request.isStale()).toBe(false);
      });
    });

    describe('#getSubdomains', () => {
      it('should return the subdomains', () => {
        expect(request.getSubdomains()).toEqual(['DUMMY_SUBDOMAIN1', 'DUMMY_SUBDOMAIN2']);
      });
    });

    describe('#isXHR', () => {
      it("should determine whether or not it's an XML HTTP Request", () => {
        expect(request.isXHR()).toEqual(true);
      });
    });

    describe('#accepts', () => {
      it('should return the accepted response format', () => {
        dummyRequest.accepts.mockReturnValueOnce('json');

        expect(request.accepts(['html', 'json'])).toEqual('json');
        expect(dummyRequest.accepts).toHaveBeenCalledWith(['html', 'json']);
      });
    });

    describe('#acceptsCharsets', () => {
      it('should return the accepted response charsets', () => {
        dummyRequest.acceptsCharsets.mockReturnValueOnce('utf-8');

        expect(request.acceptsCharsets(['utf-8', 'iso-8859-1'])).toEqual('utf-8');
        expect(dummyRequest.acceptsCharsets).toHaveBeenCalledWith(['utf-8', 'iso-8859-1']);
      });
    });

    describe('#acceptsEncodings', () => {
      it('should return the accepted response encodings', () => {
        dummyRequest.acceptsEncodings.mockReturnValueOnce('gzip');

        expect(request.acceptsEncodings(['gzip', 'compress'])).toEqual('gzip');
        expect(dummyRequest.acceptsEncodings).toHaveBeenCalledWith(['gzip', 'compress']);
      });
    });

    describe('#acceptsLanguages', () => {
      it('should return the accepted response languages', () => {
        dummyRequest.acceptsLanguages.mockReturnValueOnce('en-US');

        expect(request.acceptsLanguages(['en-US', 'no-NO'])).toEqual('en-US');
        expect(dummyRequest.acceptsLanguages).toHaveBeenCalledWith(['en-US', 'no-NO']);
      });
    });

    describe('#getHeader', () => {
      it('should return the corresponding header', () => {
        dummyRequest.header.mockReturnValueOnce('application/json');

        expect(request.getHeader('content-type')).toEqual('application/json');
        expect(dummyRequest.header).toHaveBeenCalledWith('content-type');
      });
    });

    describe('#is', () => {
      it('should return the matching content type', () => {
        dummyRequest.is.mockReturnValueOnce('json');

        expect(request.is(['html', 'json'])).toEqual('json');
        expect(dummyRequest.is).toHaveBeenCalledWith(['html', 'json']);
      });
    });

    describe('#isAborted', () => {
      it('should determine whether or not the request has been aborted', () => {
        expect(request.isAborted()).toEqual(false);
      });
    });

    describe('#isComplete', () => {
      it('should determine whether or not the request is complete', () => {
        expect(request.isComplete()).toEqual(true);
      });
    });

    describe('#destroy', () => {
      it('should destroy the request', () => {
        const dummyError = new Error();
        request.destroy(dummyError);

        expect(dummyRequest.destroy).toHaveBeenCalledWith(dummyError);
      });
    });

    describe('#getHttpVersion', () => {
      it('should return the HTTP version', () => {
        expect(request.getHttpVersion()).toEqual('DUMMY_HTTP_VERSION');
      });
    });

    describe('#getSocket', () => {
      it('should return the request socket', () => {
        expect(request.getSocket()).toEqual(dummySocket);
      });
    });

    describe('#getTrailers', () => {
      it('should return the trailers', () => {
        expect(request.getTrailers()).toEqual({
          DUMMY_TRAILER1: 'DUMMY_TRAILER_VALUE1',
          DUMMY_TRAILER2: 'DUMMY_TRAILER_VALUE2',
        });
      });
    });

    describe('#onClose', () => {
      it('should allow to listen to the "close" event', () => {
        const dummyCallback = () => undefined;
        request.onClose(dummyCallback);

        expect(dummyRequest.on).toHaveBeenCalledWith('close', dummyCallback);
      });
    });

    describe('#onAborted', () => {
      it('should allow to listen to the "aborted" event', () => {
        const dummyCallback = () => undefined;
        request.onAborted(dummyCallback);

        expect(dummyRequest.on).toHaveBeenCalledWith('aborted', dummyCallback);
      });
    });

    describe('#getReadableStream', () => {
      it('should return the readable stream', () => {
        expect(request.getReadableStream()).toBe(dummyRequest);
      });
    });

    describe('#setExtraPayload / #getExtraPayload', () => {
      it('should look in the native request for extra  properties', () => {
        expect(request.getExtraPayload('dummyExtraProperty')).toEqual('DUMMY_EXTRA_PROPERTY_VALUE');
      });

      it('should allow to set an extra property', () => {
        request.setExtraPayload('foo', 'BAR');
        expect(request.getExtraPayload('foo')).toEqual('BAR');
      });
    });

    describe('#getNativeRequest', () => {
      it('should return the native request', () => {
        expect(request.getNativeRequest()).toEqual(dummyRequest);
      });
    });
  });
});
