import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";
const container = new Container({ autoBindInjectable: true });
//container.bind<IdGenerator>(IdGenerator).toSelf();
export { container };
export const { lazyInject } = getDecorators(container);
//# sourceMappingURL=inversify.config.js.map