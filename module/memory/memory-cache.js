"use strict";

const memory_cache = require("memory-cache");
const debug = require("debug")("bot-express:memory");
Promise = require("bluebird");

class MemoryMemoryCache {
    constructor(options){
        this.client = memory_cache;
    }

    get(key){
        return new Promise((resolve, reject) => {
            try {
                return resolve(this.client.get(key));
            } catch(e) {
                return reject(e);
            }
        });
    }

    put(key, value, retention){
        return new Promise((resolve, reject) => {
            try {
                return resolve(this.client.put(key, value, retention * 1000));
            } catch(e) {
                return reject(e);
            }
        });
    }

    del(key){
        return new Promise((resolve, reject) => {
            try {
                return resolve(this.client.del(key));
            } catch(e) {
                return reject(e);
            }
        });
    }
}

module.exports = MemoryMemoryCache;
