export interface CommonPaginationParams {
  page: number; // Default: 1
  size: number; // Default: 10
  sortBy: string; // Default: createdAt
  sortDirection: string; // Default: desc
}

export interface ReadingExamAttemptFiltersParams extends CommonPaginationParams {
  readingExamName?: string; // Filter by reading exam name
}
