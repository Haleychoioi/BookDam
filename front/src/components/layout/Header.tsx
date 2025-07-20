// front/src/components/layout/Header.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { FaBars, FaTimes } from "react-icons/fa"; // ✨ FaBars, FaTimes 임포트 ✨

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 임시 로그인 상태

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    // 실제 로그아웃 로직 추가
  };

  return (
    <header className="bg-white shadow-md py-4 fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* 좌측 링크 섹션 (데스크탑 뷰) */}
        <nav className="flex-1 hidden md:flex items-center space-x-4">
          <ul className="flex items-center space-x-4 list-none">
            {isLoggedIn ? (
              <>
                <li>
                  <Link
                    to="/mypage"
                    className="text-gray-600 hover:text-blue-500 text-lg"
                  >
                    마이페이지
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-gray-600 hover:text-blue-500 text-lg"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-600 hover:text-blue-500 text-lg"
                  >
                    About
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-blue-500 text-lg"
                  >
                    Link One
                  </Link>
                </li>
                <li>
                  <Link
                    to="/communities"
                    className="text-gray-600 hover:text-blue-500 text-lg"
                  >
                    커뮤니티 참여
                  </Link>
                </li>
                <li>
                  <Link
                    to="/discussions"
                    className="text-gray-600 hover:text-blue-500 text-lg"
                  >
                    독서 토론
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* 로고 (중앙 정렬) */}
        <div className="flex-grow text-center">
          <Link to="/" className="text-3xl font-script text-gray-800">
            Logo
          </Link>
        </div>

        {/* 우측 버튼 (데스크탑 뷰) */}
        <div className="flex-1 hidden md:flex justify-end">
          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              bgColor="bg-red-600"
              hoverBgColor="hover:bg-red-700"
            >
              로그아웃
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Button to="/login">로그인</Button>
              <Button to="/register">가입하기</Button>
            </div>
          )}
        </div>

        {/* 모바일 햄버거 메뉴 및 우측 버튼 (모바일 뷰) */}
        <div className="md:hidden flex items-center space-x-2">
          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm"
              bgColor="bg-red-600"
              hoverBgColor="hover:bg-red-700"
            >
              로그아웃
            </Button>
          ) : (
            <Button to="/register" className="px-3 py-1.5 text-sm">
              가입하기
            </Button>
          )}

          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            {/* ✨ SVG 대신 react-icons 컴포넌트 사용 ✨ */}
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6" /> // 닫기 아이콘
            ) : (
              <FaBars className="w-6 h-6" /> // 햄버거 아이콘
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white px-4 pt-2 pb-4 shadow-lg border-t border-gray-200">
          <nav>
            <ul className="flex flex-col space-y-2 list-none">
              {isLoggedIn ? (
                <>
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
                  <li>
                    <Link
                      to="/"
                      className="block py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      Link One
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
                  <li>
                    <Link
                      to="/discussions"
                      className="block py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      독서 토론
                    </Link>
                  </li>
                  <li className="border-t border-gray-200 mt-2 pt-2">
                    <Button
                      to="/login"
                      className="block w-full py-2 px-0 text-left"
                      bgColor="bg-transparent"
                      textColor="text-blue-600"
                      hoverBgColor="hover:bg-blue-50"
                      onClick={toggleMobileMenu}
                    >
                      로그인
                    </Button>
                  </li>
                  <li>
                    <Button
                      to="/register"
                      className="block w-full py-2 px-0 text-left"
                      bgColor="bg-transparent"
                      textColor="text-blue-600"
                      hoverBgColor="hover:bg-blue-50"
                      onClick={toggleMobileMenu}
                    >
                      가입하기
                    </Button>
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
