import { NextFunction, Request, Response } from 'express';
import { redisService, telegramService } from '../server';
import { Logger } from 'pino';
import { LiquidationAlertsService } from '../services/LiquidationAlertsService';

const logger: Logger = require('pino')();

/**
 * An alert that is sent when crypto liquidations cross a given threshold (defined in AGGR built-in script box) 
 */
interface LiquidationAlert {
  buyThreshold: number;
  sellThreshold: number;
  liquidationValue: number;  // The amount of short or long liquidations that triggered the alert.
                             // This is the lbuy or lsell value as defined in AGGR. Positive values are lbuy, negative are lsell.
}

export class LiquidationAlertsController {

  private alertsService: LiquidationAlertsService;

  constructor() {
    this.alertsService = new LiquidationAlertsService();
  }

  /**
   * Handler function for POST /liquidationAlerts
   */
  public processLiquidationAlert = async (req: Request, res: Response, next: NextFunction) => {
    // Get the data from req.body
    // Because of CORS issues when *manually setting* 'Content-Type' header from AGGR script box (but no issues
    // when leaving 'Content-Type' as default 'text/plain'), manually parse 'text/plain' requests here.
    let body: LiquidationAlert = req.body;
    let contentType = req.headers['content-type'];
    if (contentType && contentType.includes('text/plain')) {
      body = JSON.parse(req.body);
    } else if (!contentType) {
      return next(new Error("Unexpected condition: could not find content-type header in request"));
    }

    this.alertsService.setThresholds(body.buyThreshold, body.sellThreshold);
    let liquidationValue: number = body.liquidationValue;

    if (!this.alertsService.alertsArePaused(liquidationValue)) {
      try {
        if (await redisService.getCachedLiquidation(liquidationValue)) {
          // Duplicate request; do nothing and return a 409 Conflict
          logger.info("Sending 409 CONFLICT response to client");
          return res.status(409).json('An alert has already been processed for this liquidation');
        }

        // If the request is not a duplicate, create a cached record and send the Telegram notification
        await redisService.setCachedLiquidation(liquidationValue);
        await telegramService.sendTelegramAlertMessage(this.alertsService.liquidationIsSell(liquidationValue) ? this.alertsService.getSellThreshold() : this.alertsService.getBuyThreshold(),
                                                       liquidationValue);
      } catch (err) {
        return next(err);
      }
    } else {
      // Alerts are paused because an alert has already been sent for this threshold crossing
      logger.info("An alert has already been processed for this threshold crossing; sending 100 CONTINUE response to client");
      return res.status(100).json('An alert has already been processed for this threshold crossing');
    }

    // Since a Telegram alert has successfully been sent, pause further alerts until the threshold has been un-crossed
    this.alertsService.setPauseAlerts(true);

    // Return response. No response body because AGGR script box cannot await to handle the response anyway
    logger.info("Sending 200 SUCCESS response to client");
    return res.status(200).json("Telegram notification has been sent");
  };

}
