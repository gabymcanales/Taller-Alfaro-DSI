import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        const half = Math.floor(maxVisible / 2);

        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, currentPage + half);

        if (end - start + 1 < maxVisible) {
            if (currentPage < totalPages / 2) {
                end = Math.min(totalPages, start + maxVisible - 1);
            } else {
                start = Math.max(1, end - maxVisible + 1);
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
            >
                ‹
            </button>

            {/* Mostrar siempre la primera página si no está visible */}
            {!pages.includes(1) && (
                <>
                    <button onClick={() => onPageChange(1)} className="pagination-btn">1</button>
                    {pages[0] > 2 && <span className="pagination-dots">…</span>}
                </>
            )}

            {pages.map(num => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    className={`pagination-btn ${currentPage === num ? 'active' : ''}`}
                >
                    {num}
                </button>
            ))}

            {/* Mostrar siempre la última página si no está visible */}
            {!pages.includes(totalPages) && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && <span className="pagination-dots">…</span>}
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
                ›
            </button>
        </div>
    );
};


export default Pagination;