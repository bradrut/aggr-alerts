import { NextFunction, Request, Response } from 'express';
import { Logger } from 'pino';

import { LiquidationAlertsService } from '../services/LiquidationAlertsService';
import { ApiError } from '../types/ApiError';

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

    let liquidationValue: number = body.liquidationValue;
    let buyThreshold = body.buyThreshold;
    let sellThreshold = body.sellThreshold;

    try {
      await this.alertsService.processLiquidationAlert(buyThreshold, sellThreshold, liquidationValue);
    } catch (err) {
      if (err instanceof ApiError) {
        let apiError = err as ApiError;
        return res.status(apiError.httpStatus).json(apiError.message);
      } else {
        next(err);
      }
    }

    // Return success response
    logger.info("Telegram notification has been sent for liquidationValue: " + liquidationValue + "; sending 200 SUCCESS response to client");
    return res.status(200).json("Telegram notification has been sent");
  };

}
