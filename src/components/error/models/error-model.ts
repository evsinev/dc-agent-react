import logger from '@/libs/logger';
import { v4 } from 'uuid';
import { ErrorModelDetail, RequestErrorModel } from './types';

export class RequestError extends Error {
  constructor(props: RequestErrorModel) {
    super(props.title);

    this.errorCorrelationId = props.errorId || v4();
    this.title = props.title;
    this.type = props.type || 'Request Error';
    this.status = props.status;
    this.detail = props.detail;

    logger(this as RequestErrorModel);
  }

  errorCorrelationId: string;

  title?: string;

  type: string;

  status?: number;

  detail?: ErrorModelDetail;
}
