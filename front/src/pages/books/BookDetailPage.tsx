import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import SearchBar from "../../components/common/SearchBar";
import BookDetailHeroSection from "../../components/bookDetail/BookDetailHeroSection";
import BookDetailDescription from "../../components/bookDetail/BookDetailDescriptionSection";
import BookCarousel from "../../components/bookDetail/BookCarousel";
import CommunityCarousel from "../../components/bookDetail/CommunityCarousel";
import ApplyToCommunityModal from "../../components/modals/ApplyToCommunityModal";
import CreateCommunityModal from "../../components/modals/CreateCommunityModal";

import type { BookDetail, Community } from "../../types";

const dummyCommunities: Community[] = [
  {
    id: "comm1",

    title: "해리포터 완독 챌린지",

    description:
      "함께 해리포터 전 시리즈를 읽고 토론하는 모임입니다. 매주 일요일 온라인으로 만나요!",

    hostName: "산삼",

    currentMembers: 2,

    maxMembers: 8,

    role: "member",

    status: "모집중",
  },

  {
    id: "comm2",

    title: "노인과 바다 심층 분석",

    description:
      "헤밍웨이의 노인과 바다를 문학적 관점에서 심층적으로 분석하고 감상을 나눕니다.",

    hostName: "문학소녀",

    currentMembers: 5,

    maxMembers: 10,

    role: "member",

    status: "모집중",
  },

  {
    id: "comm3",

    title: "삼국지 덕후 모여라!",

    description:
      "나관중 삼국지를 완독하고, 인물과 사건에 대해 자유롭게 토론하는 커뮤니티입니다.",

    hostName: "책벌레왕",

    currentMembers: 7,

    maxMembers: 15,

    role: "host",

    status: "모집중",
  },

  {
    id: "comm4",

    title: "프로젝트 헤일메리 독서 클럽",

    description:
      '앤디 위어의 소설 "프로젝트 헤일메리"를 읽고 과학적 상상력에 대해 이야기해요.',

    hostName: "SF매니아",

    currentMembers: 3,

    maxMembers: 7,

    role: "member",

    status: "모집종료",
  },

  {
    id: "comm5",

    title: "고전 소설 다시 읽기",

    description:
      "잊혀진 고전 소설들을 다시 읽고 현대적 관점에서 재해석하는 모임입니다.",

    hostName: "옛것좋아",

    currentMembers: 4,

    maxMembers: 8,

    role: "member",

    status: "모집중",
  },

  {
    id: "comm6",

    title: "추리 소설의 밤",

    description:
      "매달 새로운 추리 소설을 읽고 범인을 추리하며 스릴을 만끽하는 모임.",

    hostName: "명탐정코난",

    currentMembers: 6,

    maxMembers: 12,

    role: "member",

    status: "모집중",
  },
];

