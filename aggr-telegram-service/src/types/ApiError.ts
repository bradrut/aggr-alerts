export enum HTTP_STATUS {
  OK = 200,
  BAD_REQUEST = 400,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Custom error class that can be thrown at the service layer. Using this class allows the controller to
 * verify the type so that it can package the error into an API response to send back to the client.
 */
export class ApiError {
  httpStatus: HTTP_STATUS;
  message: string;

  constructor(httpStatus: HTTP_STATUS, message: string) {
    this.httpStatus = httpStatus;
    this.message = message;
  }
}
