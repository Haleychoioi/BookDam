import { BrowserRouter, Route, Routes } from "react-router-dom";

// Layouts import
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages import
import HomePage from "./pages/HomePage";
import BookSearchPage from "./pages/books/BookSearchPage";
import BookDetailPage from "./pages/books/BookDetailPage";
import QnaMainPage from "./pages/qna/QnaMainPage";
import QnaDetailPage from "./pages/qna/QnaDetailPage";
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";
import UserDashboardPage from "./pages/user/UserDashboardPage";
import MyLibraryPage from "./pages/user/MyLibraryPage";
import WishlistPage from "./pages/user/WishlistPage";
import MyReviewsPage from "./pages/user/MyReviewsPage";
import UserEditProfilePage from "./pages/user/UserEditProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import InquiryManagementPage from "./pages/admin/InquiryManagementPage";
import UserSanctionPage from "./pages/admin/UserSanctionPage";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="books" element={<BookSearchPage />} />
          <Route path="books/:id" element={<BookDetailPage />} />
          <Route path="qna" element={<QnaMainPage />} />
          <Route path="qna/:id" element={<QnaDetailPage />} />
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="signup" element={<SignUpPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboardPage />} />
          <Route path="library" element={<MyLibraryPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="reviews" element={<MyReviewsPage />} />
          <Route path="edit-profile" element={<UserEditProfilePage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="inquiry" element={<InquiryManagementPage />} />
          <Route path="sanction" element={<UserSanctionPage />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
