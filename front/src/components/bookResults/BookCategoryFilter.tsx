import React from "react";

interface BookCategoryFilterProps {
  categories: string[]; // 표시할 카테고리 목록
  activeCategory: string | null; // 현재 활성화된 카테고리
  onCategoryClick: (category: string) => void; // 카테고리 클릭 시 호출될 함수
  className?: string; // 외부에서 추가할 Tailwind CSS 클래스
}

const BookCategoryFilter: React.FC<BookCategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryClick,
  className = "",
}) => {
  return (
    <div className={`flex justify-center space-x-4 ${className}`}>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryClick(category)}
          className={`px-8 py-1 rounded-xl text-sm transition-colors duration-200 whitespace-nowrap
            ${
              activeCategory === category
                ? "bg-apply text-white" // 선택된 카테고리 스타일
                : "border border-apply text-apply hover:bg-apply hover:text-white" // 기본/호버 스타일
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default BookCategoryFilter;
