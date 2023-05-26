import { NextFunction, Request, Response } from 'express';
import redisService from '../server';
import { sendTelegramAlertMessage } from '../services/telegramService';
import { Logger } from 'pino';

const logger: Logger = require('pino')()

/**
 * An alert that is sent when crypto liquidations cross a given threshold (defined in AGGR built-in script box) 
 */
interface LiquidationAlert {
  timestamp: number;         // Timestamp (milliseconds) that the request was sent from the AGGR app. NOT associated to the time that the liquidation occured.
  liquidationValue: number;  // The amount of short or long liquidations that triggered the alert.
                             // This is the lbuy or lsell value as defined in AGGR. Positive values are lbuy, negative are lsell.
}

// getting all posts
// const getPosts = async (req: Request, res: Response, next: NextFunction) => {
//     // get some posts
//     let result: AxiosResponse = await axios.get(`https://jsonplaceholder.typicode.com/posts`);
//     let posts: [Post] = result.data;
//     return res.status(200).json({
//         message: posts
//     });
// };

// getting a single post
// const getPost = async (req: Request, res: Response, next: NextFunction) => {
//     // get the post id from the req
//     let id: string = req.params.id;
//     // get the post
//     let result: AxiosResponse = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
//     let post: Post = result.data;
//     return res.status(200).json({
//         message: post
//     });
// };

// 
const processLiquidationAlert = async (req: Request, res: Response, next: NextFunction) => {
    // get the data from req.body
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
    logger.info("liquidationValue: " + liquidationValue);

    try {
      if (await redisService.getCachedLiquidation(liquidationValue)) {
        // Duplicate request; do nothing and return a 409 Conflict
        logger.info("Sending 409 CONFLICT response to client");
        return res.status(409).json('An alert has already been processed for this liquidation');
      }

      // If the request is not a duplicate, create a cached record and send the Telegram notification
      await redisService.setCachedLiquidation(liquidationValue);
      await sendTelegramAlertMessage(liquidationValue);
    } catch (err) {
      return next(err);
    }

    // Return response. No response body because AGGR script box cannot await to handle the response anyway
    logger.info("Sending 200 SUCCESS response to client");
    return res.status(200).json("Telegram notification has been sent");
};

export default { processLiquidationAlert };