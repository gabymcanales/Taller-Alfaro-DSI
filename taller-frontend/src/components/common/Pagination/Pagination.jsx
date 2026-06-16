import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {currentPage > 3 && (
                <>
                    <button onClick={() => onPageChange(1)} className="pagination-btn">1</button>
                    {currentPage > 4 && <span className="pagination-dots">…</span>}
                </>
            )}

            {getPageNumbers().map(num => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    className={`pagination-btn ${currentPage === num ? 'active' : ''}`}
                >
                    {num}
                </button>
            ))}

            {currentPage < totalPages - 2 && (
                <>
                    {currentPage < totalPages - 3 && <span className="pagination-dots">…</span>}
                    <button onClick={() => onPageChange(totalPages)} className="pagination-btn">
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </div>
    );
};

export default Pagination;