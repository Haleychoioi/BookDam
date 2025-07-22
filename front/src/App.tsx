import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import BookSearchResultPage from "./pages/books/BookSearchResultPage";
import BookDetailPage from "./pages/books/BookDetailPage";
import CommunityBoardPage from "./pages/communities/CommunityBoardPage";
import FAQPage from "./pages/FAQPage";
import AboutPage from "./pages/AboutPage";
import MyCommunitiesParticipatingPage from "./pages/mypage/MyCommunitiesParticipatingPage";
import MyCommunitiesRecruitingPage from "./pages/mypage/MyCommunitiesRecruitingPage";
import CommunityApplicationsPage from "./pages/mypage/CommunityApplicantsPage";
import MyCommunitiesAppliedPage from "./pages/mypage/MyCommunitiesAppliedPage";
import TasteAnalysisPage from "./pages/mypage/TasteAnalysisPage";
import MyLibraryPage from "./pages/mypage/MyLibraryPage";
import WishlistPage from "./pages/mypage/WishlistPage";
import MyPostsPage from "./pages/mypage/MyPostsPage";
import MyCommentsPage from "./pages/mypage/MyCommentsPage";
import ProfileEditPage from "./pages/mypage/ProfileEditPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ErrorPage from "./pages/ErrorPage";
import MyPage from "./pages/mypage/MyPage";
import PostDetailPage from "./pages/posts/PostDetailPage";
import PostWritePage from "./pages/posts/PostWritePage";
import GeneralBoardPage from "./pages/communities/GeneralBoardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* 홈페이지(루트 경로) */}
          <Route index element={<HomePage />} />

          {/* 책 검색 및 상세 */}
          <Route path="search/books" element={<BookSearchResultPage />} />
          <Route path="books/:bookId" element={<BookDetailPage />} />

          {/* 커뮤니티 목록 조회 (GET /communities) */}
          <Route
            path="communities"
            element={<CommunityBoardPage /* 혹은 CommunityListPage */ />}
          />

          {/* 특정 커뮤니티의 게시물 목록 조회 (GET /communities/id/posts) */}
          <Route
            path="communities/:communityId/posts"
            element={<CommunityBoardPage />}
          />

          {/* 특정 게시물 상세 (GET /posts/id) - 커뮤니티 게시물 상세도 이 경로를 사용해야 함 */}
          <Route path="posts/:postId" element={<PostDetailPage />} />

          {/* 전체 게시판 */}
          <Route path="posts" element={<GeneralBoardPage />} />

          {/* 기타 고정 페이지 */}
          <Route path="faq" element={<FAQPage />} />
          <Route path="about" element={<AboutPage />} />
          {/*
            마이페이지 섹션 (중첩 라우트)
          */}
          <Route path="mypage" element={<MyPage />}>
            <Route index element={<MyCommunitiesParticipatingPage />} />
            <Route
              path="communities/participating"
              element={<MyCommunitiesParticipatingPage />}
            />
            <Route
              path="communities/recruiting"
              element={<MyCommunitiesRecruitingPage />}
            />
            <Route
              path="communities/recruiting/:communityId/applicants"
              element={<CommunityApplicationsPage />}
            />
            <Route
              path="communities/applied"
              element={<MyCommunitiesAppliedPage />}
            />
            <Route path="taste-analysis" element={<TasteAnalysisPage />} />
            <Route path="my-library" element={<MyLibraryPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="my-posts" element={<MyPostsPage />} />
            <Route path="my-comments" element={<MyCommentsPage />} />
            <Route path="profile-edit" element={<ProfileEditPage />} />
          </Route>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
        {/* 4. 특정 게시물 작성 (POST /posts) */}
        <Route path="posts/new" element={<PostWritePage />} />
        <Route
          path="communities/:communityId/posts/new"
          element={<PostWritePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
