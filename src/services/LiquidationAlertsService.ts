import { Logger } from 'pino';

import { redisService, telegramService } from '../dependencies';
import { ApiError, HTTP_STATUS } from '../types/ApiError';

const logger: Logger = require('pino')();

export class LiquidationAlertsService {

  private buyThreshold: number;
  private sellThreshold: number;
  private pauseAlerts: boolean; // Flag used to ensure that an alert only gets sent once per crossing of the threshold
  private pausedAt: number;

  constructor() {
    // Initialize buyThreshold and sellThreshold to -1 to indicate that they have not yet been set by the AGGR client
    this.buyThreshold = -1;
    this.sellThreshold = -1;
    this.pauseAlerts = false;
    this.pausedAt = -1;
  }

  public async processLiquidationAlert(buyThreshold: number, sellThreshold: number, liquidationValue: number): Promise<void> {
    // Note that the liquidationSurpassedThreshold() function updates the threshold fields on the alertsService
    if (this.liquidationSurpassedThreshold(buyThreshold, sellThreshold, liquidationValue)) {
      // Cache ALL liquidationValues that have surpassed the thresholds, even if alerts are paused, so that
      // we do not send duplicate or old alerts when the AGGR script box refreshes.
      // Note for debugging purposes that if this is overwriting an existing cached value, the TTL will be reset.
      await redisService.setCachedLiquidation(liquidationValue);
    } else {
      // This liquidationValue has not surpassed the alertThresholds. Do nothing and return a 204 NO CONTENT.
      logger.info('liquidationValue: ' + liquidationValue + ' has not surpassed the provided alert thresholds; sending 204 NO CONTENT response to client');
      throw new ApiError(HTTP_STATUS.NO_CONTENT, 'The liquidation has not surpassed the specified thresholds. No alert necessary.');
    }

    if (this.alertsArePaused(liquidationValue)) {
      // Alerts are paused because an alert has already been sent for this threshold crossing
      logger.info("An alert has already been processed for this threshold crossing; sending 204 NO CONTENT response to client");
      throw new ApiError(HTTP_STATUS.NO_CONTENT, 'An alert has already been processed for this threshold crossing');
    }

    if (await this.liquidationValueIsDuplicate(liquidationValue)) {
      // Duplicate request; do nothing and return a 409 Conflict
      logger.info('An alert has already been processed for liquidationValue: ' + liquidationValue + '; sending 409 CONFLICT response to client');
      throw new ApiError(HTTP_STATUS.CONFLICT, 'An alert has already been processed for this liquidation');
    }

    // The request has passed all criteria to trigger an alert, so send alert via the telegramService
    await telegramService.sendTelegramAlertMessage(this.liquidationIsSell(liquidationValue) ? sellThreshold : buyThreshold,
                                                   liquidationValue);

    // Since a Telegram alert has successfully been sent, pause further alerts until the threshold has been un-crossed
    this.setPauseAlerts(true);
  }

  /**
   * Reset the pauseAlerts flag based on the liquidationValue if necessary, and return the current value of the flag.
   * @param liquidationValue The liquidationValue that has been sent from the client. Resets the pauseAlerts flag if the liquidationValue has dropped back in between the thresholds.
   * @returns The value of the pauseAlerts flag
   */
  public alertsArePaused(liquidationValue: number): boolean {
    // If alerts are paused, determine if they should be unpaused
    if (this.pauseAlerts) {
      // If the current liquidationValue is below both thresholds or it's been 3mins since the last alert, unpause alerts
      let currTimeSecs = new Date().getTime() / 1000;
      if (((liquidationValue < this.buyThreshold) && (liquidationValue > this.sellThreshold))
            || currTimeSecs-this.pausedAt > 180) {
        logger.debug('Resetting pauseAlerts to false');
        this.pauseAlerts = false;
      }
    }
    return this.pauseAlerts;
  }

  public setPauseAlerts(pauseAlerts: boolean): void {
    logger.debug('Setting pauseAlerts to ' + pauseAlerts + '. Alerts above the threshold will still be cached to avoid future duplicates.');
    this.pausedAt = new Date().getTime() / 1000; // Current time in seconds
    this.pauseAlerts = pauseAlerts;
  }

  public async liquidationValueIsDuplicate(liquidationValue: number): Promise<boolean> {
    let cachedLiquidation: string | null = await redisService.getCachedLiquidation(liquidationValue);
    return cachedLiquidation !== null;
  }

  /*
   * Getters, setters, and utility methods
   */

  /**
   * Updates this class's threshold fields with the provided values, and returns whether those thresholds have been surpassed
   */
  public liquidationSurpassedThreshold(buyThreshold: number, sellThreshold: number, liquidationValue: number) {
    this.setThresholds(buyThreshold, sellThreshold);
    return (liquidationValue > buyThreshold) || (liquidationValue < sellThreshold);
  }

  public setThresholds(buyThreshold: number, sellThreshold: number): void {
    this.buyThreshold = buyThreshold;
    this.sellThreshold = sellThreshold;
  }

  public liquidationIsBuy(liquidationValue: number): boolean {
    return liquidationValue > 0;
  }

  public liquidationIsSell(liquidationValue: number): boolean {
    return liquidationValue < 0;
  }

}