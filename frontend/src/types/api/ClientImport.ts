export type ClientImportJobState = "Pending" | "Running" | "Completed" | "Failed";

export interface ClientImportRowError {
  rowNumber: number;
  documentNumber: string;
  message: string;
}

export interface ClientImportResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: ClientImportRowError[];
}

export interface ClientImportJobStatus {
  jobId: string;
  state: ClientImportJobState;
  processedAt: string | null;
  result: ClientImportResult | null;
  errorMessage: string | null;
}

export interface ClientImportResponse {
  jobId: string;
}
