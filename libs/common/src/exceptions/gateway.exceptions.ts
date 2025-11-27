import { HttpException, HttpStatus } from '@nestjs/common';

export class GatewayException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(
      {
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        service: 'gateway',
      },
      statusCode,
    );
  }
}

// Specific gateway exceptions
export class AuthenticationException extends GatewayException {
  constructor(message: string = 'Authentication failed') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class AuthorizationException extends GatewayException {
  constructor(message: string = 'Access denied') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationException extends GatewayException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ServiceUnavailableException extends GatewayException {
  constructor(serviceName: string) {
    super(`${serviceName} service is currently unavailable`, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class RateLimitException extends GatewayException {
  constructor(message: string = 'Too many requests') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class MicroserviceTimeoutException extends GatewayException {
  constructor(serviceName: string) {
    super(`${serviceName} service timeout`, HttpStatus.REQUEST_TIMEOUT);
  }
}