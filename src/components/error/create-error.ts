import { v4 } from 'uuid';
import logger from '@/libs/logger';
import Error from './interface';

/**
 * @return {Error} error with rfc standard
 */
export default function createError(error: Error): Error {
  if ((error as Error).title) {
    logger(error);

    return {
      errorId: v4(),
      ...error,
    };
  }

  const result: Error = {
    errorId: error.errorId || v4(),
    title: error.title || null,
    type: error.type || null,
    status: error.status || null,
    detail: error.detail,
  };

  logger(result);
  return result;
}
