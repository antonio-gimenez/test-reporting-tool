import React from "react";

interface PaginationProps {
    disabled?: boolean;
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    maxButtons?: number; // Maximum number of buttons to display
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    disabled = false,
    currentPage,
    totalItems,
    itemsPerPage,
    maxButtons = 10,
    onPageChange,
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const halfMaxButtons = Math.floor((maxButtons - 2) / 2);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const buttons = [];
    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(totalPages, currentPage + halfMaxButtons);

    if (endPage - startPage < maxButtons - 3) {
        if (currentPage <= halfMaxButtons) {
            endPage = Math.min(startPage + maxButtons - 3, totalPages);
        } else {
            startPage = Math.max(endPage - maxButtons + 3, 1);
        }
    }

    if (startPage > 1) {
        buttons.push(
            <button
                key={1}
                disabled={disabled}
                className={`btn ${1 === currentPage ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handlePageChange(1)}
            >
                1
            </button>
        );
    }

    if (startPage > 2) {
        buttons.push(<span key="ellipsis-start">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
        buttons.push(
            <button
                key={i}
                disabled={disabled}
                className={`btn ${i === currentPage ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handlePageChange(i)}
            >
                {i}
            </button>
        );
    }

    if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis-end">...</span>);
    }

    if (totalPages > 1 && endPage < totalPages) {
        buttons.push(
            <button
                key={totalPages}
                disabled={disabled}
                className={`btn ${totalPages === currentPage ? "btn-primary" : "btn-secondary"}
                    }`}
                onClick={() => handlePageChange(totalPages)}
            >
                {totalPages}
            </button>
        );
    }

    return (
        <div className="flex flex-row gap-medium">
            <button

                className="btn btn-secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || disabled}
            >
                Previous
            </button>
            {buttons.map((button) => button)}
            <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || disabled}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
