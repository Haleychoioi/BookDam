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
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      const searchPath = searchTerm
        ? `/search/books?q=${encodeURIComponent(searchTerm)}`
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
