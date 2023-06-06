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

  /**
   * Sends a Telegram alert if the liquidationValue is not a duplicate, if it has surpassed the provided
   * thresholds, and if alerts are not currently paused. Note that ALL liquidationValues that surpass the
   * specified thresholds are cached, regardless of whether a Telegram notification is sent.
   */
  public async processLiquidationAlert(buyThreshold: number, sellThreshold: number, liquidationValue: number): Promise<void> {
    this.setThresholds(buyThreshold, sellThreshold);
    this.tryUnpauseAlerts(buyThreshold, sellThreshold, liquidationValue);

    if (!liquidationValue) {
      logger.info("Not processing notification becaues liquidationValue is zero or undefined");
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Not processing notification becaues liquidationValue is zero or undefined");
    }

    if (await this.liquidationValueIsDuplicate(liquidationValue)) {
      // Duplicate request; do nothing and return a 409 Conflict
      logger.info('An alert has already been processed for liquidationValue: ' + liquidationValue);
      throw new ApiError(HTTP_STATUS.CONFLICT, 'An alert has already been processed for this liquidation');
    }

    // Cache ALL nonzero liquidationValues, even if alerts are paused, so that we do not send duplicate
    // or old alerts when the AGGR script box refreshes.
    // Note for debugging purposes that if this is overwriting an existing cached value, the TTL will be reset.
    await redisService.setCachedLiquidation(liquidationValue);

    if (! this.liquidationSurpassedThreshold(buyThreshold, sellThreshold, liquidationValue)) {
      // This liquidationValue has not surpassed the alertThresholds. Do nothing and return a 204 NO CONTENT.
      logger.info('liquidationValue: ' + liquidationValue + ' has not surpassed the provided alert thresholds');
      throw new ApiError(HTTP_STATUS.OK, 'The liquidation has not surpassed the specified thresholds. No alert necessary.');
    }

    if (this.pauseAlerts) {
      // Alerts are paused because an alert has already been sent for this threshold crossing
      logger.info("An alert has already been processed for this threshold crossing");
      throw new ApiError(HTTP_STATUS.OK, 'An alert has already been processed for this threshold crossing.');
    }

    // The request has passed all criteria to trigger an alert, so send alert via the telegramService
    await telegramService.sendTelegramAlertMessage(this.liquidationIsSell(liquidationValue) ? sellThreshold : buyThreshold,
                                                   liquidationValue);

    // Since a Telegram alert has successfully been sent, pause further alerts until the threshold has been un-crossed
    this.setPauseAlerts(true);
  }

  /**
   * If alerts are paused, check if they should be unpaused based on the thresholds, liquidationValue, and
   * time of last pause, and return the current value of the flag.
   * 
   * @param liquidationValue The liquidationValue that has been sent from the client. Resets the pauseAlerts flag if the liquidationValue has dropped back in between the thresholds.
   * @returns The value of the pauseAlerts flag
   */
  private tryUnpauseAlerts(buyThreshold: number, sellThreshold: number, liquidationValue: number): boolean {
    if (this.pauseAlerts) {
      // If the current liquidationValue is below both thresholds or it's been 3mins since the last alert, unpause alerts
      let currTimeSecs = new Date().getTime() / 1000;
      if (!this.liquidationSurpassedThreshold(buyThreshold, sellThreshold, liquidationValue) || currTimeSecs-this.pausedAt > 180) {
        logger.debug('Resetting pauseAlerts to false');
        this.pauseAlerts = false;
      }
    }
    return this.pauseAlerts;
  }

  private async liquidationValueIsDuplicate(liquidationValue: number): Promise<boolean> {
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
    return (liquidationValue >= buyThreshold) || (liquidationValue <= sellThreshold);
  }

  private setPauseAlerts(pauseAlerts: boolean): void {
    logger.debug('Setting pauseAlerts to ' + pauseAlerts + '. Alerts above the threshold will still be cached to avoid future duplicates.');
    this.pausedAt = new Date().getTime() / 1000; // Current time in seconds
    this.pauseAlerts = pauseAlerts;
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