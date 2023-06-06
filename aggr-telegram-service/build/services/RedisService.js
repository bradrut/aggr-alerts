"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
const logger = require('pino')();
const REDIS_EX_TTL = 86400; // TTL (in seconds) for Redis records, to be evicted using volatile-ttl eviction policy (see redis.conf)
// Currently: 24hrs
class RedisService {
    constructor() {
        this.redisClient = (0, redis_1.createClient)();
        this.redisClient.on('error', err => console.log('Redis Client Error', err));
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.redisClient.connect();
        });
    }
    getCachedLiquidation(liquidationValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!liquidationValue) {
                logger.error(liquidationValue, "Could not get cached liquidation becaues liquidationValue is zero or undefined");
                throw new Error("Could not get cached liquidation becaues liquidationValue is zero or undefined");
            }
            logger.debug("Retreiving cached liquidation from liquidationValue: " + liquidationValue);
            return yield this.redisClient.get(liquidationValue.toString());
        });
    }
    setCachedLiquidation(liquidationValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!liquidationValue) {
                logger.error(liquidationValue, "Could not set cached liquidation becaues liquidationValue is zero or undefined");
                throw new Error("Could not set cached liquidation becaues liquidationValue is zero or undefined");
            }
            logger.debug("Caching liquidationValue: " + liquidationValue);
            return yield this.redisClient.set(liquidationValue.toString(), liquidationValue.toString(), { EX: REDIS_EX_TTL });
        });
    }
}
exports.RedisService = RedisService;
