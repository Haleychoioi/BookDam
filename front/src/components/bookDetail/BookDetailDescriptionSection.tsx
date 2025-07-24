import React from "react";
import type { BookDetail } from "../../types"; // ✨ BookDetail 타입 임포트 ✨

interface BookDetailDescriptionSectionProps {
  // ✨ inline 타입 정의 대신 임포트한 BookDetail 사용 ✨
  book: BookDetail;
}

const BookDetailDescriptionSection: React.FC<
  BookDetailDescriptionSectionProps
> = ({ book }) => {
  return (
    <div>
      {/* '기본 정보' 섹션 */}
      <div className="bg-white p-6 pb-6 mb-6 border-t border-b border-gray-200 text-sm text-gray-700">
        <h3 className="text-xl font-bold mb-4">기본 정보</h3>
        <p>252쪽 | 170*240 | 479g | ISBN: 153415645</p>
      </div>

      {/* 책 소개 (줄거리) */}
      <div className="bg-white p-6 pb-6 mb-6 border-b border-gray-200">
        <h3 className="text-xl font-bold mb-4">책 소개</h3>
        <p className="text-gray-700 leading-relaxed">{book.description}</p>
      </div>

      {/* '목차' 섹션 */}
      <div className="bg-white p-6 pb-6 mb-6 border-b border-gray-200">
        <h3 className="text-xl font-bold mb-4">목차</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
          {book.tableOfContents.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* '해설' 섹션 */}
      <div className="bg-white p-6 mb-8 border-b border-gray-200">
        <h3 className="text-xl font-bold mb-4">해설 | 양경언</h3>
        <p className="text-gray-700 leading-relaxed">
          {book.commentaryContent}
        </p>
      </div>
    </div>
  );
};

export default BookDetailDescriptionSection;
