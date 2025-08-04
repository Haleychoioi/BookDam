// src/components/mypage/MyCommentsDisplay.tsx

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyComments } from "../../api/comments";
import type { MyCommentsResponse } from "../../api/comments";
import { useAuth } from "../../hooks/useAuth";
import type { Comment, TeamComment } from "../../types";
import { formatKoreanDateTime } from "../../utils/dateFormatter";
import Pagination from "../common/Pagination";

import { Link } from "react-router-dom";

const COMMENTS_PER_PAGE = 10;

// Comment가 TeamComment 타입인지 확인하는 헬퍼 함수
// 서비스에서 이미 필터링되고 평탄화된 데이터를 받으므로, 이 헬퍼는 단순히 타입을 구분하는 역할만 합니다.
function isTeamComment(comment: Comment | TeamComment): comment is TeamComment {
  return (comment as TeamComment).teamPostId !== undefined;
}

const MyCommentsDisplay: React.FC = () => {
  const { currentUserProfile } = useAuth();
  const userId = currentUserProfile?.userId;

  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useQuery<
    MyCommentsResponse,
    Error
  >({
    queryKey: ["myComments", userId, currentPage],
    queryFn: () => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }
      return fetchMyComments(currentPage, COMMENTS_PER_PAGE);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  console.log("MyCommentsDisplay - useQuery data:", data); // 디버깅 로그 유지

  const comments = data?.data?.comments || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const totalCount = data?.data?.pagination?.totalCount || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-500">
        로그인 후 내가 작성한 댓글을 확인할 수 있습니다.
      </div>
    );
  }

  if (isLoading && !isFetching) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-600">
        <p>댓글 목록을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-48 text-red-600">
        <p>오류 발생: {error?.message || "댓글 목록을 불러오지 못했습니다."}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        내가 작성한 댓글 ({totalCount}개)
      </h2>

      {isFetching && comments.length > 0 && (
        <div className="text-center text-gray-500 mb-4">
          목록을 업데이트 중...
        </div>
      )}

      {comments.length === 0 && !isLoading && !isFetching ? (
        <div className="text-center text-gray-500 py-10">
          작성한 댓글이 없습니다.
        </div>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const commentIdOrTeamCommentId = isTeamComment(comment)
              ? comment.teamPostId
              : comment.commentId;
            let postLink = ""; // 댓글이 이동할 게시물 링크

            // 서비스에서 이미 필터링되고 평탄화된 데이터를 받으므로, 조건 검사를 단순화합니다.
            // comment.postTitle은 서비스에서 이미 null이 아닌 경우에만 설정됩니다.
            if (
              isTeamComment(comment) &&
              comment.communityId &&
              comment.teamPostId
            ) {
              postLink = `/communities/${comment.communityId}/posts/${comment.teamPostId}`;
            } else if (!isTeamComment(comment) && comment.postId) {
              postLink = `/posts/${comment.postId}`;
            }

            // 게시물 제목 표시 (postTitle은 서비스에서 이미 평탄화되어 제공됩니다)
            const postTitleDisplay = comment.postTitle || "삭제된 게시글"; // 게시글 제목이 없으면 '삭제된 게시글'로 표시
            const postTypeDisplay = comment.postType
              ? ` (${
                  comment.postType === "TEAM" ? "팀 게시글" : "일반 게시글"
                })`
              : "";

            return (
              <li
                key={commentIdOrTeamCommentId}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                {/* ✨ 링크가 유효한 경우 전체 항목을 Link로 감쌉니다. ✨ */}
                {postLink ? ( // postLink가 유효할 때만 Link 컴포넌트 사용
                  <Link to={postLink} className="block hover:text-blue-600">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                      {postTitleDisplay}
                      {postTypeDisplay}
                    </h3>
                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                      {comment.content}
                    </p>
                  </Link>
                ) : (
                  // postLink가 유효하지 않으면 Link 없이 텍스트만 표시
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                      {postTitleDisplay}
                      {postTypeDisplay}
                    </h3>
                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                      {comment.content}
                    </p>
                  </>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                  <span>작성일: {formatKoreanDateTime(comment.createdAt)}</span>
                  <span>작성자: {comment.user?.nickname || "알 수 없음"}</span>
                </div>
                {comment.parentId && (
                  <p className="text-xs text-gray-400 mt-1">답글입니다.</p>
                )}
              </li>
            );
          })}
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

export default MyCommentsDisplay;
