import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const MyPageLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavLinkClass = (path: string) => {
    const isActive =
      location.pathname === path ||
      (location.pathname === "/mypage" &&
        path === "/mypage/communities/participating");

    return isActive
      ? "block py-2 px-4 text-main font-semibold border-l-4 border-main"
      : "block py-2 px-4 text-gray-700 hover:text-main";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-8 xl:px-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/*  모바일 햄버거 메뉴 버튼 (md 미만에서만 보임)  */}
          <div className="md:hidden flex justify-center w-full mb-4">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-md"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* ✨ 사이드 메뉴 - 모바일에서 조건부 숨김/보임 처리 ✨ */}
          <nav
            // md 이상에서는 항상 `block`이고, md 미만에서는 `isMobileMenuOpen` 상태에 따라 `hidden` 또는 `block`
            className={`w-full md:w-1/6 p-4 border-r md:border-r-0 border-gray-200 md:block ${
              isMobileMenuOpen ? "block" : "hidden"
            }`}
          >
            <h2 className="text-xl font-bold text-gray-700 mb-4">커뮤니티</h2>
            <ul>
              <li className="mb-2">
                <Link
                  to="/mypage/communities/participating"
                  className={`${getNavLinkClass(
                    "/mypage/communities/participating"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  현재 참여 중인
                  <br />
                  커뮤니티
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/communities/recruiting"
                  className={`${getNavLinkClass(
                    "/mypage/communities/recruiting"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  내가 모집 중인
                  <br />
                  커뮤니티
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/communities/applied"
                  className={`${getNavLinkClass(
                    "/mypage/communities/applied"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  내가 신청한
                  <br />
                  커뮤니티
                </Link>
              </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-700 mt-6 mb-4">
              내 활동
            </h2>
            <ul>
              <li className="mb-2">
                <Link
                  to="/mypage/taste-analysis"
                  className={`${getNavLinkClass(
                    "/mypage/taste-analysis"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  취향 분석
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/my-library"
                  className={`${getNavLinkClass("/mypage/my-library")} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  내 서재
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/wishlist"
                  className={`${getNavLinkClass("/mypage/wishlist")} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  찜 리스트
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/my-activities"
                  className={`${getNavLinkClass(
                    "/mypage/my-activities"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  내 활동 기록
                </Link>
              </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-700 mt-6 mb-4">
              내 정보
            </h2>
            <ul>
              <li className="mb-2">
                <Link
                  to="/mypage/profile-edit"
                  className={`${getNavLinkClass(
                    "/mypage/profile-edit"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  회원 정보 수정
                </Link>
                <Link
                  to="/mypage/change-password"
                  className={`${getNavLinkClass(
                    "/mypage/change-password"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  비밀번호 변경
                </Link>
                <Link
                  to="/mypage/user-leave"
                  className={`${getNavLinkClass(
                    "/mypage/user-leave"
                  )} text-sm text-gray-300`}
                  onClick={toggleMobileMenu}
                >
                  탈퇴하기
                </Link>
              </li>
            </ul>
          </nav>

          <main className="w-full md:w-5/6 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyPageLayout;
