import { allInstancesOf, Constructor, instanceOf, parameter } from 'alliage-di/dependencies';
import { ServiceContainer } from 'alliage-di/service-container';
import { AbstractLifeCycleAwareModule } from 'alliage-lifecycle/module';
import { CONFIG_EVENTS } from 'alliage-config-loader/events';
import { loadConfig } from 'alliage-config-loader/helpers';
import { validate } from 'alliage-config-loader/validators/json-schema';

import { AbstractAdapter } from './adapter';
import { AbstractController } from './controller';
import { AbstractMiddleware } from './middleware';
import { WebProcess } from './process';
import { CONFIG_NAME, schema } from './config';

export = class WebserverModule extends AbstractLifeCycleAwareModule {
  getEventHandlers() {
    return {
      [CONFIG_EVENTS.LOAD]: loadConfig(CONFIG_NAME, validate(schema)),
    };
  }

  registerServices(serviceContainer: ServiceContainer) {
    serviceContainer.registerService('web-process', WebProcess, [
      parameter(CONFIG_NAME),
      instanceOf(<Constructor>AbstractAdapter),
      allInstancesOf(<Constructor>AbstractMiddleware),
      allInstancesOf(<Constructor>AbstractController),
    ]);
  }
};
