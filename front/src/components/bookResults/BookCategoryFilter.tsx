// src/components/bookResults/BookCategoryFilter.tsx

interface BookCategoryFilterProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryClick: (category: string) => void;
  className?: string;
}

const BookCategoryFilter: React.FC<BookCategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryClick,
  className = "",
}) => {
  return (
    <div
      className={`flex justify-center flex-wrap gap-x-3 gap-y-3 ${className}`}
    >
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryClick(category)}
          className={`flex-shrink-0 px-6 py-1 rounded-xl text-sm transition-colors duration-200
            ${
              activeCategory === category
                ? "bg-apply text-white"
                : "border border-apply text-apply hover:bg-apply hover:text-white"
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default BookCategoryFilter;
