import { CONFIG_EVENTS } from 'alliage-config-loader/events';
import { loadConfig } from 'alliage-config-loader/helpers';
import { validate } from 'alliage-config-loader/validators/json-schema';
import { instanceOf, parameter } from 'alliage-di/dependencies';
import { ServiceContainer } from 'alliage-di/service-container';
import { EventManager } from 'alliage-lifecycle/event-manager';
import { AbstractLifeCycleAwareModule } from 'alliage-lifecycle/module';

import { ExpressAdapter } from './adapter';
import { CONFIG_NAME, schema } from './config';

export = class WebserverExpressModule extends AbstractLifeCycleAwareModule {
  getEventHandlers() {
    return {
      [CONFIG_EVENTS.LOAD]: loadConfig(CONFIG_NAME, validate(schema)),
    };
  }

  registerServices(serviceContainer: ServiceContainer) {
    serviceContainer.registerService('webserver-express-adapter', ExpressAdapter, [
      parameter((parameters: any) => parameters[CONFIG_NAME]),
      instanceOf(EventManager),
    ]);
  }
};
