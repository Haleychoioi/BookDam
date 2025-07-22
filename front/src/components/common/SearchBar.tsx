import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button"; // Button 컴포넌트 임포트 확인

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  onSearch?: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  placeholder = "검색어를 입력해주세요",
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

    // ✨ 검색어가 아예 비어있을 때만 alert를 띄우고 중단 ✨
    if (processedSearchTerm.length === 0) {
      alert("검색어를 입력해주세요."); // 검색어가 없다는 메시지로 변경
      return; // 검색 실행 중단
    }

    // 1글자 이상이면 모두 검색 실행
    if (onSearch) {
      onSearch(processedSearchTerm);
    } else {
      const searchPath = `/search/books?q=${encodeURIComponent(
        processedSearchTerm
      )}`;
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
      <Button
        onClick={executeSearch}
        // Button 컴포넌트의 프롭스로 스타일을 전달
        bgColor="bg-main"
        textColor="text-white"
        hoverBgColor="hover:bg-apply"
        className="flex-shrink-0 h-full px-6 py-2 font-medium rounded-xl focus:outline-none focus:ring-0 focus:border-transparent"
        aria-label="검색"
      >
        검색
      </Button>
    </div>
  );
};

export default SearchBar;
