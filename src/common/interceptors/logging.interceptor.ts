import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, originalUrl, body, query, params } = request;
    const startTime = Date.now();

    this.logger.log(`→ [${method}] ${originalUrl}`);

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    if (Object.keys(query || {}).length > 0) {
      this.logger.debug(`Query: ${JSON.stringify(query)}`);
    }

    if (Object.keys(params || {}).length > 0) {
      this.logger.debug(`Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const duration = Date.now() - startTime;
          this.logger.log(`← [${method}] ${originalUrl} ${response.statusCode} ${duration}ms`);

          if (data && process.env.LOG_RESPONSE_BODY === 'true') {
            this.logger.debug(`Response: ${JSON.stringify(data)}`);
          }
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`← [${method}] ${originalUrl} ERROR ${duration}ms - ${error.message}`);
        },
      }),
    );
  }
}
