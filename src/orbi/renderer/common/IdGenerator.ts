import "reflect-metadata";
import { injectable } from 'inversify'

@injectable()
export default class IdGenerator {
    public makeUniqueId(): string {
        return new Date().getTime().toString(16)  + Math.floor(1000*Math.random()).toString(16);
    }
}