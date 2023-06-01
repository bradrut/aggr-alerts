import { Logger } from 'pino';

export class LiquidationAlertsService {

  private buyThreshold: number;
  private sellThreshold: number;
  private pauseAlerts: boolean; // Flag used to ensure that an alert only gets sent once per crossing of the threshold

  constructor() {
    // Initialize buyThreshold and sellThreshold to -1 to indicate that they have not yet been set by the AGGR client
    this.buyThreshold = -1;
    this.sellThreshold = -1;
    this.pauseAlerts = false;
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
    // If the current lbuy or lsell value is below the thresholds, unpause alerts
    if ((liquidationValue < this.buyThreshold) && (liquidationValue > this.sellThreshold)) {
      this.pauseAlerts = false;
    }
    return this.pauseAlerts;
  }

  public setPauseAlerts(pauseAlerts: boolean): void {
    this.pauseAlerts = pauseAlerts;
  }

  public liquidationIsBuy(liquidationValue: number): boolean {
    return liquidationValue > 0;
  }

  public liquidationIsSell(liquidationValue: number): boolean {
    return liquidationValue < 0;
  }

}