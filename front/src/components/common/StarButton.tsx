// front/src/components/common/StarButton.tsx

import React, { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa"; // ✨ FaStar, FaRegStar 임포트 ✨

interface StarButtonProps {
  initialIsWishlisted?: boolean; // 초기 찜 여부
  onClick?: () => void; // 클릭 시 실행될 콜백 함수
  className?: string; // 추가적인 스타일 클래스
}

const StarButton: React.FC<StarButtonProps> = ({
  initialIsWishlisted = false,
  onClick,
  className = "",
}) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  const handleClick = () => {
    setIsWishlisted((prev) => !prev); // 상태 토글
    if (onClick) {
      onClick(); // 부모에서 전달받은 onClick 함수 호출
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center
                 cursor-pointer
                  ${className}`}
      aria-label="찜하기"
    >
      {/* ✨ 찜 상태에 따라 FaStar 또는 FaRegStar 렌더링 ✨ */}
      {isWishlisted ? (
        <FaStar className="w-6 h-6 text-apply" /> // 채워진 별 (찜된 상태)
      ) : (
        <FaRegStar className="w-6 h-6 text-apply" /> // 비어있는 별 (찜 안 된 상태, apply 색상 테두리)
      )}
    </button>
  );
};

export default StarButton;
