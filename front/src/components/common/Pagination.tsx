import Button from "./Button"; // Button 컴포넌트 임포트

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
  const pageNumbers = [];
  // 보여줄 페이지 번호 범위를 조정할 수 있습니다 (예: 현재 페이지 기준 좌우 2칸)
  const maxPageButtons = 5; // 한 번에 보여줄 페이지 버튼 최대 개수
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  // 끝 페이지가 부족할 경우 시작 페이지 조정
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center items-center space-x-2">
      {/* 이전 버튼 */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        bgColor="bg-gray-200"
        textColor="text-gray-800"
        hoverBgColor="hover:bg-gray-300"
        className="px-4 py-2 text-sm"
      >
        이전
      </Button>

      {/* 페이지 번호들 */}
      {startPage > 1 && (
        <>
          <Button
            onClick={() => onPageChange(1)}
            bgColor="bg-gray-200"
            textColor="text-gray-800"
            hoverBgColor="hover:bg-gray-300"
            className="px-4 py-2 text-sm"
          >
            1
          </Button>
          {startPage > 2 && <span className="text-gray-600">...</span>}
        </>
      )}

      {pageNumbers.map((number) => (
        <Button
          key={number}
          onClick={() => onPageChange(number)}
          bgColor={currentPage === number ? "bg-blue-600" : "bg-gray-200"}
          textColor={currentPage === number ? "text-white" : "text-gray-800"}
          hoverBgColor={
            currentPage === number ? "hover:bg-blue-700" : "hover:bg-gray-300"
          }
          className="w-10 h-10 flex items-center justify-center text-sm"
        >
          {number}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="text-gray-600">...</span>
          )}
          <Button
            onClick={() => onPageChange(totalPages)}
            bgColor="bg-gray-200"
            textColor="text-gray-800"
            hoverBgColor="hover:bg-gray-300"
            className="px-4 py-2 text-sm"
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* 다음 버튼 */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        bgColor="bg-gray-200"
        textColor="text-gray-800"
        hoverBgColor="hover:bg-gray-300"
        className="px-4 py-2 text-sm"
      >
        다음
      </Button>
    </nav>
  );
};

export default Pagination;
