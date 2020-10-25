import { AbstractController } from '..';
import { HTTP_METHOD } from '../../http';
import { Connect, Delete, Get, Head, Options, Post, Put, Trace } from '../decorations';

describe('webserver/controller/decorations', () => {
  class DummyController extends AbstractController {
    @Get('/test-get')
    testGet() {
      // empty
    }

    @Post('/test-post')
    testPost() {
      // empty
    }

    @Put('/test-put')
    testPut() {
      // empty
    }

    @Delete('/test-delete')
    testDelete() {
      // empty
    }

    @Head('/test-head')
    testHead() {
      // empty
    }

    @Options('/test-options')
    testOptions() {
      // empty
    }

    @Connect('/test-connect')
    testConnect() {
      // empty
    }

    @Trace('/test-trace')
    testTrace() {
      // empty
    }
  }

  const controller = new DummyController();

  describe('Get', () => {
    it('should register a GET route', () => {
      expect(controller.getRoutes()).toContainEqual([
        HTTP_METHOD.GET,
        '/test-get',
        controller.testGet,
      ]);
    });
  });

  describe('Post', () => {
    it('should register a POST route', () => {
      expect(controller.getRoutes()).toContainEqual([
        HTTP_METHOD.POST,
        '/test-post',
        controller.testPost,
      ]);
    });
  });

  describe('Put', () => {
    it('should register a PUT route', () => {
      expect(controller.getRoutes()).toContainEqual([
        HTTP_METHOD.PUT,
        '/test-put',
        controller.testPut,
      ]);
    });
  });

  describe('Delete', () => {
    it('should register a DELETE route', () => {
      expect(controller.getRoutes()).toContainEqual([
        HTTP_METHOD.DELETE,
        '/test-delete',
        controller.testDelete,
      ]);
    });
  });

  describe('Head', () => {
    it('should register a HEAD route', () => {
      expect(controller.getRoutes()).toContainEqual([
        HTTP_METHOD.HEAD,
        '/test-head',
        controller.testHead,
      ]);
    });
  });

  describe('Options', () => {
    it('should register a OPTIONS route', () => {
      expect(controller.getRoutes()).toContainEqual([
        HTTP_METHOD.OPTIONS,
        '/test-options',
        controller.testOptions,
      ]);
    });
  });

  describe('Connect', () => {
    it('should register a CONNECT route', () => {
      expect(controller.getRoutes()).toContainEqual([
        HTTP_METHOD.CONNECT,
        '/test-connect',
        controller.testConnect,
      ]);
    });
  });

  describe('Trace', () => {
    it('should register a TRACE route', () => {
      expect(controller.getRoutes()).toContainEqual([
        HTTP_METHOD.TRACE,
        '/test-trace',
        controller.testTrace,
      ]);
    });
  });
});
