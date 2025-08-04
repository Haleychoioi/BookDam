import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers: number[] = [];
  const pagesPerBlock = 5;

  // 현재 블록의 시작 페이지 계산
  const startBlockPage =
    Math.floor((currentPage - 1) / pagesPerBlock) * pagesPerBlock + 1;
  const endBlockPage = Math.min(totalPages, startBlockPage + pagesPerBlock - 1);

  // 현재 블록의 페이지 번호를 배열에 추가
  for (let i = startBlockPage; i <= endBlockPage; i++) {
    pageNumbers.push(i);
  }

  // '이전' 블록으로 이동 가능한지
  const canGoPrevBlock = startBlockPage > 1;
  // '다음' 블록으로 이동 가능한지
  const canGoNextBlock = endBlockPage < totalPages;

  // '이전' 버튼 클릭 시
  const handlePrevBlock = () => {
    // 현재 블록의 첫 페이지 - 1 (혹은 이전 블록의 마지막 페이지)로 이동
    onPageChange(startBlockPage - 1);
  };

  // '다음' 버튼 클릭 시
  const handleNextBlock = () => {
    // 현재 블록의 마지막 페이지 + 1 (혹은 다음 블록의 첫 페이지)로 이동
    onPageChange(endBlockPage + 1);
  };

  return (
    <div className="flex justify-center items-center space-x-4 mt-12 mb-8">
      {/* 이전 블록 버튼 */}
      <button
        onClick={handlePrevBlock}
        disabled={!canGoPrevBlock} // 이전 블록으로 갈 수 없으면 비활성화
        className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center
          ${!canGoPrevBlock ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Previous Block"
      >
        <FaChevronLeft className="w-4 h-4 text-gray-700" />
      </button>

      {/* 페이지 번호들 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)} // 클릭 시 해당 페이지로 이동
          className={`px-3 py-1.5 rounded-md font-medium text-lg transition-colors duration-200
            ${
              currentPage === page
                ? "text-main"
                : "text-gray-700 hover:text-main"
            }`}
        >
          {page}
        </button>
      ))}

      {/* 다음 블록 버튼 */}
      <button
        onClick={handleNextBlock}
        disabled={!canGoNextBlock} // 다음 블록으로 갈 수 없으면 비활성화
        className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center
          ${!canGoNextBlock ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Next Block"
      >
        <FaChevronRight className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
};

export default Pagination;
