import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import BookSearchResultsPage from "./pages/search/BookSearchResultsPage";
import BookDetailPage from "./pages/books/BookDetailPage";
import CommunityBoardPage from "./pages/communities/CommunityBoardPage";
import CommunityPostDetailPage from "./pages/communities/CommunityPostDetailPage";
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
          <Route path="search/books" element={<BookSearchResultsPage />} />
          <Route path="books/:bookId" element={<BookDetailPage />} />

          {/* 커뮤니티 게시판 */}
          <Route path="communities" element={<CommunityBoardPage />} />
          <Route
            path="communities/:postId"
            element={<CommunityPostDetailPage />}
          />
          {/* 게시물 생성/수정 */}
          <Route path="communities/new" element={<CommunityPostWritePage />} />
          <Route
            path="communities/:postId/edit"
            element={<CommunityPostWritePage />}
          />

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
            MyPage 컴포넌트를 부모 라우트 element로 설정하고,
            MyPage 컴포넌트 내부에서 Outlet을 렌더링하여 하위 라우트를 표시
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

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
