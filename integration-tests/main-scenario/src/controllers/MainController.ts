import { AbstractController } from 'alliage-webserver/controller';
import { AbstractRequest } from 'alliage-webserver/http/request';
import { AbstractResponse } from 'alliage-webserver/http/response';
import { Get, Post } from 'alliage-webserver/controller/decorations';
import { Service } from 'alliage-service-loader/decorators';

interface PostBody {
  param1: string;
  param2: string;
}

@Service('main-controller')
export default class MainController extends AbstractController {
  @Get('/')
  index(_request: AbstractRequest, response: AbstractResponse) {
    return new Promise((resolve) => {
      setTimeout(() => {
        response
          .setBody({
            message: 'Hello world!',
          })
          .end();
        resolve();
      }, 500);
    });
  }

  @Get('/test/:param1/:param2')
  test(request: AbstractRequest, response: AbstractResponse) {
    response.setBody({
      param1: request.getParams().param1,
      param2: request.getParams().param2,
    });
  }

  @Post('/test-post')
  testPost(request: AbstractRequest<PostBody>, response: AbstractResponse) {
    const { param1, param2 } = request.getBody();
    response.setBody({
      message: `${param1} ${param2}`,
    });
  }
}
