import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

const HomeHeroSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enter 키 입력 시 검색 실행
  const handleSearchOnEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      // ✨ searchTerm이 한 글자 이상일 때만 검색 실행 ✨
      if (searchTerm.length > 0) {
        const searchPath = `/search/books?q=${encodeURIComponent(searchTerm)}`;
        navigate(searchPath);
      }
      // 검색어가 없으면 아무 동작도 하지 않음
    }
  };

  // ✨ document에 Enter 키 리스너 추가 (인풋에 포커스) ✨
  useEffect(() => {
    const handleGlobalEnterKey = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        // 현재 포커스된 요소가 인풋 필드가 아닐 때만 포커스
        if (
          searchInputRef.current &&
          document.activeElement !== searchInputRef.current
        ) {
          searchInputRef.current.focus();
          event.preventDefault(); // 기본 Enter 동작(예: 폼 제출) 방지
        }
      }
    };

    document.addEventListener("keydown", handleGlobalEnterKey);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener("keydown", handleGlobalEnterKey);
    };
  }, []); // 빈 배열은 컴포넌트가 마운트될 때 한 번만 실행됨

  return (
    <section className="bg-gray-500 py-32">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl text-gray-50 mb-6">
          독서와 사람을 연결하는 플랫폼
          <br />
          지금 시작하세요
        </h1>
        <p className="text-lg text-gray-200 mb-8">
          독서로 연결되고, 닉네임으로 소통하다. 익명으로 더 깊은 대화를
          시작하세요.
        </p>

        <div className="max-w-xl mx-auto flex items-center pt-12">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="어떤 책을 찾아볼까요?"
            className="flex-grow h-12 p-3 border-none focus:outline-none focus:ring-0 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchOnEnter}
          />
          <Button
            to={
              searchTerm
                ? `/search/books?q=${encodeURIComponent(searchTerm)}`
                : "/search/books"
            }
            className="h-12 rounded-none"
            disabled={!searchTerm && false}
          >
            검색
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;
