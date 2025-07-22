// front/src/components/layout/Header.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { FaBars, FaTimes } from "react-icons/fa";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // ✨ 실제 애플리케이션에서는 Redux, Context API 등 전역 상태 관리 훅을 사용하여 로그인 상태를 가져올 것입니다.
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 임시 로그인 상태

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
        {/* 좌측 링크 섹션 (데스크탑 뷰) - ✨ 이미지에 맞춰 수정합니다 ✨ */}
        <nav className="flex-1 hidden md:flex items-center space-x-4">
          <ul className="flex items-center space-x-4 list-none">
            <li>
              <Link
                to="/faq" // 이미지에 따라 FAQ 링크
                className="text-gray-600 hover:text-main text-base"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/about" // 이미지에 따라 About 링크
                className="text-gray-600 hover:text-main text-base"
              >
                About
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

        {/* 우측 링크/버튼 섹션 (데스크탑 뷰) - ✨ 이미지에 맞춰 수정합니다 ✨ */}
        <div className="flex-1 hidden md:flex justify-end items-center space-x-4">
          {isLoggedIn ? (
            // 로그인 후 상태: 마이페이지, 로그아웃
            <>
              <Link
                to="/mypage" // API 명세서에 따라 마이페이지 [cite: 5]
                className="text-gray-600 hover:text-main text-base"
              >
                마이페이지
              </Link>

              {/* 로그아웃은 Button 컴포넌트 사용하되, 텍스트 링크처럼 보이도록 스타일링 */}
              <Button
                onClick={handleLogout}
                bgColor="bg-transparent"
                textColor="text-gray-600" // 이미지와 유사하게 일반 텍스트 색상
                hoverBgColor="hover:text-main" // 폰트 색상 호버는 유지
                className="px-0 py-0 text-base" // Button 컴포넌트의 기본 패딩/사이즈를 제거하여 Link와 유사하게
              >
                로그아웃
              </Button>
            </>
          ) : (
            // 로그인 전 상태: 마이페이지, 로그인
            <>
              <Link
                to="/mypage" // API 명세서에 따라 마이페이지 [cite: 5]
                className="text-gray-600 hover:text-main text-base"
              >
                마이페이지
              </Link>
              <Link
                to="/auth/login" // API 명세서에 따라 로그인
                className="text-gray-600 hover:text-main text-base"
              >
                로그인
              </Link>
            </>
          )}
        </div>

        {/* 모바일 햄버거 메뉴 및 우측 버튼 (모바일 뷰) */}
        {/* 모바일 뷰는 이미지에 구체적인 지시가 없으므로 이전 상태를 최대한 유지하되,
            로그인/로그아웃 버튼은 햄버거 메뉴 안으로 넣는 것이 일반적이므로 외부 버튼은 최소화 */}
        <div className="md:hidden flex items-center space-x-2">
          {/* 모바일 뷰 헤더 우측에 로그인/가입하기 버튼이 필요하다면 여기에 추가 */}
          {/* <Button to="/auth/login" className="px-3 py-1.5 text-sm">
            로그인
          </Button> */}
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
        </div>
      </div>

      {/* 모바일 메뉴 (이미지에는 없지만, 기존 코드 유지) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white px-4 pt-2 pb-4 shadow-lg border-t border-gray-200">
          <nav>
            <ul className="flex flex-col space-y-2 list-none">
              {isLoggedIn ? (
                <>
                  {/* 로그인 후 모바일 메뉴 */}
                  <li>
                    <Link
                      to="/mypage"
                      className="block py-2 text-gray-700 hover:bg-main rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      마이페이지
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="block py-2 text-gray-700 hover:bg-main rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="block py-2 text-gray-700 hover:bg-main rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      About
                    </Link>
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
                      className="block py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      로그인
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/mypage"
                      className="block py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      마이페이지
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="block py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="block py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      About
                    </Link>
                  </li>
                  {/* API 명세서에 있는 다른 링크들 (도서, 커뮤니티 참여)은 필요시 추가 */}
                  <li>
                    <Link
                      to="/search/books"
                      className="block py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      도서
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/communities"
                      className="block py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      커뮤니티 참여
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