const dummyBookData: BookDetail = {
  isbn13: "9788937460123",
  coverImage: "https://picsum.photos/seed/book123/200/450",
  title: "혼모노",
  author: "성해나",
  publisher: "민음사", // BookDetail에 포함된 필드
  publicationDate: "2023-01-01", // BookDetail에 포함된 필드
  averageRating: 4.5, // BookDetail에 포함된 필드
  description: `이 책은 독서 커뮤니티 플랫폼에서 추천하는 도서입니다. 흥미로운 내용을 담고 있습니다. 상세 줄거리입니다.`, // BookDetail에 포함된 필드
  genre: "소설/시/희곡", // BookDetail에 포함된 필드
  summary: `30년차 박수무당 문수가 자신이 모시던 신령 '장수 할멈'을 20살 신출내기 무당 신혜에게 빼앗기면서 벌어지는 '진짜'와 '가짜'를 둘러싼 치열한 대결을 그린 소설 (요약)`,
  tableOfContents: [
    "첫 소설집 『빛을 건너면 빛』 (문학동네 2022)",
    "젊은작가상 선사해준 「길티 클럽: 호랑이 만지기」",
  ],
  commentaryContent: `작품마다 치밀한 취재와 정교한 구성을 바탕으로 한 개성적인 캐릭터와 강렬하고도 서늘한 서사로 평단과 독자의 주목을 고루 받으며 새로운 세대의 리얼리즘을 열어가고 있다고 평가받는 작가 성해나가 두 번째 소설집 『혼모노』를 선보인다.`,
  communityCount: 6,
  isWished: false,
  recommendedBooks: [
    {
      isbn13: "9788937460124", // isbn13 필드
      coverImage: "https://picsum.photos/seed/book123/200/450",
      title: "추천도서 1",
      author: "작가 A",
      publisher: "추천출판사1", // ★★★ 누락된 필드 추가
      publicationDate: "2022-01-01", // ★★★ 누락된 필드 추가
      description: "추천도서1에 대한 간략한 설명입니다.", // ★★★ 누락된 필드 추가
      genre: "판타지", // ★★★ 누락된 필드 추가
    },
    {
      isbn13: "9788937460125", // isbn13 필드
      coverImage: "https://picsum.photos/seed/book123/200/450",
      title: "추천도서 2",
      author: "작가 B",
      publisher: "추천출판사2", // ★★★ 누락된 필드 추가
      publicationDate: "2022-02-01", // ★★★ 누락된 필드 추가
      description: "추천도서2에 대한 간략한 설명입니다.", // ★★★ 누락된 필드 추가
      genre: "에세이", // ★★★ 누락된 필드 추가
    },
    {
      isbn13: "9788937460126", // isbn13 필드
      coverImage: "https://picsum.photos/seed/book123/200/450",
      title: "추천도서 3",
      author: "작가 C",
      publisher: "추천출판사3", // ★★★ 누락된 필드 추가
      publicationDate: "2022-03-01", // ★★★ 누락된 필드 추가
      description: "추천도서3에 대한 간략한 설명입니다.", // ★★★ 누락된 필드 추가
      genre: "자기계발", // ★★★ 누락된 필드 추가
    },
  ],
};

const mockBookDetails: { [key: string]: BookDetail } = {
  "9788937460123": dummyBookData, // 키 값도 isbn13에 맞춰 변경

  // 아래 "book-1", "book-2" 키를 사용하려면 useParams로 넘어오는 값이 "book-1", "book-2"여야 하고,
  // 실제 백엔드 연동 시에는 isbn13 값인 "978..." 형태의 키로 변경하는 것을 권장합니다.
  "book-1": {
    isbn13: "9788937460001", // 'id' 대신 'isbn13'으로 변경
    coverImage: "https://via.placeholder.com/200x450/F0F0F0/B0B0B0?text=Book+1",
    title: "리팩터링 2판",
    author: "마틴 파울러",
    publisher: "한빛미디어",
    publicationDate: "2019-01-01",
    description: "소프트웨어 개발의 고전, 코드 품질 개선의 필수 지침서입니다.",
    communityCount: 3,
    isWished: false,
    genre: "컴퓨터/IT",
    summary: "리팩토링에 대한 고전적인 지침서",
    tableOfContents: ["1장. 리팩토링 소개"],
    commentaryContent: "소프트웨어 품질 개선의 바이블",
    averageRating: 4.8,
    recommendedBooks: dummyBookData.recommendedBooks, // 이 부분도 위의 변경된 구조를 따릅니다.
  },

  "book-2": {
    isbn13: "9788937460002", // 'id' 대신 'isbn13'으로 변경
    coverImage: "https://via.placeholder.com/200x450/F0F0F0/B0B0B0?text=Book+2",
    title: "클린 코드",
    author: "로버트 C. 마틴",
    publisher: "인사이트",
    publicationDate: "2008-08-08",
    description: "개발자들이 반드시 알아야 할 클린 코드 작성법을 다룹니다.",
    communityCount: 3,
    isWished: true,
    genre: "컴퓨터/IT",
    summary: "좋은 코드를 작성하는 방법론",
    tableOfContents: ["1장. 깨끗한 코드"],
    commentaryContent: "소프트웨어 장인의 길",
    averageRating: 4.7,
    recommendedBooks: dummyBookData.recommendedBooks, // 이 부분도 위의 변경된 구조를 따릅니다.
  },
};

