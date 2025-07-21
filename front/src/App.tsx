import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import BookSearchResultPage from "./pages/books/BookSearchResultPage";
import BookDetailPage from "./pages/books/BookDetailPage";
import CommunityBoardPage from "./pages/communities/CommunityBoardPage";
import CommunityPostWritePage from "./pages/communities/CommunityPostWritePage";
import GeneralBoardPage from "./pages/posts/GeneralBoardPage";
import GeneralPostDetailPage from "./pages/posts/GeneralPostDetailPage";
import GeneralPostWritePage from "./pages/posts/GeneralPostWritePage";
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

          {/* ✨ 커뮤니티 라우트 (API 명세 기반 조정) ✨ */}
          {/* 1. 커뮤니티 목록 조회 (GET /communities) */}
          <Route
            path="communities"
            element={<CommunityBoardPage /* 혹은 CommunityListPage */ />}
          />

          {/* 2. 특정 커뮤니티의 게시물 목록 조회 (GET /communities/id/posts) */}
          <Route
            path="communities/:communityId/posts"
            element={<CommunityBoardPage />}
          />

          {/* 3. 특정 커뮤니티에 게시물 작성 (POST /communities/id/posts) */}
          <Route
            path="communities/:communityId/posts/new"
            element={<CommunityPostWritePage />}
          />

          {/* ✨ 전체 게시판 라우트 (API 명세와 일치) ✨ */}
          {/* 1. 전체 게시판 게시물 목록 조회 (GET /posts) */}
          <Route path="posts" element={<GeneralBoardPage />} />

          {/* 2. 특정 게시물 상세 (GET /posts/id) - 커뮤니티 게시물 상세도 이 경로를 사용해야 함 */}
          <Route path="posts/:postId" element={<GeneralPostDetailPage />} />

          {/* 3. 특정 게시물 수정 (PUT /posts/id) */}
          <Route path="posts/:postId/edit" element={<GeneralPostWritePage />} />

          {/* 4. 특정 게시물 작성 (POST /posts) */}
          <Route path="posts/new" element={<GeneralPostWritePage />} />

          {/* 전체 게시판 */}
          <Route path="posts" element={<GeneralBoardPage />} />
          <Route path="posts/:postId" element={<GeneralPostDetailPage />} />
          {/* 게시물 생성/수정 */}
          <Route path="posts/new" element={<GeneralPostWritePage />} />
          <Route path="posts/:postId/edit" element={<GeneralPostWritePage />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
