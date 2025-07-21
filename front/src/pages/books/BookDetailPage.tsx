// front/src/pages/BookDetailPage.tsx

import React, { useState } from "react";
import SearchBar from "../../components/common/SearchBar";
import BookDetailHeroSection from "../../components/bookDetail/BookDetailHeroSection";
import BookDetailDescription from "../../components/bookDetail/BookDetailDescriptionSection";
import BookCarousel from "../../components/bookDetail/BookCarousel";
import CommunityCarousel from "../../components/bookDetail/CommunityCarousel"; // 경로 확인
import ApplyToCommunityModal from "../../components/modals/ApplyToCommunityModal";
import CreateCommunityModal from "../../components/modals/CreateCommunityModal"; // ✨ 새 모달 컴포넌트 임포트 ✨

// 더미 도서 데이터 (기존과 동일)
const dummyBookData = {
  id: "book-123", // BookDetailHeroSection으로 전달될 book.id
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
  recommendedBooks: [
    {
      id: "rec-1",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천1",
      title: "추천도서 1",
      author: "작가 A",
    },
    {
      id: "rec-2",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천2",
      title: "추천도서 2",
      author: "작가 B",
    },
    {
      id: "rec-3",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천3",
      title: "추천도서 3",
      author: "작가 C",
    },
    {
      id: "rec-4",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천4",
      title: "추천도서 4",
      author: "작가 D",
    },
    {
      id: "rec-5",
      coverImage:
        "https://via.placeholder.com/192x288/B0B0B0/FFFFFF?text=추천5",
      title: "추천도서 5",
      author: "작가 E",
    },
  ],
};

// Community 인터페이스 정의
interface Community {
  id: string;
  title: string;
  description: string;
  hostName: string;
  currentMembers: number;
  maxMembers: number;
}

const dummyCommunities: Community[] = [
  {
    id: "comm1",
    title: "해리포터 완독 챌린지",
    description:
      "함께 해리포터 전 시리즈를 읽고 토론하는 모임입니다. 매주 일요일 온라인으로 만나요!",
    hostName: "산삼",
    currentMembers: 2,
    maxMembers: 8,
  },
  {
    id: "comm2",
    title: "노인과 바다 심층 분석",
    description:
      "헤밍웨이의 노인과 바다를 문학적 관점에서 심층적으로 분석하고 감상을 나눕니다.",
    hostName: "문학소녀",
    currentMembers: 5,
    maxMembers: 10,
  },
  {
    id: "comm3",
    title: "삼국지 덕후 모여라!",
    description:
      "나관중 삼국지를 완독하고, 인물과 사건에 대해 자유롭게 토론하는 커뮤니티입니다.",
    hostName: "책벌레왕",
    currentMembers: 7,
    maxMembers: 15,
  },
  {
    id: "comm4",
    title: "프로젝트 헤일메리 독서 클럽",
    description:
      '앤디 위어의 소설 "프로젝트 헤일메리"를 읽고 과학적 상상력에 대해 이야기해요.',
    hostName: "SF매니아",
    currentMembers: 3,
    maxMembers: 7,
  },
  {
    id: "comm5",
    title: "고전 소설 다시 읽기",
    description:
      "잊혀진 고전 소설들을 다시 읽고 현대적 관점에서 재해석하는 모임입니다.",
    hostName: "옛것좋아",
    currentMembers: 4,
    maxMembers: 8,
  },
  {
    id: "comm6",
    title: "추리 소설의 밤",
    description:
      "매달 새로운 추리 소설을 읽고 범인을 추리하며 스릴을 만끽하는 모임.",
    hostName: "명탐정코난",
    currentMembers: 6,
    maxMembers: 12,
  },
];

