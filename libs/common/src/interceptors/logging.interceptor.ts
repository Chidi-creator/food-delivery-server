import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Log incoming request
    this.logger.log(`[${timestamp}] ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${timestamp}] ${method} ${url} - ${duration}ms - SUCCESS`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${timestamp}] ${method} ${url} - ${duration}ms - ERROR: ${error.message}`,
          );
        },
      }),
    );
  }
}
