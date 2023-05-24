import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';

/**
 * An alert that is sent when crypto liquidations cross a given threshold (defined in AGGR built-in script box) 
 */
interface LiquidationAlert {
  timestamp: Number;         // Timestamp (milliseconds) that the request was sent from the AGGR app. NOT associated to the time that the liquidation occured.
  liquidationValue: Number;  // The amount of short or long liquidations that triggered the alert.
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
const processLiquidationAlert = async (req: Request, res: Response) => {
    // get the data from req.body
    let timestamp: Number = req.body.timestamp;
    let liquidationValue: Number = req.body.liquidationValue;

    console.log("*** Alert received! { timestamp: " + timestamp + ", liquidationValue: " + liquidationValue + " }");

    // TODO: Logic to filter out duplicate alerts

    // If the request is not a duplicate, send Telegram notification
    // let response: AxiosResponse = await axios.post(`https://jsonplaceholder.typicode.com/posts`, {
    //     title,
    //     body
    // });

    // Return response. No response body because AGGR script box cannot await to handle the response anyway
    return res.status(200).json({});
};

export default { processLiquidationAlert };