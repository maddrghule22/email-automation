import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { logger } from './logger';

export function successResponse<T>(data: T, status: number = 200, requestId?: string) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      requestId: requestId || crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }
  }, { status });
}

export function errorResponse(error: unknown, requestId?: string) {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    
    if (statusCode >= 500) {
      logger.error({ message: 'API Error', code }, error);
    } else {
      logger.info({ message: 'API Client Error', code, detail: message });
    }
  } else if (error instanceof Error) {
    logger.error({ message: 'Unhandled API Error' }, error);
    message = error.message;
  }

  return NextResponse.json({
    success: false,
    error: {
      code,
      message,
    },
    meta: {
      requestId: requestId || crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }
  }, { status: statusCode });
}
