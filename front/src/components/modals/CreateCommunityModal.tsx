import { useState } from "react";
import Button from "../common/Button"; // 기존 Button 컴포넌트 활용

interface CreateCommunityModalProps {
  isOpen: boolean; // 모달 열림/닫힘 상태
  onClose: () => void; // 모달 닫기 함수
  bookId: string; // 이 커뮤니티가 기반할 도서의 ID
  onCommunityCreate: (
    bookId: string,
    communityName: string,
    maxMembers: number,
    description: string
  ) => void; // 커뮤니티 생성 처리 함수
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  bookId,
  onCommunityCreate,
}) => {
  const [communityName, setCommunityName] = useState("");
  const [maxMembers, setMaxMembers] = useState<string>(""); // input type="number" 대신 string으로 받아 유효성 검사
  const [description, setDescription] = useState("");

  if (!isOpen) return null; // isOpen이 false면 아무것도 렌더링하지 않음

  const handleSubmit = () => {
    // ✨ 커뮤니티 이름 유효성 검사 수정 ✨
    const trimmedCommunityName = communityName.trim();
    if (trimmedCommunityName.length < 3 || trimmedCommunityName.length > 20) {
      alert("커뮤니티 이름을 3자 이상 20자 이내로 입력해주세요.");
      return;
    }

    const parsedMaxMembers = parseInt(maxMembers, 10);
    if (isNaN(parsedMaxMembers) || parsedMaxMembers < 2) {
      alert("모집 인원을 최소 2명 이상으로 입력해주세요.");
      return;
    }

    // ✨ 커뮤니티 간단 소개 글 유효성 검사 수정 ✨
    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 3 || trimmedDescription.length > 50) {
      alert("커뮤니티 소개를 3자 이상 50자 이내로 입력해주세요.");
      return;
    }

    onCommunityCreate(
      bookId,
      trimmedCommunityName,
      parsedMaxMembers,
      trimmedDescription
    );
    setCommunityName("");
    setMaxMembers("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          독서 커뮤니티 생성하기
        </h2>
        <p className="font-light text-gray-600 mb-6">
          새로운 독서 커뮤니티를 시작해보세요.
        </p>

        {/* 커뮤니티 이름 */}
        <div className="mb-4">
          <label
            htmlFor="communityName"
            className="block text-gray-700 text-base font-medium mb-2"
          >
            커뮤니티 이름
          </label>
          <input
            id="communityName"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 font-light"
            placeholder="커뮤니티 이름을 20자 이내로 입력해주세요"
            maxLength={20} // 20자 제한
            value={communityName}
            onChange={(e) => setCommunityName(e.target.value)}
          />
        </div>

        {/* 모집 인원 */}
        <div className="mb-4">
          <label
            htmlFor="maxMembers"
            className="block text-gray-700 text-base font-medium mb-2"
          >
            모집 인원
          </label>
          <input
            id="maxMembers"
            type="number" // 숫자 입력 필드
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 font-light"
            placeholder="모집할 인원수를 입력해주세요 (최소 2명)"
            min="2" // 최소값 설정
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
          />
        </div>

        {/* 커뮤니티 간단 소개 글 */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-gray-700 text-base font-medium mb-2"
          >
            커뮤니티 간단 소개 글
          </label>
          <textarea
            id="description"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 resize-none font-light"
            rows={3} // 이미지와 유사하게 줄 수 조정
            placeholder="커뮤니티 소개를 50자 이내로 입력해주세요."
            maxLength={50} // 50자 제한
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={onClose}
            bgColor="bg-gray-300" // 이미지와 유사한 취소 버튼 색상
            textColor="text-white"
            hoverBgColor="hover:bg-gray-400"
            className="font-normal"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            bgColor="bg-main" // 이미지와 유사한 생성하기 버튼 색상
            textColor="text-white"
            hoverBgColor="hover:bg-apply"
            className="font-normal"
          >
            생성하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
