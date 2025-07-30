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
import ProfileEditPage from "./pages/mypage/ProfileEditPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ErrorPage from "./pages/ErrorPage";
import MyPageLayout from "./layouts/MyPageLayout";
import PostDetailPage from "./pages/posts/PostDetailPage";
import PostWritePage from "./pages/posts/PostWritePage";
import GeneralBoardPage from "./pages/communities/GeneralBoardPage";
import MyActivitiesPage from "./pages/mypage/MyActivitiesPage";
import UserLeavePage from "./pages/mypage/UserLeavePage";
import ChangePassWordPage from "./pages/mypage/ChangePasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* 홈페이지 */}
          <Route index element={<HomePage />} />

          {/* 책 검색 및 상세 */}
          <Route path="books/search" element={<BookSearchResultPage />} />
          <Route path="books/:itemId" element={<BookDetailPage />} />

          {/* 특정 커뮤니티의 게시물 목록 조회 */}
          <Route
            path="communities/:communityId/posts"
            element={<CommunityBoardPage />}
          />

          {/* 특정 게시물 상세 */}
          <Route path="posts/:postId" element={<PostDetailPage />} />

          {/* 전체 게시판 */}
          <Route path="posts" element={<GeneralBoardPage />} />

          {/* 기타 고정 페이지 */}
          <Route path="faq" element={<FAQPage />} />
          <Route path="about" element={<AboutPage />} />

          {/* 마이페이지 섹션 */}
          <Route path="mypage" element={<MyPageLayout />}>
            {/* 마이페이지 기본 경로 (index) */}
            <Route index element={<MyCommunitiesParticipatingPage />} />
            {/* 내 정보 */}
            <Route path="profile-edit" element={<ProfileEditPage />} />
            <Route path="taste-analysis" element={<TasteAnalysisPage />} />
            {/* 내 활동 */}
            <Route path="my-library" element={<MyLibraryPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="my-activities" element={<MyActivitiesPage />} />

            {/* 커뮤니티 관련 */}
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
            {/* 비밀번호 수정 페이지 */}
            <Route
              path="/mypage/change-password"
              element={<ChangePassWordPage />}
            />
            {/* 회원탈퇴 페이지 */}
            <Route 
              path="/mypage/user-leave"
              element={<UserLeavePage />}
            />
          </Route>

          {/* 회원가입/로그인 페이지 */}
          <Route
            path="/auth/register"
            element={<RegisterPage />}
          />
          <Route 
            path="/auth/login"
            element={<LoginPage />}
          />
        </Route>



        {/* 전체 게시판에 게시물 작성 */}
        <Route path="posts/write" element={<PostWritePage />} />

        {/* 특정 커뮤니티에 게시물 작성 */}
        <Route
          path="communities/:communityId/posts/write"
          element={<PostWritePage />}
        />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
