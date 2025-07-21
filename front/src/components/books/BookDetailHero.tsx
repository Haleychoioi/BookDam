import React, { useState, useRef, useEffect } from "react";
import Button from "../common/Button";
import StarButton from "../common/StarButton";
import { FaCaretDown } from "react-icons/fa";

interface BookDetailHeroSectionProps {
  book: {
    id: string;
    coverImage: string;
    title: string;
    author: string;
    publisher: string;
    pubDate: string;
    averageRating: number;
    description: string;
    genre: string;
    summary: string;
  };
}

const BookDetailHeroSection: React.FC<BookDetailHeroSectionProps> = ({
  book,
}) => {
  const [isAddToListDropdownOpen, setIsAddToListDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleAddToListDropdown = () => {
    setIsAddToListDropdownOpen((prevState) => !prevState);
  };

  const handleAddToList = (status: "읽고싶어요" | "읽는 중" | "읽었음") => {
    alert(`${book.title}을/를 [${status}]에 추가했습니다.`);
    setIsAddToListDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAddToListDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white p-10 mb-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* 도서 커버 이미지 */}
        <div className="flex-shrink-0 mr-10">
          <img
            src={
              book.coverImage ||
              "https://via.placeholder.com/200x450/F0F0F0/B0B0B0?text=Book+Cover"
            } // ✨ 이미지 플레이스홀더 높이 450으로 변경 (디자인과 유사하게) ✨
            alt={book.title}
            className="w-[381px] h-[528px] object-cover shadow-lg rounded-md" // ✨ 이미지 크기 조정 ✨
          />
        </div>

        {/* 도서 정보 및 메타데이터 */}
        <div className="flex-grow text-left">
          {/* 도서 제목 */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-7">
            {book.title}
          </h1>
          {/* 카테고리/장르 태그 */}
          <span className="inline-block bg-category text-categoryText text-sm px-3 py-1 rounded-full mb-6">
            {book.genre}
          </span>

          {/* 이미지에 보이는 요약 부분 */}
          <p className="text-gray-700 text-sm mb-10 leading-relaxed">
            {book.summary}
          </p>

          {/* 커뮤니티 모집하기, 서재 추가, 찜 버튼 */}
          <div className="flex items-center mb-8">
            {/* 커뮤니티 모집하기 버튼 - 너비 auto, 오른쪽 마진 추가 */}
            <Button
              bgColor="bg-main"
              textColor="text-white"
              hoverBgColor="hover:bg-apply"
              className=" px-4 py-2 w-auto mr-2 flex-1 "
            >
              커뮤니티 모집하기
            </Button>

            {/* 서재 추가 버튼과 드롭다운을 묶는 div - flex-1 유지 */}
            <div className="flex-1 relative" ref={dropdownRef}>
              {/* 서재 추가 버튼 - w-full 유지 */}
              <Button
                onClick={toggleAddToListDropdown}
                bgColor="bg-main"
                textColor="text-white"
                hoverBgColor="hover:bg-apply"
                className="px-4 py-2 w-full flex items-center justify-center space-x-2 flex-1"
              >
                <span>서재 추가</span>
                <FaCaretDown className="h-4 w-4" />
              </Button>
              {/* 드롭다운 메뉴 */}
              {isAddToListDropdownOpen && (
                <div className="absolute top-full mt-2 w-full py-1 z-10 left-0">
                  <Button
                    onClick={() => handleAddToList("읽고싶어요")}
                    className="block w-full text-left px-4 py-2 mb-1"
                    bgColor="bg-gray-100"
                    textColor="text-gray-500"
                    hoverBgColor="hover:bg-apply"
                  >
                    읽고싶어요
                  </Button>
                  <Button
                    onClick={() => handleAddToList("읽는 중")}
                    className="block w-full text-left px-4 py-2 mb-1"
                    bgColor="bg-gray-100"
                    textColor="text-gray-500"
                    hoverBgColor="hover:bg-apply"
                  >
                    읽는 중
                  </Button>
                  <Button
                    onClick={() => handleAddToList("읽었음")}
                    className="block w-full text-left px-4 py-2"
                    bgColor="bg-gray-100"
                    textColor="text-gray-500"
                    hoverBgColor="hover:bg-apply"
                  >
                    읽었음
                  </Button>
                </div>
              )}
            </div>

            {/* 찜 버튼 (StarButton) - 왼쪽 마진 추가 */}
            <StarButton
              onClick={() => console.log("찜 버튼 클릭됨")}
              initialIsWishlisted={false}
              className="ml-2" // ✨ ml-2 추가 ✨
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailHeroSection;
