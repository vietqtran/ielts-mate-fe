/**
 * Interface for common Redux filter states. This interface defines the structure for filter states used across different slices in the Redux store.
 * It includes a generic type parameter `T` for the filters, allowing flexibility in the type of filters used.
 * The `pagination` property provides details about the current pagination state, including total pages, page
 * size, total items, and flags for next and previous pages.
 * This structure is useful for managing and maintaining filter states in list views or paginated data displays.
 */
export interface CommonReduxFilterStates<T> {
  filters: T;
  isLoading: boolean;
  pagination: {
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
  };
}

/**
 * Interface for common filter parameters used in API requests.
 */
export interface CommonPaginationParams {
  page: number; // Default: 1
  size: number; // Default: 10
  sortBy?: string; // Default: createdAt
  sortDirection?: string; // Default: desc
}

/**
 * Interface for common pagination response properties.
 * This interface defines the structure for pagination details in API responses.
 * It includes properties such as total pages, page size, total items, and flags for next and previous pages.
 * This structure is useful for managing pagination in API responses across different endpoints.
 */
export interface CommonPaginationResponseProperties {
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
}
