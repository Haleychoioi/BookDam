// src/components/mypage/MyPostsDisplay.tsx

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyPosts } from "../../api/posts";
import type { MyPostsResponse } from "../../api/posts";
import { useAuth } from "../../hooks/useAuth";
// ✨ PostType 임포트는 더 이상 필요 없으므로 제거하거나 Post 타입만 남김 ✨
// import { PostType } from '../../types';
import type { Post } from "../../types";
import { formatKoreanDateTime } from "../../utils/dateFormatter";
import Pagination from "../common/Pagination";
import { Link } from "react-router-dom";

const POSTS_PER_PAGE = 10;

const MyPostsDisplay: React.FC = () => {
  const { currentUserProfile } = useAuth();
  const userId = currentUserProfile?.userId;

  const [currentPage, setCurrentPage] = useState(1);
  const selectedSort = "latest"; // 정렬 버튼이 없으므로 고정

  // ✨ selectedType 상태 제거 ✨
  // const [selectedType, setSelectedType] = useState<PostType | 'ALL'>('ALL');

  const { data, isLoading, isError, error, isFetching } = useQuery<
    MyPostsResponse,
    Error
  >({
    // ✨ queryKey에서 selectedType 제거 ✨
    queryKey: ["myPosts", userId, currentPage, selectedSort],
    queryFn: () => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }
      return fetchMyPosts(
        currentPage,
        POSTS_PER_PAGE,
        selectedSort // type 파라미터는 더 이상 전달하지 않음
      );
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const posts = data?.posts || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalCount = data?.pagination?.totalCount || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ✨ handleTypeChange 함수 제거 ✨
  // const handleTypeChange = (type: PostType | 'ALL') => {
  //   setSelectedType(type);
  //   setCurrentPage(1);
  // };

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-500">
        로그인 후 내가 작성한 글을 확인할 수 있습니다.
      </div>
    );
  }

  if (isLoading && !isFetching) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-600">
        <p>글 목록을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-48 text-red-600">
        <p>오류 발생: {error?.message || "글 목록을 불러오지 못했습니다."}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        내가 작성한 글 ({totalCount}개)
      </h2>

      {/* ✨ 필터 및 정렬 옵션 섹션 전체 제거 (종류 필터 포함) ✨ */}
      {/*
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <span className="text-gray-700 ml-4">종류:</span>
        <Button
          onClick={() => handleTypeChange('ALL')}
          className={`px-3 py-1 text-sm rounded ${selectedType === 'ALL' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          전체
        </Button>
        <Button
          onClick={() => handleTypeChange(PostType.GENERAL)}
          className={`px-3 py-1 text-sm rounded ${selectedType === PostType.GENERAL ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          일반글
        </Button>
        <Button
          onClick={() => handleTypeChange(PostType.RECRUITMENT)}
          className={`px-3 py-1 text-sm rounded ${selectedType === PostType.RECRUITMENT ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          모집글
        </Button>
        <Button
          onClick={() => handleTypeChange(PostType.TEAM)}
          className={`px-3 py-1 text-sm rounded ${selectedType === PostType.TEAM ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          팀 게시글
        </Button>
      </div>
      */}

      {isFetching && posts.length > 0 && (
        <div className="text-center text-gray-500 mb-4">
          목록을 업데이트 중...
        </div>
      )}

      {posts.length === 0 && !isLoading && !isFetching ? (
        <div className="text-center text-gray-500 py-10">
          작성한 글이 없습니다.
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((post: Post) => (
            <li
              key={post.postId}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <Link
                to={`/posts/${post.postId}`}
                className="block hover:text-blue-600"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                    {post.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {/* post.type 값을 그대로 사용할 수 없으므로, 문자열로 변환하여 표시 */}
                    {post.type === "TEAM"
                      ? "팀 게시글"
                      : post.type === "RECRUITMENT"
                      ? "모집글"
                      : "일반글"}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>작성일: {formatKoreanDateTime(post.createdAt)}</span>
                  <span>댓글: {post._count?.comments || 0}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default MyPostsDisplay;
