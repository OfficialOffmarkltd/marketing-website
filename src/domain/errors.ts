export type FieldErrors = Record<string, string[]>;

export type SafeErrorCode =
  | "invalid_data"
  | "configuration_error"
  | "not_found"
  | "unavailable"
  | "price_changed"
  | "quote_expired"
  | "unauthorized"
  | "rate_limited"
  | "temporary_failure";

export type SafeDataError = {
  code: SafeErrorCode;
  message: string;
  fieldErrors?: FieldErrors;
  requestId?: string;
};

export class DataSourceError extends Error {
  readonly code: SafeErrorCode;
  readonly fieldErrors?: FieldErrors;
  readonly requestId?: string;

  constructor(error: SafeDataError) {
    super(error.message);
    this.name = "DataSourceError";
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
    this.requestId = error.requestId;
  }
}

export class DataContractError extends DataSourceError {
  constructor(message: string) {
    super({ code: "invalid_data", message });
    this.name = "DataContractError";
  }
}
