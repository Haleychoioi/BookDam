import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Enter 키 입력 시 검색 실행
const HomeHeroSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 검색 실행 로직 (SearchBar의 executeSearch 로직과 동일하게 적용)

  const executeSearch = () => {
    const processedSearchTerm = searchTerm.replace(/\s/g, ""); // 모든 공백 제거

    // ✨ 검색어가 아예 비어있을 때만 alert를 띄우고 중단 ✨
    if (processedSearchTerm.length === 0) {
      alert("검색어를 입력해주세요."); // 검색어가 없다는 메시지로 변경
      return; // 검색 실행 중단
    }

    // 1글자 이상이면 모두 검색 실행
    const searchPath = `/search/books?q=${encodeURIComponent(
      processedSearchTerm
    )}`;
    navigate(searchPath);
  };

  // Enter 키 입력 시 검색 실행 (수정)
  const handleSearchOnEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      executeSearch(); // ✨ executeSearch 함수 호출 ✨
    }
  };

  // ✨ document에 Enter 키 리스너 추가 (인풋에 포커스) - 수정 없음 ✨
  useEffect(() => {
    const handleGlobalEnterKey = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (
          searchInputRef.current &&
          document.activeElement !== searchInputRef.current
        ) {
          searchInputRef.current.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalEnterKey);

    return () => {
      document.removeEventListener("keydown", handleGlobalEnterKey);
    };
  }, []);

  return (
    <section className="bg-category py-32">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl text-gray-600 mb-6">
          독서와 사람을 연결하는 플랫폼
          <br />
          지금 시작하세요
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          독서로 연결되고, 닉네임으로 소통하다. 익명으로 더 깊은 대화를
          시작하세요.
        </p>

        <div className="max-w-xl mx-auto flex items-center pt-12 ">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="어떤 책을 찾아볼까요?"
            className="flex-grow h-12 p-3 border-none focus:outline-none focus:ring-0 focus:border-transparent rounded-l-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchOnEnter}
          />
          <button
            onClick={executeSearch}
            className="h-12
              px-6
              py-2
              bg-main
              text-white
              font-medium
              rounded-r-xl
              rounded-none
              focus:outline-none
              focus:ring-0
              focus:border-transparent "
          >
            검색
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;
