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
exports.LiquidationAlertsService = void 0;
const dependencies_1 = require("../dependencies");
const ApiError_1 = require("../types/ApiError");
const logger = require('pino')();
class LiquidationAlertsService {
    constructor() {
        // Initialize buyThreshold and sellThreshold to -1 to indicate that they have not yet been set by the AGGR client
        this.buyThreshold = -1;
        this.sellThreshold = -1;
        this.pauseAlerts = false;
        this.pausedAt = -1;
    }
    /**
     * Sends a Telegram alert if the liquidationValue is not a duplicate, if it has surpassed the provided
     * thresholds, and if alerts are not currently paused. Note that ALL liquidationValues that surpass the
     * specified thresholds are cached, regardless of whether a Telegram notification is sent.
     */
    processLiquidationAlert(buyThreshold, sellThreshold, liquidationValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.liquidationValueIsDuplicate(liquidationValue)) {
                // Duplicate request; do nothing and return a 409 Conflict
                logger.info('An alert has already been processed for liquidationValue: ' + liquidationValue);
                throw new ApiError_1.ApiError(ApiError_1.HTTP_STATUS.CONFLICT, 'An alert has already been processed for this liquidation');
            }
            // Note that the liquidationSurpassedThreshold() function updates the threshold fields on the alertsService
            if (this.liquidationSurpassedThreshold(buyThreshold, sellThreshold, liquidationValue)) {
                // Cache ALL liquidationValues that have surpassed the thresholds, even if alerts are paused, so that
                // we do not send duplicate or old alerts when the AGGR script box refreshes.
                // Note for debugging purposes that if this is overwriting an existing cached value, the TTL will be reset.
                yield dependencies_1.redisService.setCachedLiquidation(liquidationValue);
            }
            else {
                // This liquidationValue has not surpassed the alertThresholds. Do nothing and return a 204 NO CONTENT.
                logger.info('liquidationValue: ' + liquidationValue + ' has not surpassed the provided alert thresholds');
                throw new ApiError_1.ApiError(ApiError_1.HTTP_STATUS.OK, 'The liquidation has not surpassed the specified thresholds. No alert necessary.');
            }
            if (this.alertsArePaused(liquidationValue)) {
                // Alerts are paused because an alert has already been sent for this threshold crossing
                logger.info("An alert has already been processed for this threshold crossing");
                throw new ApiError_1.ApiError(ApiError_1.HTTP_STATUS.OK, 'An alert has already been processed for this threshold crossing.');
            }
            // The request has passed all criteria to trigger an alert, so send alert via the telegramService
            yield dependencies_1.telegramService.sendTelegramAlertMessage(this.liquidationIsSell(liquidationValue) ? sellThreshold : buyThreshold, liquidationValue);
            // Since a Telegram alert has successfully been sent, pause further alerts until the threshold has been un-crossed
            this.setPauseAlerts(true);
        });
    }
    /**
     * Reset the pauseAlerts flag based on the liquidationValue if necessary, and return the current value of the flag.
     * @param liquidationValue The liquidationValue that has been sent from the client. Resets the pauseAlerts flag if the liquidationValue has dropped back in between the thresholds.
     * @returns The value of the pauseAlerts flag
     */
    alertsArePaused(liquidationValue) {
        // If alerts are paused, determine if they should be unpaused
        if (this.pauseAlerts) {
            // If the current liquidationValue is below both thresholds or it's been 3mins since the last alert, unpause alerts
            let currTimeSecs = new Date().getTime() / 1000;
            if (((liquidationValue < this.buyThreshold) && (liquidationValue > this.sellThreshold))
                || currTimeSecs - this.pausedAt > 180) {
                logger.debug('Resetting pauseAlerts to false');
                this.pauseAlerts = false;
            }
        }
        return this.pauseAlerts;
    }
    setPauseAlerts(pauseAlerts) {
        logger.debug('Setting pauseAlerts to ' + pauseAlerts + '. Alerts above the threshold will still be cached to avoid future duplicates.');
        this.pausedAt = new Date().getTime() / 1000; // Current time in seconds
        this.pauseAlerts = pauseAlerts;
    }
    liquidationValueIsDuplicate(liquidationValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let cachedLiquidation = yield dependencies_1.redisService.getCachedLiquidation(liquidationValue);
            return cachedLiquidation !== null;
        });
    }
    /*
     * Getters, setters, and utility methods
     */
    /**
     * Updates this class's threshold fields with the provided values, and returns whether those thresholds have been surpassed
     */
    liquidationSurpassedThreshold(buyThreshold, sellThreshold, liquidationValue) {
        this.setThresholds(buyThreshold, sellThreshold);
        return (liquidationValue > buyThreshold) || (liquidationValue < sellThreshold);
    }
    setThresholds(buyThreshold, sellThreshold) {
        this.buyThreshold = buyThreshold;
        this.sellThreshold = sellThreshold;
    }
    liquidationIsBuy(liquidationValue) {
        return liquidationValue > 0;
    }
    liquidationIsSell(liquidationValue) {
        return liquidationValue < 0;
    }
}
exports.LiquidationAlertsService = LiquidationAlertsService;
