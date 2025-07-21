import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className=" text-gray-600 py-12">
      {/* 배경색 및 상하 패딩 조정 */}
      <div className="container mx-auto px-4 flex flex-col items-center mb-16">
        {/* 상단 구분선 */}
        <hr className="border-t border-gray-300 w-full mb-8" />
        {/* 구분선 추가 */}
        {/* 상단 링크 섹션 - ✨ 이 부분을 수정합니다 ✨ */}
        <div className="flex justify-start w-full max-w-5xl space-x-12 my-12 text-lg font-medium">
          {/* w-full, max-w-5xl 추가 및 space-x 조정 */}
          <Link to="/mobile-app" className="hover:text-main">
            Mobile app
          </Link>
          <Link to="/communities" className="hover:text-main">
            Community
          </Link>
          <Link to="/company" className="hover:text-main">
            Company
          </Link>
          <Link to="/help-desk" className="hover:text-main">
            Help desk
          </Link>
          <Link to="/blog" className="hover:text-main">
            Blog
          </Link>
        </div>
        {/* 회사 정보 및 로고 섹션 */}
        {/* 이 섹션 전체를 flex로 감싸서 회사 정보와 로고를 양쪽 끝에 배치 */}
        <div className="flex justify-between items-end w-full max-w-5xl text-sm leading-relaxed">
          {/* 회사 정보 */}
          <div className="flex flex-col space-y-1">
            <p>
              주)북토크컴퍼니 | 대표 김지성 | 사업자번호 275-08-01847 |
              통신판매업신고번호 제 2024-서울강남-2156호 (
              <a href="#" className="underline hover:text-main">
                사업자 정보 확인
              </a>
              +)
            </p>
            <p>
              이메일 문의:{" "}
              <a
                href="mailto:hello@booktalk.kr"
                className="underline hover:text-main"
              >
                hello@booktalk.kr
              </a>{" "}
              | 개인정보보호책임자: 이덕서 | 주소: 서울특별시 강남구 테헤란로
              152, 7층
            </p>
            <p>
              고객센터: 1588-2024 | 평일 09:00~18:00 (점심시간 12:00~13:00 제외)
              | 주말 및 공휴일 휴무
            </p>
          </div>

          {/* 우측 하단 로고 */}
          <div className="text-3xl font-script text-gray-800">book</div>
        </div>
        {/* 이미지에 저작권 정보는 따로 없으므로 제거하거나, 필요하다면 추가적인 div로 분리 */}
        {/* <div className="border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
          &copy; 2024 YourProjectName. All Rights Reserved.
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
