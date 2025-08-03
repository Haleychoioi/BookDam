// src/pages/communities/CommunityBoardPage.tsx

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BoardTemplate from "../../components/posts/BoardTemplate";
import type { TeamPost, TeamCommunityWithBookTitle } from "../../types"; // ✨ ApiResponse는 필요 없으므로 제거했습니다. ✨

import { fetchCommunityById } from "../../api/communities";
import { fetchTeamPosts } from "../../api/teamPosts";
import { useAuth } from "../../hooks/useAuth";

const CommunityBoardPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { currentUserProfile, loading: authLoading } = useAuth();

  const [communityInfo, setCommunityInfo] =
    useState<TeamCommunityWithBookTitle | null>(null);
  const [communityPosts, setCommunityPosts] = useState<TeamPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const parsedCommunityId = communityId ? Number(communityId) : NaN;

  // 게시물 상세 정보 및 커뮤니티 데이터 불러오기
  const loadCommunityData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isNaN(parsedCommunityId)) {
      setError("유효하지 않은 커뮤니티 ID입니다. 올바른 경로로 접속해주세요.");
      setLoading(false);
      return;
    }

    if (!authLoading && !currentUserProfile) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const communityResponse: any = await fetchCommunityById(
        parsedCommunityId
      );

      // 이제 communityResponse는 data 속성을 가지고 있다는 것을 가정하고 코드를 작성합니다.
      if (communityResponse && communityResponse.data) {
        setCommunityInfo(communityResponse.data);
      } else {
        // 데이터가 없을 경우 에러 처리
        setError("커뮤니티 데이터를 찾을 수 없습니다.");
      }

      // 게시물 목록 불러오기
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
  }, [parsedCommunityId, currentUserProfile, authLoading, currentPage]);

  useEffect(() => {
    if (!authLoading && currentUserProfile) {
      loadCommunityData();
    } else if (!authLoading && !currentUserProfile) {
      setLoading(false);
      setError("로그인이 필요합니다.");
    }
    window.scrollTo(0, 0);
  }, [authLoading, currentUserProfile, loadCommunityData]);

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

  if (!communityInfo) {
    return (
      <div className="text-center p-8 text-gray-700">
        커뮤니티 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <BoardTemplate
      // ✨ communityInfo에 직접 접근하여 postTitle과 bookTitle을 가져옵니다. ✨
      boardTitle={`${communityInfo.postTitle}${
        communityInfo.bookTitle ? ` - ${communityInfo.bookTitle}` : ""
      }`}
      posts={communityPosts}
      onWritePostClick={handleWritePostClick}
      onPostClick={handlePostClick}
      isLoading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
};

export default CommunityBoardPage;
