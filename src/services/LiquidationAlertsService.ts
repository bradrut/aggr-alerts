import { Logger } from 'pino';

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

  public setThresholds(buyThreshold: number, sellThreshold: number): void {
    this.buyThreshold = buyThreshold;
    this.sellThreshold = sellThreshold;
  }

  public getBuyThreshold(): number {
    return this.buyThreshold;
  }

  public getSellThreshold(): number {
    return this.sellThreshold;
  }

  public alertsArePaused(liquidationValue: number): boolean {
    // If the current lbuy or lsell value is below the thresholds, or it's been 3mins since the last alert, unpause alerts
    let currTimeSecs = new Date().getTime() / 1000;
    if (((liquidationValue < this.buyThreshold) && (liquidationValue > this.sellThreshold))
          || currTimeSecs-this.pausedAt > 180) {
      logger.debug('Resetting pauseAlerts to false');
      this.pauseAlerts = false;
    }
    return this.pauseAlerts;
  }

  public setPauseAlerts(pauseAlerts: boolean): void {
    logger.debug('Setting pauseAlerts to ' + pauseAlerts + '. Alerts above the threshold will still be cached to avoid duplicates.');
    this.pauseAlerts = pauseAlerts;
    this.pausedAt = new Date().getTime() / 1000; // Current time in seconds
  }

  public liquidationIsBuy(liquidationValue: number): boolean {
    return liquidationValue > 0;
  }

  public liquidationIsSell(liquidationValue: number): boolean {
    return liquidationValue < 0;
  }

}