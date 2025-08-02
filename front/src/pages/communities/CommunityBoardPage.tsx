// src/pages/communities/CommunityBoardPage.tsx

import { useEffect, useState, useCallback } from "react"; // useCallback 추가
import { useNavigate, useParams } from "react-router-dom";
import BoardTemplate from "../../components/posts/BoardTemplate";
import type { TeamCommunity, TeamPost } from "../../types";

import { fetchCommunityById } from "../../api/communities";
import { fetchTeamPosts } from "../../api/teamPosts";
import { useAuth } from "../../hooks/useAuth";

const CommunityBoardPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { currentUserProfile, loading: authLoading } = useAuth();

  const [, setCommunityInfo] = useState<TeamCommunity | null>(null);
  const [communityPosts, setCommunityPosts] = useState<TeamPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const parsedCommunityId = communityId ? Number(communityId) : NaN; // communityId를 숫자로 파싱

  // 게시물 상세 정보 및 커뮤니티 데이터 불러오기
  const loadCommunityData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // ✨ 유효하지 않은 커뮤니티 ID 검사 (API 호출 전에) ✨
    if (isNaN(parsedCommunityId)) {
      setError("유효하지 않은 커뮤니티 ID입니다. 올바른 경로로 접속해주세요.");
      setLoading(false);
      return; // API 호출 중단
    }

    if (!authLoading && !currentUserProfile) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      // fetchCommunityById는 이제 number를 인자로 받습니다.
      const communityResponse = await fetchCommunityById(parsedCommunityId);
      setCommunityInfo(communityResponse);

      // fetchTeamPosts는 communityId를 string으로 받으므로 다시 string으로 변환
      const postsResponse = await fetchTeamPosts(
        String(parsedCommunityId),
        currentPage,
        10,
        "latest"
      );
      setCommunityPosts(postsResponse.posts);
      setTotalPages(Math.ceil(postsResponse.totalResults / 10));
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("커뮤니티 데이터를 불러오기 실패:", err);
        setError(err.message || "커뮤니티 데이터를 불러오는데 실패했습니다.");
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [parsedCommunityId, currentUserProfile, authLoading, currentPage]); // 의존성 배열 업데이트

  useEffect(() => {
    if (!authLoading && currentUserProfile) {
      loadCommunityData();
    } else if (!authLoading && !currentUserProfile) {
      setLoading(false);
      setError("로그인이 필요합니다.");
    }
    window.scrollTo(0, 0);
  }, [authLoading, currentUserProfile, loadCommunityData]); // 의존성 배열 업데이트

  const handleWritePostClick = () => {
    navigate(`/communities/${communityId}/posts/write`);
  };

  const handlePostClick = (postId: number) => {
    navigate(`/communities/${communityId}/posts/${postId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <BoardTemplate
        boardTitle="게시물"
        posts={[]}
        onWritePostClick={handleWritePostClick}
        onPostClick={handlePostClick}
        isLoading={true}
        currentPage={1}
        totalPages={1}
        onPageChange={handlePageChange}
      />
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">오류: {error}</div>;
  }

  return (
    <BoardTemplate
      boardTitle="게시물"
      posts={communityPosts}
      onWritePostClick={handleWritePostClick}
      onPostClick={handlePostClick}
      isLoading={false}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
};

export default CommunityBoardPage;
