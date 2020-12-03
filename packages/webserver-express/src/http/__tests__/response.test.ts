import { Socket } from 'net';

import { Response as NativeResponse } from 'express';

import { BodyAlreadySetError } from '../../../../webserver/src/http/response';
import { Response } from '../response';

describe('webserver-express/http/response', () => {
  describe('Response', () => {
    const redirectMock = jest.fn();
    const statusMock = jest.fn();
    const writeHeadMock = jest.fn();
    const dummySocket = new Socket();
    const dummyResponse = {
      headersSent: true,
      append: jest.fn(),
      attachment: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      send: jest.fn(),
      end: jest.fn(),
      format: jest.fn(),
      getHeader: jest.fn(),
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
      redirect: redirectMock,
      status: statusMock,
      on: jest.fn(),
      writableEnded: false,
      addTrailers: jest.fn(),
      writeHead: writeHeadMock,
      flushHeaders: jest.fn(),
      socket: dummySocket,
    };

    const response = new Response((dummyResponse as unknown) as NativeResponse);
    let onCloseCallback: Function;
    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('#constructor', () => {
      it('should listen to the "close" event', () => {
        expect(dummyResponse.on).toHaveBeenCalledWith('close', expect.any(Function));

        // eslint-disable-next-line prefer-destructuring
        onCloseCallback = dummyResponse.on.mock.calls[0][1];
      });
    });

    describe('#headersAreSent', () => {
      it('should determine whether or not headers have been sent', () => {
        expect(response.headersAreSent()).toBe(true);
      });
    });

    describe('#append', () => {
      it('should append a value to the header of the response', () => {
        response.append('Content-Language', 'en-US');

        expect(dummyResponse.append).toHaveBeenCalledWith('Content-Language', 'en-US');
      });
    });

    describe('#addAttachement', () => {
      it('should add an attachement to the response', () => {
        response.addAttachment('/path/to/file');

        expect(dummyResponse.attachment).toHaveBeenCalledWith('/path/to/file');
      });
    });

    describe('#setCookie', () => {
      it('should set a cookie', () => {
        response.setCookie('dummy-cookie-key', 'dummy-cookie-value', { secure: true });

        expect(dummyResponse.cookie).toHaveBeenCalledWith(
          'dummy-cookie-key',
          'dummy-cookie-value',
          { secure: true },
        );
      });
    });

    describe('#clearCookie', () => {
      it('should clear a cookie', () => {
        response.clearCookie('dummy-cookie-key', { sameSite: true });

        expect(dummyResponse.clearCookie).toHaveBeenCalledWith('dummy-cookie-key', {
          sameSite: true,
        });
      });
    });

    describe('#getHeader', () => {
      it('should return a header value', () => {
        dummyResponse.getHeader.mockReturnValueOnce('application/json');

        expect(response.getHeader('Content-Type')).toEqual('application/json');
        expect(dummyResponse.getHeader).toHaveBeenCalledWith('Content-Type');
      });
    });

    describe('#setHeader', () => {
      it('should allow to set a header', () => {
        response.setHeader('Content-Type', 'application/json');

        expect(dummyResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      });
    });

    describe('#removeHeader', () => {
      it('should allow to remove a header', () => {
        response.removeHeader('Content-Type');

        expect(dummyResponse.removeHeader).toHaveBeenCalledWith('Content-Type');
      });
    });

    describe('#redirect', () => {
      it('should allow to redirect', () => {
        response.redirect('/new/path');

        expect(redirectMock).toHaveBeenCalledWith('/new/path', 301);
        expect(response.getStatus()).toEqual(301);
      });

      it('should allow to define a specific code', () => {
        response.redirect('/new/path', 302);

        expect(redirectMock).toHaveBeenCalledWith('/new/path', 302);
        expect(response.getStatus()).toEqual(302);
      });
    });

    describe('#setStatus', () => {
      it('should allow to change the response status code', () => {
        response.setStatus(404);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(response.getStatus()).toEqual(404);
      });
    });

    describe('#setBody', () => {
      it('should allow to set the response body', () => {
        response.setBody({ data: 'content' });

        expect(response.getBody()).toEqual({ data: 'content' });
      });
    });

    describe('#send', () => {
      it('should throw an error is the body is  already set', () => {
        expect(() => response.send('test')).toThrow(new BodyAlreadySetError());
      });

      it('should allow to send date', () => {
        response.setBody(undefined as any);
        response.send({ data: 'content' });

        expect(dummyResponse.send).toHaveBeenCalledWith({ data: 'content' });
      });
    });

    describe('#onClose', () => {
      it('should allow to listen to the close event', () => {
        const closeMock = () => undefined;
        response.onClose(closeMock);

        expect(dummyResponse.on).toHaveBeenCalledWith('close', closeMock);
      });
    });

    describe('#onFinish', () => {
      it('should allow to listen to the finish event', () => {
        const finishMock = () => undefined;
        response.onFinish(finishMock);

        expect(dummyResponse.on).toHaveBeenCalledWith('finish', finishMock);
      });
    });

    describe('#isClosed', () => {
      it('should determine whether or not the request has been closed', () => {
        expect(response.isClosed()).toBe(false);

        onCloseCallback();

        expect(response.isClosed()).toBe(true);
      });
    });

    describe('#isFinished', () => {
      it('should determine whether or not the request has finished or not', () => {
        expect(response.isFinished()).toEqual(false);
      });
    });

    describe('#getWritableStream', () => {
      it('should return the writable stream', () => {
        expect(response.getWritableStream()).toBe(dummyResponse);
      });
    });

    describe('#addTrailers', () => {
      it('should allow to add trailers', () => {
        response.addTrailers({ 'Content-Type': 'application/json' });

        expect(dummyResponse.addTrailers).toHaveBeenCalledWith({
          'Content-Type': 'application/json',
        });
      });
    });

    describe('#getConnection', () => {
      it('should return the socket', () => {
        expect(response.getConnection()).toBe(dummySocket);
      });
    });

    describe('#writeHeaders', () => {
      it('should allow to write the headers', () => {
        response.writeHeaders(201, { 'Content-Type': 'application/json' });

        expect(writeHeadMock).toHaveBeenCalledWith(201, { 'Content-Type': 'application/json' });
        expect(response.getStatus()).toEqual(201);
      });
    });

    describe('#flushHeaders', () => {
      it('should allow to flush the headers', () => {
        response.flushHeaders();

        expect(dummyResponse.flushHeaders).toHaveBeenCalled();
      });
    });

    describe('#getNativeResponse', () => {
      it('should return the native response', () => {
        expect(response.getNativeResponse()).toBe(dummyResponse);
      });

      it('should keep the status updated if changes happen on the native response', () => {
        response.getNativeResponse().status(500);
        expect(response.getStatus()).toEqual(500);

        response.getNativeResponse().redirect(302, 'path');
        expect(response.getStatus()).toEqual(302);

        response.getNativeResponse().redirect('path', 301);
        expect(response.getStatus()).toEqual(301);

        response.getNativeResponse().redirect('path');
        expect(response.getStatus()).toEqual(302);
      });
    });

    describe('#end', () => {
      it('should end de response and send the body content', () => {
        response.setBody({ data: 'content' });
        response.end();

        expect(dummyResponse.end).toHaveBeenCalled();
        expect(dummyResponse.send).toHaveBeenCalledWith({ data: 'content' });
      });

      it('should just end the response if there is no body', () => {
        response.setBody(undefined as any);
        response.end();

        expect(dummyResponse.end).toHaveBeenCalled();
        expect(dummyResponse.send).not.toHaveBeenCalled();
      });

      it('should do nothing if the response is finished', () => {
        dummyResponse.writableEnded = true;
        response.end();

        expect(dummyResponse.end).not.toHaveBeenCalled();
        expect(dummyResponse.send).not.toHaveBeenCalled();
      });
    });
  });
});
