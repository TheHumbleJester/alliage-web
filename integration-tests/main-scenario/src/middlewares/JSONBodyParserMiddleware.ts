import bodyParser from 'body-parser';
import { createNativeMiddleware } from 'alliage-webserver-express/middleware/native-middleware';
import { Service } from 'alliage-service-loader/decorators';

export default Service('json-body-parser-middleware')(
  createNativeMiddleware(bodyParser.json, {
    args: () => [{ strict: true }],
  }),
);
