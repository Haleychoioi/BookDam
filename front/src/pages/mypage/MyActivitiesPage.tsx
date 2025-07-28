import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MyPostsDisplay from "../../components/mypage/MyPostsDisplay";
import MyCommentsDisplay from "../../components/mypage/MyCommentsDisplay";
import type { Post, Comment } from "../../types";
import { fetchMyPosts, fetchMyComments } from "../../api/mypage";

// ✨ 더미 데이터 삭제 ✨
// const myPostsMockData: Post[] = Array.from(...);
// const myCommentsMockData: Comment[] = Array.from(...);

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

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [totalPostsCount, setTotalPostsCount] = useState(0);
  const [totalCommentsCount, setTotalCommentsCount] = useState(0);

  const [loading, setLoading] = useState(true); // 초기 로딩 상태 true
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 8;

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "posts") {
        const data = await fetchMyPosts(currentPage, itemsPerPage);
        setPosts(data.posts);
        setTotalPostsCount(data.total);
      } else {
        // activeTab === "comments"
        const data = await fetchMyComments(currentPage, itemsPerPage);
        setComments(data.comments);
        setTotalCommentsCount(data.total);
      }
    } catch (err) {
      console.error("내 활동 기록 불러오기 실패:", err);
      setError("활동 기록을 불러오는 데 실패했습니다.");
      setPosts([]);
      setComments([]);
      setTotalPostsCount(0);
      setTotalCommentsCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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

  const totalPages = useMemo(() => {
    if (activeTab === "posts") {
      return Math.ceil(totalPostsCount / itemsPerPage);
    } else {
      return Math.ceil(totalCommentsCount / itemsPerPage);
    }
  }, [activeTab, totalPostsCount, totalCommentsCount, itemsPerPage]);

  const displayedData = useMemo(() => {
    if (activeTab === "posts") {
      return posts;
    } else {
      return comments;
    }
  }, [activeTab, posts, comments]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as "posts" | "comments");
    setCurrentPage(1);
    navigate(`${location.pathname}?tab=${tabId}`, { replace: true });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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

      {loading && (
        <p className="text-center text-gray-600">활동 기록을 불러오는 중...</p>
      )}
      {error && <p className="text-center text-red-600">{error}</p>}
      {!loading && !error && displayedData.length === 0 ? (
        <p className="text-center text-gray-600">
          작성한 활동 기록이 없습니다.
        </p>
      ) : (
        <>
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
              onAddReply={() => {
                // TODO: 댓글 답글 추가 로직 구현
                // 이 함수는 MyCommentsDisplay 내부에서 답글 버튼 클릭 시 호출됩니다.
                // 실제 답글 작성 API 호출 로직을 여기에 구현하거나, MyCommentsDisplay에서 받은
                // 특정 댓글 ID 등을 바탕으로 부모 컴포넌트에서 처리하도록 할 수 있습니다.
                console.log("답글 추가 기능 구현 필요");
              }}
              currentUserId={1} // ✨ 현재 로그인된 사용자의 ID를 전달해야 합니다. ✨
              // 실제 애플리케이션에서는 사용자 인증 상태(예: Context API, Redux 등)에서 이 ID를 가져와야 합니다.
            />
          )}
        </>
      )}
    </div>
  );
};

export default MyActivitiesPage;
