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
exports.LiquidationAlertsController = void 0;
const LiquidationAlertsService_1 = require("../services/LiquidationAlertsService");
const ApiError_1 = require("../types/ApiError");
const logger = require('pino')();
class LiquidationAlertsController {
    constructor() {
        /**
         * Handler function for POST /liquidationAlerts
         */
        this.processLiquidationAlert = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // Get the data from req.body
            // Because of CORS issues when *manually setting* 'Content-Type' header from AGGR script box (but no issues
            // when leaving 'Content-Type' as default 'text/plain'), manually parse 'text/plain' requests here.
            let body = req.body;
            let contentType = req.headers['content-type'];
            if (contentType && contentType.includes('text/plain')) {
                body = JSON.parse(req.body);
            }
            else if (!contentType) {
                return next(new Error("Unexpected condition: could not find content-type header in request"));
            }
            let liquidationValue = body.liquidationValue;
            let buyThreshold = body.buyThreshold;
            let sellThreshold = body.sellThreshold;
            try {
                yield this.alertsService.processLiquidationAlert(buyThreshold, sellThreshold, liquidationValue);
            }
            catch (err) {
                if (err instanceof ApiError_1.ApiError) {
                    let apiError = err;
                    return res.status(apiError.httpStatus).json(apiError.message);
                }
                else {
                    next(err);
                }
            }
            // Return success response
            logger.info("Telegram notification has been sent for liquidationValue: " + liquidationValue + "; sending 200 SUCCESS response to client");
            return res.status(200).json("Telegram notification has been sent");
        });
        this.alertsService = new LiquidationAlertsService_1.LiquidationAlertsService();
    }
}
exports.LiquidationAlertsController = LiquidationAlertsController;
