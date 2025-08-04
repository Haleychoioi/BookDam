import { useState, useRef, useEffect } from "react";
import Button from "../common/Button";
import HeartButton from "../common/HeartButton";
import { FaCaretDown, FaQuestionCircle } from "react-icons/fa";

import type { BookDetail } from "../../types";

interface BookDetailHeroSectionProps {
  book: BookDetail;
  onCreateCommunityClick: (bookId: string) => void;
}

const BookDetailHeroSection: React.FC<BookDetailHeroSectionProps> = ({
  book,
  onCreateCommunityClick,
}) => {
  const [isAddToListDropdownOpen, setIsAddToListDropdownOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isHoveringQuestion, setIsHoveringQuestion] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  const toggleAddToListDropdown = () => {
    setIsAddToListDropdownOpen((prevState) => !prevState);
  };

  const handleAddToList = (status: "읽고싶어요" | "읽는 중" | "읽었음") => {
    // '읽었음'은 별점이 선택되었을 때만 가능하도록
    if (status === "읽었음" && selectedRating === 0) {
      alert("별점을 선택해야 '읽었음'으로 추가할 수 있습니다.");
      return;
    }
    alert(`${book.title}을/를 [${status}]에 추가했습니다.`);
    // TODO: 실제 API 호출 로직 추가 (내 서재 추가 POST /books/:id/my-library)
    setIsAddToListDropdownOpen(false);
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleWishlistClick = (isWishlisted: boolean) => {
    // TODO: 찜 목록 추가/삭제 API 호출 (POST /books/:bookId/wishlist)
    if (isWishlisted) {
      alert(`${book.title}을 찜 목록에 추가했습니다.`);
    } else {
      alert(`${book.title}을 찜 목록에서 제거했습니다.`);
    }
    console.log("찜 버튼 클릭됨. 현재 찜 상태:", isWishlisted);
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
    <div className="bg-white p-10 my-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* 도서 커버 이미지 */}
        <div className="flex-shrink-0 mr-10">
          <img
            src={
              book.coverImage ||
              "https://via.placeholder.com/200x450/F0F0F0/B0B0B0?text=Book+Cover"
            }
            alt={book.title}
            className="w-[280px] h-[390px] object-cover rounded-md"
          />
        </div>

        <div className="flex-grow text-left">
          {/* 도서 제목 */}
          <h1 className="text-3xl md:text-3xl font-bold text-gray-800 mb-7">
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

          {/* 별점 섹션 */}
          <div className="flex items-center justify-center mb-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`cursor-pointer text-4xl mr-1 ${
                  index < selectedRating ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => handleStarClick(index + 1)}
              >
                ★
              </span>
            ))}
            {/* 물음표 아이콘 및 호버 설명 */}
            <div
              className="relative ml-2 cursor-pointer"
              onMouseEnter={() => setIsHoveringQuestion(true)}
              onMouseLeave={() => setIsHoveringQuestion(false)}
              ref={questionRef}
            >
              <FaQuestionCircle className="h-6 w-6 text-gray-400" />
              {isHoveringQuestion && (
                <div className="absolute left-full ml-2 w-max p-2 bg-gray-700 text-white text-xs rounded-md shadow-lg z-20">
                  별점을 주고 내 서재에 <br />
                  "읽은 책"으로 보관할 수 있어요!
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center mb-8">
            {/* 커뮤니티 모집하기 버튼 - 너비 auto, 오른쪽 마진 추가 */}
            <Button
              bgColor="bg-main"
              textColor="text-white"
              hoverBgColor="hover:bg-apply"
              className="px-4 py-2 w-auto mr-2 flex-1"
              onClick={() => onCreateCommunityClick(book.isbn13)}
            >
              커뮤니티 모집하기
            </Button>

            <div className="flex-1 relative" ref={dropdownRef}>
              {/* 서재 추가 버튼 */}
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
                <div className="absolute top-full mt-2 w-full z-10 left-0 bg-white shadow-lg rounded-md border border-gray-200">
                  <Button
                    onClick={() => handleAddToList("읽고싶어요")}
                    className="block w-full text-left px-4 py-2 mb-1"
                    bgColor="bg-transparent"
                    textColor="text-gray-700"
                    hoverBgColor="hover:bg-gray-100"
                  >
                    읽고싶어요
                  </Button>
                  <Button
                    onClick={() => handleAddToList("읽는 중")}
                    className="block w-full text-left px-4 py-2 mb-1"
                    bgColor="bg-transparent"
                    textColor="text-gray-700"
                    hoverBgColor="hover:bg-gray-100"
                  >
                    읽는 중
                  </Button>
                  <Button
                    onClick={() => handleAddToList("읽었음")}
                    className={`block w-full text-left px-4 py-2 ${
                      selectedRating === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    bgColor="bg-transparent"
                    textColor="text-gray-700"
                    hoverBgColor="hover:bg-gray-100"
                    disabled={selectedRating === 0}
                  >
                    읽었음
                  </Button>
                </div>
              )}
            </div>

            {/* 찜 버튼  */}
            <HeartButton
              onClick={handleWishlistClick}
              initialIsWishlisted={false} // 초기 찜 상태 (백엔드에서 가져와야 함)
              className="ml-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailHeroSection;
