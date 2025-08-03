// src/pages/mypage/MyActivitiesPage.tsx (수정된 전체 코드)

import React, { useState, useEffect, useMemo } from "react"; // useCallback, useState, useEffect, useMemo 임포트
import { useLocation, useNavigate } from "react-router-dom";

import MyPostsDisplay from "../../components/mypage/MyPostsDisplay"; // MyPostsDisplay 컴포넌트
import MyCommentsDisplay from "../../components/mypage/MyCommentsDisplay"; // MyCommentsDisplay 컴포넌트 (추후 사용)

// ✨ 더미 데이터 및 fetchMyPosts/fetchMyComments 임포트 제거 (각 Display 컴포넌트가 알아서 페칭) ✨
// import type { Post, Comment } from "../../types";
// import { fetchMyPosts, fetchMyComments } from "../../api/mypage";

const MyActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  // URL에서 'tab' 파라미터 가져오기. 없으면 기본값 'posts'
  const initialTab = queryParams.get("tab") || "posts";

  // 활성화된 탭 상태
  const [activeTab, setActiveTab] = useState<"posts" | "comments">(
    initialTab as "posts" | "comments" // 'posts'와 'comments'만 현재 탭으로 가정
  );

  // URL 탭 파라미터와 컴포넌트 상태 동기화
  useEffect(() => {
    // URL의 탭이 현재 activeTab과 다르면 업데이트
    const tabFromUrl = queryParams.get("tab");
    if (
      tabFromUrl &&
      (tabFromUrl === "posts" || tabFromUrl === "comments") &&
      tabFromUrl !== activeTab
    ) {
      setActiveTab(tabFromUrl);
      // 탭 변경 시 페이지는 각 Display 컴포넌트가 알아서 1페이지로 리셋할 것임
    }
  }, [queryParams, activeTab]);

  // 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as "posts" | "comments");
    // URL의 탭 파라미터를 업데이트하여 새로고침 시에도 탭 유지
    navigate(`${location.pathname}?tab=${tabId}`, { replace: true });
  };

  // ✨ MyActivitiesPage에서 직접 데이터를 페칭하는 로직 제거 ✨
  // - useState 훅들 (posts, comments, totalPostsCount 등) 제거
  // - useEffect(fetchActivities) 제거
  // - fetchActivities useCallback 제거
  // - displayedData useMemo 제거
  // - totalPages useMemo 제거

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* ✨ h2 태그는 이 위치에 고정되어 항상 렌더링됨 ✨ */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">내 활동</h1>
      <p className="text-gray-600 mb-8">
        내가 작성한 글과 댓글 목록을 확인하세요.
      </p>

      {/* 활동 탭 메뉴 */}
      <nav className="mb-8 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "posts"
                  ? "text-main border-main"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange("posts")}
            >
              내가 작성한 글
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "comments"
                  ? "text-main border-main"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange("comments")}
            >
              내가 작성한 댓글
            </button>
          </li>
          {/* 다른 활동 탭들도 여기에 추가 가능 */}
        </ul>
      </nav>

      {/* 선택된 탭 내용 렌더링 */}
      <div className="mt-8">
        {/* 각 Display 컴포넌트가 자체적으로 데이터 페칭을 담당 */}
        {activeTab === "posts" && (
          <MyPostsDisplay
          // ✨ 더 이상 부모에서 props로 posts, currentPage, totalPages 등을 넘기지 않습니다. ✨
          // MyPostsDisplay 내부에서 useQuery 훅으로 직접 페칭합니다.
          />
        )}
        {activeTab === "comments" && (
          <MyCommentsDisplay
          // ✨ MyCommentsDisplay도 자체 페칭을 담당하도록 변경합니다. ✨
          // 부모에서 props로 comments, currentPage, totalPages 등을 넘기지 않습니다.
          // currentUserId는 필요 시 useAuth() 훅을 통해 MyCommentsDisplay 내부에서 가져옵니다.
          />
        )}
        {/* 다른 탭 컴포넌트들도 여기에 추가될 예정 */}
      </div>
    </div>
  );
};

export default MyActivitiesPage;
