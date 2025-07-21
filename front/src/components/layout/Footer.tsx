// 임시

import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 p-8 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 로고 및 설명 */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Logo</h3>{" "}
            {/* 이미지에 'Logo'라고 표시되어 있습니다. */}
            <p className="text-sm">
              독서 커뮤니티 플랫폼을 소개하는 간략한 문구.
            </p>
          </div>

          {/* 링크 섹션 1 (예시) */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">정보</h4>
            <ul>
              <li className="mb-2">
                <Link to="/about" className="hover:text-white text-sm">
                  회사 소개
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/faq" className="hover:text-white text-sm">
                  문의하기
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="hover:text-white text-sm">
                  연락하기
                </Link>
              </li>
            </ul>
          </div>

          {/* 링크 섹션 2 (예시) */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">커뮤니티</h4>
            <ul>
              <li className="mb-2">
                <Link to="/communities" className="hover:text-white text-sm">
                  커뮤니티 둘러보기
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/posts" className="hover:text-white text-sm">
                  게시판
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/mypage" className="hover:text-white text-sm">
                  마이페이지
                </Link>
              </li>
            </ul>
          </div>

          {/* 뉴스레터 구독 */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">
              뉴스레터 구독
            </h4>
            <p className="text-sm mb-4">최신 기능과 정보 소식을 받아보세요.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="이메일 주소"
                className="p-2 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
              />
              <button className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700">
                구독
              </button>
            </div>
            {/* 소셜 미디어 아이콘 (TODO: 실제 아이콘 컴포넌트 사용) */}
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* 저작권 정보 */}
        <div className="border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
          &copy; 2024 YourProjectName. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
