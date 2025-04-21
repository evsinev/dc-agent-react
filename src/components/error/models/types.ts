export interface ErrorModelDetail {
  path?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: string | object;
}

/**
 * @param {string} errorId: id of error
 * @param {string} title: A short, human-readable summary of the problem
 * @param {string} type: It SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization
 * @param {number} status: The HTTP status code
 * @param {ErrorModelDetail} detail: A human-readable explanation specific to this occurrence of the problem.
 */
export interface RequestErrorModel {
  errorId?: string;
  title: string;
  type?: string;
  status?: number;
  detail?: ErrorModelDetail;
}
