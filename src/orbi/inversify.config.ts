import {Container} from "inversify";
import getDecorators from "inversify-inject-decorators";
import IdGenerator from "orbi/renderer/common/IdGenerator";

const container = new Container();
container.bind<IdGenerator>(IdGenerator).toSelf();

export { container };
export const { lazyInject } = getDecorators(container);
