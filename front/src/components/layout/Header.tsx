// 임시

import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 임시 로그인 상태. 실제 앱에서는 인증 컨텍스트/훅에서 가져와야 합니다.
  const [isLoggedIn, setIsLoggedIn] = useState(false); // true로 바꾸면 로그인된 상태로 보임

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 로그아웃 핸들러 (임시)
  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    // 실제 로그아웃 로직 (토큰 삭제, 서버 요청 등) 추가
  };

  return (
    <header className="bg-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* 좌측 링크 섹션 (데스크탑 뷰) */}
        <nav className="flex-1 hidden md:flex items-center space-x-4">
          <ul className="flex items-center space-x-4 list-none">
            {isLoggedIn ? (
              // 로그인 후 메뉴
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
              // 로그인 전 메뉴
              <>
                {/* 'Link One'은 이미지상으로 Link에 가깝지만, 필요에 따라 Button으로 대체 가능 */}
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
            // 로그인 후: 로그아웃 버튼
            <Button
              onClick={handleLogout}
              bgColor="bg-red-600"
              hoverBgColor="hover:bg-red-700"
            >
              로그아웃
            </Button>
          ) : (
            // 로그인 전: 로그인, 가입하기 버튼
            <div className="flex items-center space-x-4">
              {/* ✨ 로그인 Link를 Button 컴포넌트로 대체 ✨ */}
              <Button to="/login" bgColor="bg-mild">
                로그인
              </Button>
              {/* ✨ 가입하기 Button 컴포넌트로 텍스트 변경 ✨ */}
              <Button
                to="/register"
                bgColor="bg-primary"
                hoverBgColor="hover:bg-accent"
              >
                가입하기
              </Button>
            </div>
          )}
        </div>

        {/* 모바일 햄버거 메뉴 및 우측 버튼 (모바일 뷰) */}
        <div className="md:hidden flex items-center space-x-2">
          {isLoggedIn ? (
            // 로그인 후: 로그아웃 버튼 (모바일)
            <Button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm"
              bgColor="bg-red-600"
              hoverBgColor="hover:bg-red-700"
            >
              로그아웃
            </Button>
          ) : (
            // 로그인 전: 가입하기 버튼 (모바일)
            <Button to="/register" className="px-3 py-1.5 text-sm">
              가입하기
            </Button>
          )}

          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white px-4 pt-2 pb-4 shadow-lg border-t border-gray-200">
          <nav>
            <ul className="flex flex-col space-y-2 list-none">
              {isLoggedIn ? (
                // 모바일 - 로그인 후 메뉴
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
                // 모바일 - 로그인 전 메뉴
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
                    {/* 모바일 메뉴 내 로그인 버튼 */}
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
                    {/* 모바일 메뉴 내 가입하기 버튼 */}
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
