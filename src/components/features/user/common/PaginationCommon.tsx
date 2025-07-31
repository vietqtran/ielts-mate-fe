'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginationCommonProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
  className?: string;
  showInfo?: boolean;
}

const PaginationCommon = ({
  pagination,
  onPageChange,
  className = '',
  showInfo = true,
  onPageSizeChange,
}: PaginationCommonProps) => {
  const { currentPage, totalPages, pageSize, totalItems, hasNextPage, hasPreviousPage } =
    pagination;

  // Calculate display range for items info
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 7; // Adjust this to show more/fewer page numbers

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show current page and surrounding pages
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (hasPreviousPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between mt-8 ${className}`}>
      {/* Items info */}
      {showInfo && (
        <div className='text-sm text-tekhelet-500 flex-1'>
          {totalItems > 0 ? (
            <p className='whitespace-nowrap'>
              Showing {startItem} to {endItem} of {totalItems} entries
            </p>
          ) : (
            'No entries found'
          )}
        </div>
      )}

      {/* Pagination controls */}
      <Pagination>
        <PaginationContent>
          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious
              href='#'
              onClick={(e) => {
                e.preventDefault();
                handlePrevious();
              }}
              className={
                !hasPreviousPage
                  ? 'pointer-events-none opacity-50'
                  : 'text-tekhelet-700 hover:text-tekhelet-700 hover:bg-tekhelet-900'
              }
            />
          </PaginationItem>

          {/* Page numbers */}
          {visiblePages.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis className='text-tekhelet-500' />
              ) : (
                <PaginationLink
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageClick(page as number);
                  }}
                  isActive={currentPage === page}
                  className={
                    currentPage === page
                      ? 'bg-selective-yellow-300 text-tekhelet-900 hover:bg-selective-yellow-400'
                      : 'text-tekhelet-700 hover:bg-selective-yellow-400'
                  }
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next button */}
          <PaginationItem>
            <PaginationNext
              href='#'
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className={
                !hasNextPage
                  ? 'pointer-events-none opacity-50'
                  : 'text-tekhelet-700 hover:text-tekhelet-700 hover:bg-tekhelet-900'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Select onValueChange={onPageSizeChange} value={String(pageSize)}>
        <SelectTrigger>
          <SelectValue placeholder='Items per page' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='10'>10</SelectItem>
          <SelectItem value='20'>20</SelectItem>
          <SelectItem value='50'>50</SelectItem>
          <SelectItem value='100'>100</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaginationCommon;
