import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GatewayException } from '../exceptions/gateway.exceptions';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GatewayExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let service = 'gateway';

 

    // Handle custom gateway exceptions
    if (exception instanceof GatewayException) {
      const response = exception.getResponse() as any;
      statusCode = exception.getStatus();
      message = response.message || response;
      service = response.service || 'gateway';
    }
    else if (exception instanceof HttpException) {
      const response = exception.getResponse() as any;
      statusCode = exception.getStatus();
      message = response.message || response;
    }
    // Handle errors from microservice calls (these come as regular Error objects)
    else if (exception instanceof Error) {
      // Try to parse microservice error format
      try {
        // Check if error has an 'error' property (from microservice)
        const errorObj = (exception as any).error || exception.message;
        console.log('Error object:', errorObj);
        const errorData = typeof errorObj === 'string' ? JSON.parse(errorObj) : errorObj;
        console.log('Parsed error data:', errorData);
        
        if (errorData && errorData.statusCode && errorData.message) {
          statusCode = errorData.statusCode;
          message = errorData.message;
          service = errorData.service || 'unknown-service';
        } else {
          message = exception.message;
        }
      } catch (parseError) {
        console.log('Parse error:', parseError);
        message = exception.message;
      }
    }
    // Handle cases where exception is a plain object (microservice errors)
    else if (typeof exception === 'object' && exception !== null) {
      const errorObj = (exception as any).error;
      if (errorObj && errorObj.statusCode && errorObj.message) {
        statusCode = errorObj.statusCode;
        message = errorObj.message;
        service = errorObj.service || 'unknown-service';
      } else if ((exception as any).message) {
        message = (exception as any).message;
      }
    }

    const responseBody = {
      success: false,
      statusCode,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: Array.isArray(message) ? message[0] : message,
      service,
    };

    this.logger.error('Gateway Exception:', {
      ...responseBody
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}