import logger from '@/libs/logger';
import { v4 } from 'uuid';
import { ErrorModelDetail, RequestErrorModel } from './types';

export class RequestError extends Error {
  constructor(props: RequestErrorModel) {
    super(props.title);

    this.errorCorrelationId = props.errorCorrelationId || v4();
    this.title = props.title;
    this.errorMessage = props.type || 'Request Error';
    this.status = props.status;
    this.detail = props.detail;

    logger(this as RequestErrorModel);
  }

  errorCorrelationId: string;

  title?: string;

  errorMessage: string;

  status?: number;

  detail?: ErrorModelDetail;
}
