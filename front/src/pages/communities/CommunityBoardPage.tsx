// src/pages/communities/CommunityBoardPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BoardTemplate from "../../components/posts/BoardTemplate";
// TeamCommunity, TeamPost는 형식(interface)이므로 'import type' 사용
import type { TeamCommunity, TeamPost } from "../../types";

// fetchCommunityByIdResponse 임포트를 제거합니다.
import { fetchCommunityById } from "../../api/communities";
import { fetchTeamPosts } from "../../api/teamPosts";
import { useAuth } from "../../hooks/useAuth";

const CommunityBoardPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { currentUserProfile, loading: authLoading } = useAuth();

  const [communityInfo, setCommunityInfo] = useState<TeamCommunity | null>(
    null
  );
  const [communityPosts, setCommunityPosts] = useState<TeamPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // fetchCommunityById는 communityId를 string으로 받고 Promise<TeamCommunity>를 반환합니다.
        const communityResponse = await fetchCommunityById(
          String(parsedCommunityId)
        ); // 인자를 string으로 변환
        setCommunityInfo(communityResponse); // .data 접근 없이 바로 사용

        // fetchTeamPosts는 communityId를 string으로 받고, Promise<{ posts: TeamPost[]; totalResults: number }>를 반환하도록 아래에서 수정합니다.
        const postsResponse = await fetchTeamPosts(
          String(parsedCommunityId),
          1,
          10,
          "latest"
        );
        setCommunityPosts(postsResponse.posts); // postsResponse.posts에 게시물 배열이 있습니다.
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
  }, [parsedCommunityId, currentUserProfile, authLoading]);

  const handleWriteClick = () => {
    navigate(`/communities/${communityId}/posts/write`);
  };

  const handlePostClick = (postId: number) => {
    navigate(`/communities/${communityId}/posts/${postId}`);
  };

  if (loading) {
    return (
      <BoardTemplate
        title="게시판 로딩 중..."
        posts={[]}
        onWriteClick={handleWriteClick}
        onPostClick={handlePostClick}
        isLoading={true}
      />
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">오류: {error}</div>;
  }

  return (
    <BoardTemplate
      title={`${communityInfo?.postTitle || "커뮤니티"} 게시판`}
      posts={communityPosts}
      onWriteClick={handleWriteClick}
      onPostClick={handlePostClick}
      isLoading={false}
    />
  );
};

export default CommunityBoardPage;
