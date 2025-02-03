import pino from 'pino';
import Error from '@/components/error/interface';

const instance = pino();

/**
 * @param {Error} error error with rfc standard
 */
export default function logger(error: Error): void {
  instance.error(error);
}
export function info(message: string): void {
  instance.info(message);
}