const BookDetailPage: React.FC = () => {
  const dummyBook = dummyBookData; // bookId를 dummyBook.id에서 가져옵니다.

  // ✨ 커뮤니티 가입 신청 모달 관련 상태 ✨
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCommunityForApply, setSelectedCommunityForApply] = useState<{
    id: string;
  } | null>(null);

  // ✨ 커뮤니티 생성 모달 관련 상태 ✨
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bookIdForCreate, setBookIdForCreate] = useState<string | null>(null); // 어떤 책을 기반으로 생성하는지 ID 저장

  // 커뮤니티 가입 신청 모달 열기
  const handleApplyCommunityClick = (communityId: string) => {
    setSelectedCommunityForApply({ id: communityId });
    setIsApplyModalOpen(true);
  };

  // 커뮤니티 가입 신청 모달 닫기
  const handleApplyModalClose = () => {
    setIsApplyModalOpen(false);
    setSelectedCommunityForApply(null);
  };

  // 커뮤니티 가입 신청 처리 (API 호출)
  const handleCommunityApply = async (
    communityId: string,
    applicationMessage: string
  ) => {
    console.log(`신청 커뮤니티 ID: ${communityId}`);
    console.log(`신청 메시지: ${applicationMessage}`);
    try {
      // const userId = "현재_로그인된_사용자_ID";
      // const response = await fetch(`/communities/${communityId}/apply`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, applicationMessage }),
      // });
      // if (response.ok) {
      alert("커뮤니티 가입 신청이 완료되었습니다!");
      handleApplyModalClose();
      // } else {
      //   const errorData = await response.json();
      //   alert(`커뮤니티 가입 신청 실패: ${errorData.message}`);
      // }
    } catch (error) {
      console.error("커뮤니티 가입 신청 중 오류 발생:", error);
      alert("커뮤니티 가입 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // ✨ 커뮤니티 생성 모달 열기 ✨
  const handleCreateCommunityClick = (bookId: string) => {
    setBookIdForCreate(bookId);
    setIsCreateModalOpen(true);
  };

  // ✨ 커뮤니티 생성 모달 닫기 ✨
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setBookIdForCreate(null);
  };

  // ✨ 커뮤니티 생성 처리 (API 호출) ✨
  const handleCommunityCreate = async (
    bookId: string,
    communityName: string,
    maxMembers: number,
    description: string
  ) => {
    // API 명세: POST /communities
    // 요청 바디: { bookId: string, communityName: string, description: string, maxMembers: number, userId: string }
    // userId는 실제 로그인된 사용자 ID를 사용해야 합니다.

    console.log(`커뮤니티 생성 요청:`);
    console.log(`  책 ID: ${bookId}`);
    console.log(`  이름: ${communityName}`);
    console.log(`  모집 인원: ${maxMembers}`);
    console.log(`  소개: ${description}`);

    try {
      // const userId = "현재_로그인된_사용자_ID"; // 실제 사용자 ID로 변경 필요
      // const response = await fetch('/communities', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ bookId, communityName, maxMembers, description, userId }),
      // });
      // if (response.ok) {
      alert("커뮤니티가 성공적으로 생성되었습니다!");
      handleCreateModalClose(); // 생성 성공 시 모달 닫기
      // TODO: 커뮤니티 목록 새로고침 또는 새 커뮤니티로 이동
      // } else {
      //   const errorData = await response.json();
      //   alert(`커뮤니티 생성 실패: ${errorData.message}`);
      // }
    } catch (error) {
      console.error("커뮤니티 생성 중 오류 발생:", error);
      alert("커뮤니티 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (!dummyBook) {
    return <div className="text-center py-12">도서를 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <div className="py-4 px-4">
        <SearchBar placeholder="도서 검색" className="max-w-lg mx-auto" />
      </div>

      <div className="container mx-auto px-4 lg:px-48">
        <BookDetailHeroSection
          book={dummyBook}
          onCreateCommunityClick={handleCreateCommunityClick} // ✨ 콜백 prop 전달 ✨
        />
        <BookDetailDescription book={dummyBook} />

        {dummyCommunities.length > 0 && (
          <div className="p-6 mt-8">
            <CommunityCarousel
              title={`모집 중인 [${dummyBook.title}] 커뮤니티`}
              communities={dummyCommunities}
              onApplyClick={handleApplyCommunityClick}
            />
          </div>
        )}

        {dummyBook.recommendedBooks &&
          dummyBook.recommendedBooks.length > 0 && (
            <div className="p-6 mt-8 ">
              <BookCarousel
                title="장르별 추천"
                books={dummyBook.recommendedBooks}
              />
            </div>
          )}

        {/* 커뮤니티 가입 신청 모달 렌더링 */}
        {selectedCommunityForApply && (
          <ApplyToCommunityModal
            isOpen={isApplyModalOpen}
            onClose={handleApplyModalClose}
            communityId={selectedCommunityForApply.id}
            onApply={handleCommunityApply}
          />
        )}

        {/* ✨ 커뮤니티 생성 모달 렌더링 ✨ */}
        {bookIdForCreate && ( // bookIdForCreate가 있을 때만 렌더링
          <CreateCommunityModal
            isOpen={isCreateModalOpen}
            onClose={handleCreateModalClose}
            bookId={bookIdForCreate}
            onCommunityCreate={handleCommunityCreate}
          />
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
