// front/src/layouts/MyPageLayout.tsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const MyPageLayout: React.FC = () => {
  const location = useLocation();

  const getNavLinkClass = (path: string) => {
    return location.pathname === path
      ? "block py-2 px-4 text-main font-semibold border-l-4 border-main"
      : "block py-2 px-4 text-gray-700 hover:text-main";
  };

  return (
    <div className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 lg:px-8 xl:px-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 사이드 메뉴 */}
          {/* ✨ 이 nav 태그에 sticky와 top-0 (또는 top-숫자)를 적용합니다. ✨ */}
          <nav className="w-full md:w-1/6 p-4">
            <h2 className="text-xl font-bold text-gray-700 mb-4">커뮤니티</h2>
            <ul>
              <li className="mb-2">
                <Link
                  to="/mypage/communities/participating"
                  className={`${getNavLinkClass(
                    "/mypage/communities/participating"
                  )} text-sm`}
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
                >
                  내가 신청한
                  <br />
                  커뮤니티
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
                >
                  회원 정보 수정
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/taste-analysis"
                  className={`${getNavLinkClass(
                    "/mypage/taste-analysis"
                  )} text-sm`}
                >
                  취향 분석
                </Link>
              </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-700 mt-6 mb-4">
              내 활동
            </h2>
            <ul>
              <li className="mb-2">
                <Link
                  to="/mypage/my-library"
                  className={`${getNavLinkClass("/mypage/my-library")} text-sm`}
                >
                  내 서재
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/wishlist"
                  className={`${getNavLinkClass("/mypage/wishlist")} text-sm`}
                >
                  찜 리스트
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/my-posts"
                  className={`${getNavLinkClass("/mypage/my-posts")} text-sm`}
                >
                  내가 작성한 글
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/my-comments"
                  className={`${getNavLinkClass(
                    "/mypage/my-comments"
                  )} text-sm`}
                >
                  내가 작성한 댓글
                </Link>
              </li>
            </ul>
          </nav>

          {/* 메인 콘텐츠 영역 (하위 라우트가 렌더링될 곳) */}
          <main className="w-full md:w-5/6 bg-white rounded-lg shadow-md p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyPageLayout;
