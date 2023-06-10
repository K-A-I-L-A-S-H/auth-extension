export enum ApiVersions {
  V1 = '1',
}

export enum ErrorCodeNames {
  PG_UNIQUE_VIOLATION_ERROR = 'PG_UNIQUE_VIOLATION_ERROR',
}

export const QueryErrorCodes: Record<ErrorCodeNames, string> = {
  PG_UNIQUE_VIOLATION_ERROR: 'P2002',
};

export const CookieNames: Record<string, string> = {
  AccessToken: 'accessToken',
};
