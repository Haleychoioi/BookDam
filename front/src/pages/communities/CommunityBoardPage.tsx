// src/pages/communities/CommunityBoardPage.tsx

import { useEffect, useState } from "react";
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

  const parsedCommunityId = Number(communityId);

  useEffect(() => {
    const loadCommunityData = async () => {
      if (isNaN(parsedCommunityId)) {
        setError("유효하지 않은 커뮤니티 ID입니다.");
        setLoading(false);
        return;
      }

      if (!authLoading && !currentUserProfile) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        const communityResponse = await fetchCommunityById(
          String(parsedCommunityId)
        );
        setCommunityInfo(communityResponse);

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
          console.error("Failed to load community data:", err);
          setError(err.message || "커뮤니티 데이터를 불러오는데 실패했습니다.");
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadCommunityData();
    }
  }, [parsedCommunityId, currentUserProfile, authLoading, currentPage]);

  const handleWritePostClick = () => {
    navigate(`/communities/${communityId}/posts/write`);
  };

  const handlePostClick = (postId: number) => {
    // BoardTemplate에서 전달받을 onPostClick
    navigate(`/communities/${communityId}/posts/${postId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <BoardTemplate
        boardTitle="게시물" // 이미지의 "게시물" 제목
        posts={[]}
        onWritePostClick={handleWritePostClick}
        onPostClick={handlePostClick} // onPostClick 전달
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
      // bookTitle, communityTopic, headerContent 프롭들은 BoardTemplate에서 제거되었으므로 여기서도 전달하지 않습니다.
      boardTitle="게시물" // 이미지의 "게시물" 제목
      posts={communityPosts}
      onWritePostClick={handleWritePostClick}
      onPostClick={handlePostClick} // onPostClick 전달
      isLoading={false}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
};

export default CommunityBoardPage;
