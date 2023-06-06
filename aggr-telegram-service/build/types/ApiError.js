"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.HTTP_STATUS = void 0;
var HTTP_STATUS;
(function (HTTP_STATUS) {
    HTTP_STATUS[HTTP_STATUS["OK"] = 200] = "OK";
    HTTP_STATUS[HTTP_STATUS["CONFLICT"] = 409] = "CONFLICT";
})(HTTP_STATUS = exports.HTTP_STATUS || (exports.HTTP_STATUS = {}));
/**
 * Custom error class that can be thrown at the service layer. Using this class allows the controller to
 * verify the type so that it can package the error into an API response to send back to the client.
 */
class ApiError {
    constructor(httpStatus, message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
exports.ApiError = ApiError;