const mockBookCommunities: { [key: string]: Community[] } = {
  "book-1": [dummyCommunities[0], dummyCommunities[1], dummyCommunities[2]],

  "book-2": [dummyCommunities[3], dummyCommunities[4]],

  "book-123": dummyCommunities,
};

const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  // const navigate = useNavigate(); // useNavigate 훅 사용

  // 책 정보 상태 (useParams의 bookId에 따라 동적으로 가져오기)
  const [book, setBook] = useState<BookDetail | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모달 관련 상태
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, setBookIdForCreate] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // useParams로 받은 bookId를 사용하여 Mock 데이터에서 도서 정보 가져오기
    const fetchedBook: BookDetail | undefined = mockBookDetails[bookId || ""];

    const fetchedCommunities: Community[] | undefined =
      mockBookCommunities[bookId || ""] || [];

    if (fetchedBook) {
      setBook(fetchedBook);
      setCommunities(fetchedCommunities || []); // undefined일 경우 빈 배열로 초기화
    } else {
      setError("도서 정보를 찾을 수 없습니다.");
    }

    setLoading(false);

    window.scrollTo(0, 0); // 페이지 로드 시 상단으로 스크롤
  }, [bookId]);

  const handleApplyCommunityClick = (communityId: string) => {
    setSelectedCommunityId(communityId);
    setIsApplyModalOpen(true);
  };

  const handleApplyModalClose = () => {
    setIsApplyModalOpen(false);
    setSelectedCommunityId(null);
  };

  const handleCreateCommunityClick = (bookId: string) => {
    setBookIdForCreate(bookId);
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setBookIdForCreate(null);
  };

  const handleCommunityCreate = async (
    bookId: string,
    communityName: string,
    maxMembers: number,
    description: string
  ) => {
    console.log(`커뮤니티 생성 요청:`);
    console.log(` 책 ID: ${bookId}`);
    console.log(` 이름: ${communityName}`);
    console.log(` 모집 인원: ${maxMembers}`);
    console.log(` 소개: ${description}`);

    try {
      alert("커뮤니티가 성공적으로 생성되었습니다!");
      handleCreateModalClose();
    } catch (error) {
      console.error("커뮤니티 생성 중 오류 발생:", error);
      alert("커뮤니티 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        도서 정보 로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-xl text-red-700">{error}</div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        도서 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div className="py-4 px-4">
        <SearchBar placeholder="도서 검색" className="max-w-lg mx-auto" />
      </div>

      <div className="container mx-auto px-4 lg:px-48">
        {/* book={dummyBookData} 대신 동적으로 로드된 book 객체 사용 */}

        <BookDetailHeroSection
          book={book} // book은 이제 BookDetail 타입 또는 null/undefined. 위에서 null/undefined 체크했으므로 여기서는 BookDetail 확정.
          onCreateCommunityClick={handleCreateCommunityClick}
        />

        <BookDetailDescription book={book} />

        {communities.length > 0 && (
          <div className="p-6 mt-8">
            <CommunityCarousel
              title={`모집 중인 [${book.title}] 커뮤니티`}
              communities={communities}
              onApplyClick={handleApplyCommunityClick}
            />
          </div>
        )}

        {/* book.recommendedBooks는 BookDetail에 있으므로 이제 직접 사용 */}

        {book.recommendedBooks && // recommendedBooks가 optional일 수 있으므로 존재 여부 확인
          book.recommendedBooks.length > 0 && (
            <div className="p-6 mt-8 ">
              <BookCarousel title="장르별 추천" books={book.recommendedBooks} />
            </div>
          )}

        <ApplyToCommunityModal
          isOpen={isApplyModalOpen}
          onClose={handleApplyModalClose}
          communityId={selectedCommunityId || ""}
        />

        {bookId && (
          <CreateCommunityModal
            isOpen={isCreateModalOpen}
            onClose={handleCreateModalClose}
            bookId={bookId}
            onCommunityCreate={handleCommunityCreate}
          />
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
