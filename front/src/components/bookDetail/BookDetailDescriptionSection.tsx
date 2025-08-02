import type { BookDetail } from "../../types";

interface BookDetailDescriptionSectionProps {
  book: BookDetail;
}

const BookDetailDescriptionSection: React.FC<
  BookDetailDescriptionSectionProps
> = ({ book }) => {
  // book.description이 존재하고 비어있지 않을 때만 섹션을 렌더링합니다.
  const hasDescription = book.description && book.description.trim().length > 0;

  return (
    <div>
      {/* '기본 정보' 섹션 (변동 없음) */}
      <div className="bg-white p-6 pb-6 mb-6 border-t border-b border-gray-200 text-sm text-gray-700">
        <h3 className="text-xl font-bold mb-4">기본 정보</h3>
        <p>
          {book.pageCount ? `${book.pageCount}쪽` : ""}
          {book.pageCount && " | "}
          ISBN: {book.isbn13}
        </p>
      </div>

      {/* 책 소개 (줄거리) 섹션 - 조건부 렌더링 */}
      {hasDescription && ( // hasDescription이 true일 때만 이 div를 렌더링합니다.
        <div className="bg-white p-6 pb-6 mb-6 border-b border-gray-200">
          <h3 className="text-xl font-bold mb-4">책 소개</h3>
          <p className="text-gray-700 leading-relaxed">{book.description}</p>
        </div>
      )}
    </div>
  );
};

export default BookDetailDescriptionSection;
