import { DEPENDENCY, instanceOf, ParameterDependency } from 'alliage-di/dependencies';
import { ServiceContainer } from 'alliage-di/service-container';
import { validate } from 'alliage-config-loader/validators/json-schema';
import { loadConfig } from 'alliage-config-loader/helpers';
import { CONFIG_EVENTS } from 'alliage-config-loader/events';
import { EventManager } from 'alliage-lifecycle/event-manager';

import { schema, CONFIG_NAME } from '../config';
import WebserverExpressModule from '..';
import { ExpressAdapter } from '../adapter';

jest.mock('alliage-config-loader/validators/json-schema');
jest.mock('alliage-config-loader/helpers');

describe('webserver-express', () => {
  describe('WebserverExpressModule', () => {
    const module = new WebserverExpressModule();

    describe('#getEventHandlers', () => {
      it('should listen to CONFIG_EVENTS.LOAD events', () => {
        const validateMockReturnValue = () => undefined;
        const loadConfigMockReturnValue = () => undefined;
        (validate as jest.Mock).mockReturnValueOnce(validateMockReturnValue);
        (loadConfig as jest.Mock).mockReturnValueOnce(loadConfigMockReturnValue);

        expect(module.getEventHandlers()).toEqual({
          [CONFIG_EVENTS.LOAD]: loadConfigMockReturnValue,
        });

        expect(validate).toHaveBeenCalledWith(schema);
        expect(loadConfig).toHaveBeenCalledWith(CONFIG_NAME, validateMockReturnValue);
      });
    });

    describe('#registerServices', () => {
      it('should register the web process', () => {
        const serviceContainer = new ServiceContainer();
        const registerServiceSpy = jest.spyOn(serviceContainer, 'registerService');

        module.registerServices(serviceContainer);

        expect(registerServiceSpy).toHaveBeenCalledWith(
          'webserver-express-adapter',
          ExpressAdapter,
          [
            expect.objectContaining({
              type: DEPENDENCY.PARAMETER,
              getter: expect.any(Function),
            }),
            instanceOf(EventManager),
          ],
        );
        const parameterDependency: ParameterDependency = registerServiceSpy.mock
          .calls[0][2]![0] as any;
        const parameters = { [CONFIG_NAME]: 'ok' };
        expect(parameterDependency.getter(parameters)).toEqual('ok');
      });
    });
  });
});
