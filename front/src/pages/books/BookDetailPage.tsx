import React from "react";
// import { useParams } from "react-router-dom";
import SearchBar from "../../components/common/SearchBar";
import BookDetailHeroSection from "../../components/books/BookDetailHero";
import BookDetailDescription from "../../components/books/BookDetailDescriptionSection";
import BookCarousel from "../../components/books/BookCarousel";
import CommunityCarousel from "../../components/books/CommunityCarousel";

// 더미 도서 데이터 (실제로는 API에서 받아올 예정)
const dummyBookData = {
  id: "book-123",
  coverImage:
    "https://via.placeholder.com/200x450/F0F0F0/B0B0B0?text=Book+Cover",
  title: "혼모노",
  author: "성해나",
  publisher: "민음사",
  pubDate: "2023-01-01",
  averageRating: 4.5,
  description: `이 책은 독서 커뮤니티 플랫폼에서 추천하는 도서입니다. 흥미로운 내용을 담고 있습니다. 상세 줄거리입니다.`,
  genre: "소설/시/희곡",
  summary: `30년차 박수무당 문수가 자신이 모시던 신령 '장수 할멈'을 20살 신출내기 무당 신혜에게 빼앗기면서 벌어지는 '진짜'와 '가짜'를 둘러싼 치열한 대결을 그린 소설 (요약)`,
  tableOfContents: [
    "첫 소설집 『빛을 건너면 빛』 (문학동네 2022)에서 타인을 이해하려는 시도를 부드럽고 따스한 시선으로 담아내고, 첫 장편소설 『두고 온 여름』 (창비 2023)에서 오해와 결별로 얼룩진 과거에 애틋한 인사를 건내고자 했던 그가 『혼모노』 에 이르러 예민해진 문제의식과 집요하게 넘치는 서사를 통해 지역, 정치, 세대 등 우리를 가르는 다양한 경계를 들여다보며 세태의 풍경을 선명하게 포착해낸다.",
    "특히 이번 소설집에는 지난해 공백없이 호명되며 문단을 휩쓸었다 해도 과언이 아닐 표제작 「혼모노」를 비롯해 작가에게 2년 연속 젊은작가상을 선사해준 「길티 클럽: 호랑이 만지기」, 이 계절의 소설과 올해의 문제소설에 선정된 「스무드」 등이 수록되어 더욱 눈길을 끈다. “작가의 ‘신령’이라 불릴(주식회사, 이기화)만큼” 『진짜 나는 재능(주식회사, 박정환)』으로 빛나는 『혼모노』, 그토록 기다려왔던 한국문학의 미래가 바로 지금 우리 앞에 도착해 있다.",
  ],
  commentaryContent: `작품마다 치밀한 취재와 정교한 구성을 바탕으로 한 개성적인 캐릭터와 강렬하고도 서늘한 서사로 평단과 독자의 주목을 고루 받으며 새로운 세대의 리얼리즘을 열어가고 있다고 평가받는 작가 성해나가 두 번째 소설집 『혼모노』를 선보인다.`,
  // ✨ recommendedBooks 데이터 추가 ✨
  recommendedBooks: [
    {
      id: "rec-1",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천1",
      title: "추천도서 1",
      author: "작가 A",
    }, // ✨ 크기 변경 ✨
    {
      id: "rec-2",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천2",
      title: "추천도서 2",
      author: "작가 B",
    }, // ✨ 크기 변경 ✨
    {
      id: "rec-3",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천3",
      title: "추천도서 3",
      author: "작가 C",
    }, // ✨ 크기 변경 ✨
    {
      id: "rec-4",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천4",
      title: "추천도서 4",
      author: "작가 D",
    }, // ✨ 크기 변경 ✨
    {
      id: "rec-5",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천5",
      title: "추천도서 5",
      author: "작가 E",
    }, // ✨ 크기 변경 ✨
  ],
};

// ✨ 더미 커뮤니티 데이터 추가 ✨
const dummyCommunities = [
  {
    id: "comm-1",
    bookCoverImage:
      "https://via.placeholder.com/192x172/FFD700/000000?text=커뮤니티책1", // 이미지 비율 조정
    title: "혼모노 함께 읽기",
    currentMembers: 5,
    maxMembers: 10,
    deadline: "2024.12.31",
  },
  {
    id: "comm-2",
    bookCoverImage:
      "https://via.placeholder.com/192x172/ADD8E6/000000?text=커뮤니티책2",
    title: "성해나 작가 팬클럽",
    currentMembers: 8,
    maxMembers: 15,
    deadline: "2024.11.15",
  },
  {
    id: "comm-3",
    bookCoverImage:
      "https://via.placeholder.com/192x172/90EE90/000000?text=커뮤니티책3",
    title: "소설 독서 모임",
    currentMembers: 3,
    maxMembers: 8,
    deadline: "2025.01.20",
  },
  {
    id: "comm-4",
    bookCoverImage:
      "https://via.placeholder.com/192x172/FFB6C1/000000?text=커뮤니티책4",
    title: "새로운 문학 탐험",
    currentMembers: 7,
    maxMembers: 12,
    deadline: "2024.10.01",
  },
  {
    id: "comm-5",
    bookCoverImage:
      "https://via.placeholder.com/192x172/D3D3D3/000000?text=커뮤니티책5",
    title: "주말 독서 클럽",
    currentMembers: 4,
    maxMembers: 10,
    deadline: "2024.09.01",
  },
];

const BookDetailPage: React.FC = () => {
  // const { bookId } = useParams<{ bookId: string }>();

  // ✨ 실제로는 react-query를 사용하여 bookId에 해당하는 도서 상세 정보를 API에서 가져옵니다. ✨
  // const { data: book, isLoading, error } = useQuery<BookDetail>({
  //   queryKey: ['bookDetail', bookId],
  //   queryFn: () => fetchBookDetail(bookId!),
  // });

  const book = dummyBookData; // 현재는 더미 데이터 사용 (실제 API 연결 시 제거)

  if (!book) {
    return <div className="text-center py-12">도서를 찾을 수 없습니다.</div>;
  }
  // if (isLoading) return <div className="text-center py-12">도서 상세 정보 로딩 중...</div>;
  // if (error) return <div className="text-center py-12">도서 정보를 불러오는데 실패했습니다.</div>;

  return (
    <div>
      {/* 페이지 상단 검색창 배치 */}
      <div className="py-4 px-4">
        <SearchBar placeholder="도서 검색" className="max-w-lg mx-auto" />
      </div>

      {/* 도서 상세 메인 섹션과 하단 디테일 섹션을 감싸는 컨테이너 */}
      <div className="container mx-auto px-4 lg:px-48">
        {/* 반응형으로 데스크탑에서 px-64 적용 */}
        <BookDetailHeroSection book={book} />
        <BookDetailDescription book={book} />

        {book.recommendedBooks && book.recommendedBooks.length > 0 && (
          <div className="p-6 mt-8 ">
            <BookCarousel title="장르별 추천" books={book.recommendedBooks} />
          </div>
        )}

        {dummyCommunities.length > 0 && (
          <div className="p-6 mt-8">
            <CommunityCarousel
              title="모집 중 커뮤니티"
              communities={dummyCommunities}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
