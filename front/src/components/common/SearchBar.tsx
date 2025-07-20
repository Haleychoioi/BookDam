import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  placeholder = "도서 검색", // 이미지에 "도서 검색"으로 표시됨
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSearch = () => {
    // 검색어가 없어도 기본 검색 페이지로 이동
    const searchPath = searchTerm
      ? `/search/books?q=${encodeURIComponent(searchTerm)}`
      : "/search/books";
    navigate(searchPath);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`flex items-center w-full max-w-3xl mx-auto h-12 border border-gray-300 rounded-full bg-white shadow-sm ${className}`}
    >
      <input
        type="text"
        placeholder={placeholder}
        className="flex-grow p-3 focus:outline-none focus:ring-0 focus:border-transparent bg-transparent border-none rounded-l-full pl-5" // 왼쪽만 둥글게, 내부 여백 조정
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        onClick={handleSearch}
        className="flex-shrink-0 h-full w-12 flex items-center justify-center text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-0 focus:border-transparent rounded-r-full pr-3" // 오른쪽만 둥글게, 내부 여백 조정
        aria-label="도서 검색"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;
