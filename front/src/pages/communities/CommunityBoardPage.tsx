// front/src/pages/communities/CommunityBoardPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BoardTemplate from "../../components/posts/BoardTemplate";
import type { Post } from "../../types";

// mockdata: 커뮤니티 ID에 따라 다른 게시글 목록을 제공하는 더미 데이터
const communityPostsMockData: { [key: string]: Post[] } = {
  comm1: Array.from({ length: 15 }, (_, i) => ({
    id: `comm1-post-${i + 1}`,
    title: `[해리포터] ${i + 1}번째 독서 스터디 논의점`,
    commentCount: Math.floor(Math.random() * 10) + 1,
  })),
  comm2: Array.from({ length: 25 }, (_, i) => ({
    id: `comm2-post-${i + 1}`,
    title: `[노인과바다] 깊은 바다 이야기 ${i + 1}`,
    commentCount: Math.floor(Math.random() * 15) + 1,
  })),
  comm3: Array.from({ length: 8 }, (_, i) => ({
    id: `comm3-post-${i + 1}`,
    title: `[삼국지] 위촉오 인물 분석 ${i + 1}탄`,
    commentCount: Math.floor(Math.random() * 5) + 1,
  })),
};

// mockdata: 커뮤니티 상세 정보 (communityId에 따라 다르게)
const communityInfoMockData: {
  [key: string]: {
    bookTitle: string;
    hostName: string;
    communityTopic: string;
  };
} = {
  comm1: {
    bookTitle: "해리포터와 마법사의 돌",
    hostName: "산삼",
    communityTopic: "마법 세계 탐험",
  },
  comm2: {
    bookTitle: "노인과 바다",
    hostName: "문학소녀",
    communityTopic: "인간과 자연의 대결",
  },
  comm3: {
    bookTitle: "삼국지연의",
    hostName: "책벌레왕",
    communityTopic: "역사와 전략의 미학",
  },
  "default-community-info": {
    bookTitle: "알 수 없는 책",
    hostName: "미상",
    communityTopic: "알 수 없는 커뮤니티",
  },
};

const CommunityBoardPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  const currentCommunityInfo = useMemo(() => {
    return (
      communityInfoMockData[communityId || "default-community-info"] ||
      communityInfoMockData["default-community-info"]
    );
  }, [communityId]);

  const [currentPage, setCurrentPage] = useState(1);

  const allPostsForCurrentCommunity = useMemo(() => {
    return communityPostsMockData[communityId || "default-community-id"] || [];
  }, [communityId]);

  const totalPosts = allPostsForCurrentCommunity.length;
  const itemsPerPage = 8;
  const totalPages = Math.ceil(totalPosts / itemsPerPage);

  const displayedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allPostsForCurrentCommunity.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, allPostsForCurrentCommunity]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleWritePostClick = () => {
    // API 명세서에 따르면 커뮤니티 게시물 작성은 POST /communities/{id}/posts [cite: 5]
    // 따라서 새로운 게시물 작성 페이지로 이동하는 경로는 /communities/:communityId/posts/new
    navigate(`/communities/${communityId}/posts/new`);
  };

  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo(0, 0);
  }, [communityId]);

  if (!communityId) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        유효한 커뮤니티 ID가 필요합니다.
      </div>
    );
  }
  if (!currentCommunityInfo || totalPosts === 0) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        해당 커뮤니티를 찾을 수 없거나 게시글이 없습니다.
      </div>
    );
  }

  return (
    <BoardTemplate
      bookTitle={currentCommunityInfo.bookTitle}
      communityTopic={currentCommunityInfo.communityTopic}
      posts={displayedPosts}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onWritePostClick={handleWritePostClick}
      boardTitle="게시글" // 커뮤니티 게시판의 게시글 섹션 제목
    />
  );
};

export default CommunityBoardPage;
