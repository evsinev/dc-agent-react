import { RequestErrorModel } from '@/components/error/models/types';
import pino from 'pino';

const instance = pino();

/**
 * @param {Error} error error with rfc standard
 */
export default function logger(error: RequestErrorModel): void {
  instance.error(error);
}
export function info(message: string): void {
  instance.info(message);
}
