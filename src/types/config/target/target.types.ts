export interface UpdateTargetConfigParams {
  listening_target: number;
  listening_target_date: string; // ISO date string (e.g., "2025-08-04")
  reading_target: number;
  reading_target_date: string; // ISO date string (e.g., "2025-08-04")
}

export interface TargetConfigResponseData extends UpdateTargetConfigParams {}
