import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

export class CustomRpcException extends RpcException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    service?: string,
  ) {
    super({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      service: service || 'microservice',
    });
  }
}

// Specific exceptions for different scenarios
export class UserNotFoundException extends CustomRpcException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND, 'user-service');
  }
}

export class ValidationException extends CustomRpcException {
  constructor(message: string, service?: string) {
    super(message, HttpStatus.BAD_REQUEST, service);
  }
}

export class DatabaseException extends CustomRpcException {
  constructor(operation: string, service?: string) {
    super(`Database operation failed: ${operation}`, HttpStatus.INTERNAL_SERVER_ERROR, service);
  }
}