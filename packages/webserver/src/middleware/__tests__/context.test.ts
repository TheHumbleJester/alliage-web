import { AbstractRequest } from '../../http/request';
import { AbstractResponse } from '../../http/response';
import { Context } from '../context';

describe('webserver/middleware/context', () => {
  describe('Context', () => {
    const request = {} as AbstractRequest;
    const response = {} as AbstractResponse;

    const context = new Context(request, response, 'test-adapter');

    describe('#getRequest', () => {
      it('should return the request', () => {
        expect(context.getRequest()).toBe(request);
      });

      it('should return the response', () => {
        expect(context.getResponse()).toBe(response);
      });

      it('should return the adapter', () => {
        expect(context.getAdapter()).toEqual('test-adapter');
      });
    });
  });
});
