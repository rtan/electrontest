"use strict";

export default class Util {
    public static makeUniqueId(): string {
        return new Date().getTime().toString(16)  + Math.floor(1000*Math.random()).toString(16);
    }
}