// src/components/bookDetail/BookDetailHeroSection.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import Button from "../common/Button";
import HeartButton from "../common/HeartButton";
import { FaCaretDown, FaQuestionCircle } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import type { BookDetail } from "../../types";
import {
  addWish,
  removeWish,
  upsertBookToMyLibrary,
  fetchMyLibrary,
} from "../../api/mypage"; // fetchMyLibrary 임포트 추가
import axios from "axios";

interface BookDetailHeroSectionProps {
  book: BookDetail;
  onCreateCommunityClick: (bookId: string) => void;
}

const BookDetailHeroSection: React.FC<BookDetailHeroSectionProps> = ({
  book,
  onCreateCommunityClick,
}) => {
  const queryClient = useQueryClient();
  const [isAddToListDropdownOpen, setIsAddToListDropdownOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isHoveringQuestion, setIsHoveringQuestion] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  const [isBookWishlisted, setIsBookWishlisted] = useState(book.isWished);

  // 컴포넌트 마운트 시 또는 book.isbn13 변경 시 해당 책의 내 서재 평점 불러오기
  useEffect(() => {
    const loadBookMyLibraryStatus = async () => {
      // 모든 내 서재 책을 불러오는 것은 비효율적일 수 있으나, 현재는 특정 책만 조회하는 API가 없음
      try {
        const response = await fetchMyLibrary(1, 1000); // 충분히 큰 limit으로 모든 책을 가져옴 (임시 방편)
        const myLibraryBook = response.data.find(
          (item) => item.book.isbn13 === book.isbn13
        );
        if (
          myLibraryBook &&
          myLibraryBook.myRating !== null &&
          myLibraryBook.myRating !== undefined
        ) {
          setSelectedRating(myLibraryBook.myRating);
        } else {
          setSelectedRating(0); // 해당 책이 서재에 없거나 평점이 없으면 0으로 초기화
        }
      } catch (error) {
        console.error("Failed to load my library status for book:", error);
        setSelectedRating(0); // 오류 발생 시 0으로 초기화
      }
    };

    loadBookMyLibraryStatus();
  }, [book.isbn13]); // book.isbn13이 변경될 때마다 다시 불러옴

  const toggleAddToListDropdown = () => {
    setIsAddToListDropdownOpen((prevState) => !prevState);
  };

  const handleAddToList = useCallback(
    async (status: "WANT_TO_READ" | "READING" | "COMPLETED") => {
      if (status === "COMPLETED" && selectedRating === 0) {
        alert("별점을 선택해야 '읽었음'으로 추가할 수 있습니다.");
        return;
      }
      try {
        await upsertBookToMyLibrary(
          book.isbn13,
          status,
          selectedRating || null
        );

        setIsAddToListDropdownOpen(false);
        // setSelectedRating(0); // 이 라인을 제거하여 평점이 유지되도록 함

        queryClient.invalidateQueries({ queryKey: ["myLibrary"] });
      } catch (error: unknown) {
        console.error("내 서재 추가/수정 실패:", error);
        let errorMessage = "내 서재 추가/수정 중 오류가 발생했습니다.";
        if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert(errorMessage);
      }
    },
    [book.isbn13, selectedRating, queryClient]
  );

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleWishlistClick = useCallback(
    async (isWishlisted: boolean) => {
      try {
        if (isWishlisted) {
          await addWish(book.isbn13);
        } else {
          await removeWish(book.isbn13);
        }
        setIsBookWishlisted(isWishlisted);
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      } catch (error: unknown) {
        console.error("찜 목록 추가/삭제 실패:", error);
        let errorMessage = "찜 목록 처리 중 오류가 발생했습니다.";
        if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert(errorMessage);
        setIsBookWishlisted(!isWishlisted);
      }
    },
    [book.isbn13, queryClient]
  );

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
          <h1 className="text-3xl md:text-3xl font-bold text-gray-800 mb-7">
            {book.title}
          </h1>
          <span className="inline-block bg-category text-categoryText text-sm px-3 py-1 rounded-full mb-6">
            {book.genre}
          </span>

          <p className="text-gray-700 text-sm mb-10 leading-relaxed">
            {book.summary}
          </p>

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
              {isAddToListDropdownOpen && (
                <div className="absolute top-full mt-2 w-full z-10 left-0 bg-white shadow-lg rounded-md border border-gray-200">
                  <Button
                    onClick={() => handleAddToList("WANT_TO_READ")}
                    className="block w-full text-left px-4 py-2 mb-1"
                    bgColor="bg-transparent"
                    textColor="text-gray-700"
                    hoverBgColor="hover:bg-gray-100"
                  >
                    읽고싶어요
                  </Button>
                  <Button
                    onClick={() => handleAddToList("READING")}
                    className="block w-full text-left px-4 py-2 mb-1"
                    bgColor="bg-transparent"
                    textColor="text-gray-700"
                    hoverBgColor="hover:bg-gray-100"
                  >
                    읽는 중
                  </Button>
                  <Button
                    onClick={() => handleAddToList("COMPLETED")}
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

            <HeartButton
              onClick={handleWishlistClick}
              initialIsWishlisted={isBookWishlisted}
              className="ml-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailHeroSection;
