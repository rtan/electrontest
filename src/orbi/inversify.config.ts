import {Container} from "inversify";
import getDecorators from "inversify-inject-decorators";
import IdGenerator from "orbi/renderer/services/idGenerator/IdGenerator";

const container = new Container({autoBindInjectable: true});
//container.bind<IdGenerator>(IdGenerator).toSelf();

export {container};
export const {lazyInject} = getDecorators(container);
