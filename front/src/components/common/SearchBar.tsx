import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { FaSearch } from "react-icons/fa"; // ✨ 돋보기 아이콘은 이미지에 없으므로 임포트 제거 ✨

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  onSearch?: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  placeholder = "검색어를 입력해주세요", // 이미지의 플레이스홀더 텍스트
  className = "",
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleGlobalEnterKey = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        inputRef.current &&
        document.activeElement !== inputRef.current
      ) {
        inputRef.current.focus();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleGlobalEnterKey);

    return () => {
      document.removeEventListener("keydown", handleGlobalEnterKey);
    };
  }, []);

  const executeSearch = () => {
    const processedSearchTerm = searchTerm.replace(/\s/g, ""); // 모든 공백 제거

    // ✨ 여기서 2글자 미만 검색어 처리 ✨
    if (processedSearchTerm.length < 2 && processedSearchTerm.length > 0) {
      alert("검색어는 최소 두 글자 이상이어야 합니다.");
      return; // 검색 실행 중단
    }
    // 검색어가 아예 비어있으면 (processedSearchTerm.length === 0) 검색 실행 (모든 결과 표시)
    // 이것은 현재 로직과 동일하게 유지됩니다.

    if (onSearch) {
      onSearch(processedSearchTerm);
    } else {
      const searchPath = processedSearchTerm
        ? `/search/books?q=${encodeURIComponent(processedSearchTerm)}`
        : "/search/books";
      navigate(searchPath);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      executeSearch();
    }
  };

  return (
    <div
      className={`flex items-center w-full max-w-3xl mx-auto h-12 ${className}`}
    >
      {/* 검색 입력 필드 */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="flex-grow p-3 mr-3 focus:outline-none focus:ring-0 focus:border-gray-300 border border-gray-300 rounded-xl pl-5 pr-3" // border-none 대신 border 추가, rounded-full 대신 rounded-l-md, shadow-sm
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* 검색 버튼 */}
      <button
        onClick={executeSearch}
        // ✨ 버튼 스타일 변경: 노란색 배경, 텍스트 "검색", border-l-0, rounded-r-md, padding 조정 ✨
        className="flex-shrink-0 h-full px-6 py-2 bg-main text-white font-medium rounded-xl hover:bg-apply focus:outline-none focus:ring-0 focus:border-transparent"
        aria-label="검색"
      >
        검색
      </button>
    </div>
  );
};

export default SearchBar;
