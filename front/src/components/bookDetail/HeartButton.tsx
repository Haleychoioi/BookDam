// front/src/components/common/HeartButton.tsx
import React, { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // 채워진 하트와 비어있는 하트 아이콘

interface HeartButtonProps {
  onClick: (isWishlisted: boolean) => void; // 클릭 시 찜 상태를 전달
  initialIsWishlisted?: boolean; // 초기 찜 상태 (옵션)
  className?: string; // 추가 Tailwind CSS 클래스
}

const HeartButton: React.FC<HeartButtonProps> = ({
  onClick,
  initialIsWishlisted = false,
  className = "",
}) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  const handleClick = () => {
    const newWishlistStatus = !isWishlisted;
    setIsWishlisted(newWishlistStatus);
    onClick(newWishlistStatus); // 부모 컴포넌트에 변경된 상태 전달
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-colors duration-200 ${
        isWishlisted
          ? "text-red-500 hover:bg-red-100" // 찜 되어 있을 때
          : "text-gray-400 hover:bg-gray-100" // 찜 안 되어 있을 때
      } ${className}`}
      aria-label={isWishlisted ? "찜 해제" : "찜하기"}
    >
      {isWishlisted ? (
        <FaHeart className="w-6 h-6" /> // 찜 되어 있으면 채워진 하트
      ) : (
        <FaRegHeart className="w-6 h-6" /> // 찜 안 되어 있으면 비어있는 하트
      )}
    </button>
  );
};

export default HeartButton;
