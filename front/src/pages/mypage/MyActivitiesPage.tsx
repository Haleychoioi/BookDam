import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MyPostsDisplay from "../../components/mypage/MyPostsDisplay";
import MyCommentsDisplay from "../../components/mypage/MyCommentsDisplay";
import type { Post, Comment } from "../../types";

const myPostsMockData: Post[] = Array.from({ length: 30 }, (_, i) => ({
  id: `my-post-${i + 1}`,
  title: `[내가 쓴 글] ${i + 1}번째 이야기`,
  commentCount: Math.floor(Math.random() * 5),
  createdAt: new Date().toISOString(),
  type: i % 2 === 0 ? "general" : "community",
  author: `작성자${i + 1}`, // ✨ author 추가 ✨
  authorId: `user${i + 1}`, // ✨ authorId 추가 ✨
  content: `이것은 내가 작성한 ${i + 1}번째 글의 상세 내용입니다.`, // ✨ content 추가 ✨
}));

const myCommentsMockData: Comment[] = Array.from({ length: 40 }, (_, i) => ({
  id: `my-comment-${i + 1}`,
  author: `나 (사용자)`,
  authorId: "currentUserId",
  createdAt: new Date(Date.now() - i * 12 * 3600 * 1000).toLocaleString(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ),
  content: `이것은 내가 작성한 ${i + 1}번째 댓글 내용입니다.`,
  isEdited: i % 5 === 0,
  postId: `related-post-${Math.floor(Math.random() * 10) + 1}`,
  postTitle: `관련 게시물 제목 ${Math.floor(Math.random() * 10) + 1}`,
  postType: i % 2 === 0 ? "general" : "community",
  communityId: `comm${(i % 3) + 1}`,
}));

const MyActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const initialTab = queryParams.get("tab") || "posts";

  const [activeTab, setActiveTab] = useState<"posts" | "comments">(
    initialTab as "posts" | "comments"
  );
  const [currentPage, setCurrentPage] = useState(1);

  const { totalPages, displayedData } = useMemo(() => {
    let rawData: Post[] | Comment[] = [];
    const itemsPerPage = 8;

    if (activeTab === "posts") {
      rawData = myPostsMockData;
    } else {
      rawData = myCommentsMockData;
    }

    const currentTotalCount = rawData.length;
    const calculatedTotalPages = Math.ceil(currentTotalCount / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDisplayedData = rawData.slice(startIndex, endIndex);

    return {
      totalPages: calculatedTotalPages,
      displayedData: currentDisplayedData,
    };
  }, [activeTab, currentPage]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as "posts" | "comments");
    setCurrentPage(1);
    navigate(`${location.pathname}?tab=${tabId}`, { replace: true });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const tabFromUrl = queryParams.get("tab");
    if (
      tabFromUrl &&
      (tabFromUrl === "posts" || tabFromUrl === "comments") &&
      tabFromUrl !== activeTab
    ) {
      setActiveTab(tabFromUrl);
      setCurrentPage(1);
    }
  }, [queryParams, activeTab]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">내 활동 기록</h2>
      <p className="text-gray-600 mb-8">
        내가 작성한 글과 댓글 목록을 확인하세요.
      </p>

      <div className="flex border-b border-gray-200 mb-8">
        {[
          { id: "posts", label: "내가 작성한 글" },
          { id: "comments", label: "내가 작성한 댓글" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-lg font-medium ${
              activeTab === tab.id
                ? "text-main border-b-2 border-main"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "posts" ? (
        <MyPostsDisplay
          posts={displayedData as Post[]}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <MyCommentsDisplay
          comments={displayedData as Comment[]}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default MyActivitiesPage;
