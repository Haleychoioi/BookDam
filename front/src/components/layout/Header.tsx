// front/src/components/layout/Header.tsx

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // useLocation 임포트 추가
import Button from "../common/Button";
import { FaBars, FaTimes } from "react-icons/fa";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // ✨ 실제 애플리케이션에서는 Redux, Context API 등 전역 상태 관리 훅을 사용하여 로그인 상태를 가져올 것입니다.
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 임시 로그인 상태
  const location = useLocation(); // useLocation 훅 사용

  // 현재 경로가 마이페이지 섹션인지 확인하는 함수
  const isMyPagePath = location.pathname.startsWith("/mypage");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    // 실제 로그아웃 로직 (예: 로컬 스토리지에서 토큰 제거, 서버에 로그아웃 요청 등) 추가
  };

  return (
    <header className="bg-white py-4 fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* 좌측 링크 섹션 (데스크탑 뷰) - '도서'와 '커뮤니티 참여' 링크 제거 */}
        <nav className="flex-1 hidden md:flex items-center space-x-4">
          <ul className="flex items-center space-x-4 list-none">
            <li>
              <Link
                to="/faq"
                className="text-gray-600 hover:text-main text-base"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-gray-600 hover:text-main text-base"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/posts"
                className="text-gray-600 hover:text-main text-base"
              >
                책담
              </Link>
            </li>
          </ul>
        </nav>

        {/* 로고 (중앙 정렬) */}
        <div className="flex-grow text-center">
          <Link to="/" className="text-3xl font-script text-gray-800">
            book
          </Link>
        </div>

        {/* 우측 링크/버튼 섹션 (데스크탑 뷰) */}
        <div className="flex-1 hidden md:flex justify-end items-center space-x-4">
          {isLoggedIn ? (
            // 로그인 후 상태: 마이페이지, 로그아웃
            <>
              <Link
                to="/mypage"
                className="text-gray-600 hover:text-main text-base"
              >
                마이페이지
              </Link>

              <Button
                onClick={handleLogout}
                bgColor="bg-transparent"
                textColor="text-gray-600"
                hoverBgColor="hover:text-main"
                className="px-0 py-0 text-base"
              >
                로그아웃
              </Button>
            </>
          ) : (
            // 로그인 전 상태: 마이페이지, 로그인
            <>
              <Link
                to="/mypage"
                className="text-gray-600 hover:text-main text-base"
              >
                마이페이지
              </Link>
              <Link
                to="/auth/login"
                className="text-gray-600 hover:text-main text-base"
              >
                로그인
              </Link>
            </>
          )}
        </div>

        {/* 모바일 햄버거 메뉴 및 우측 버튼 (모바일 뷰) */}
        {/* isMyPagePath가 true일 경우 햄버거 아이콘 숨김 */}
        <div className="md:hidden flex items-center space-x-2">
          {!isMyPagePath && ( // 마이페이지가 아닐 때만 이 블록 렌더링
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-main focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 shadow-lg border-t border-gray-200">
          <nav>
            <ul className="flex flex-col space-y-2 list-none">
              {isLoggedIn ? (
                <>
                  {/* 로그인 후 모바일 메뉴 */}
                  <li>
                    <Link
                      to="/mypage"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      마이페이지
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/ge"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      About
                    </Link>
                    <li>
                      <Link
                        to="/posts"
                        className="block py-2 text-gray-700 rounded-md"
                        onClick={toggleMobileMenu}
                      >
                        책담
                      </Link>
                    </li>
                  </li>
                  <li className="border-t border-gray-200 mt-2 pt-2">
                    <Button
                      onClick={handleLogout}
                      className="block w-full py-2 px-0 text-left"
                      bgColor="bg-transparent"
                      textColor="text-red-600"
                      hoverBgColor="hover:bg-red-50"
                    >
                      로그아웃
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  {/* 로그인 전 모바일 메뉴 */}
                  <li>
                    <Link
                      to="/auth/login"
                      className="block py-2 text-gray-70 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      로그인
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/mypage"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      마이페이지
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/posts"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      책담
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
