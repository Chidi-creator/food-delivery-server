import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class MicroserviceExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const defaultService = this.getServiceName(host);
    
    let error = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      service: defaultService,
    };

    if (exception instanceof RpcException) {
      const rpcError = exception.getError() as any;
      error = {
        ...error,
        statusCode: rpcError.statusCode || HttpStatus.BAD_REQUEST,
        message: rpcError.message || rpcError,
        // Preserve the service name from the original exception if available
        service: rpcError.service || defaultService,
      };
    } else if (exception instanceof Error) {
      error = {
        ...error,
        message: exception.message,
      };
    }

    console.error(`[${error.service}] Exception:`, {
      ...error
    });

    return throwError(() => new RpcException(error));
  }

  private getServiceName(host: ArgumentsHost): string {
    // Try to extract service name from context or use default
    return process.env.SERVICE_NAME || 'unknown-service';
  }
}