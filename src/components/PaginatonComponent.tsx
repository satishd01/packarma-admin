import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PaginationProps {
  pagination: PaginationData;
  setCurrentPage: (page: number) => void;
  currentPage: number;
}

const PaginationComponent = ({
  pagination,
  setCurrentPage,
  currentPage,
}: PaginationProps) => {
  if (pagination.totalItems < 10) return null;

  return (
    <div className="mt-4 flex justify-center items-center mb-8">
      <button
        className="px-2 py-1 rounded mr-2 disabled:opacity-50"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <FaChevronLeft />
      </button>

      {(() => {
        const pageNumbers = [];
        const totalPages = pagination.totalPages;

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3) {
          endPage = Math.min(5, totalPages);
        } else if (currentPage >= totalPages - 2) {
          startPage = Math.max(totalPages - 4, 1);
        }

        for (let i = startPage; i <= endPage; i++) {
          pageNumbers.push(
            <button
              key={i}
              className={`px-2 py-1 rounded border mr-2 ${
                i === currentPage ? "bg-lime-500 text-white" : ""
              }`}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </button>
          );
        }

        if (startPage > 1) {
          pageNumbers.unshift(
            <button
              key={1}
              className="px-2 py-1 rounded border mr-2"
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>,
            <span key="ellipsis-start" className="mr-2">
              ...
            </span>
          );
        }
        if (endPage < totalPages) {
          pageNumbers.push(
            <span key="ellipsis-end" className="mr-2">
              ...
            </span>,
            <button
              key={totalPages}
              className="px-2 py-1 rounded border mr-2"
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>
          );
        }

        return pageNumbers;
      })()}

      <button
        className="px-2 py-1 rounded disabled:opacity-50"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === pagination.totalPages}
        aria-label="Next page"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default PaginationComponent;
