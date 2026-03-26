export interface TErrorSources {
  path: string;
  message: string;
}

export interface TErrorResponse {
  ok: boolean;
  statusCode: number;
  message: string;
  errSources: TErrorSources[];
  error?: any;
}
