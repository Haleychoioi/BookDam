// src/pages/mypage/ProfileEditPage.tsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MyPageHeader from "../../components/mypage/myPageHeader.tsx"; // MyPageHeader로 수정 (대소문자 일치)
import Button from "../../components/common/Button";
// import type { UserProfile } from "../../types"; // UserProfile 임포트 제거 (훅에서 타입 제공)
import { useAuth } from "../../hooks/useAuth";

// 기본 프로필 이미지 경로 (useAuth 훅 내의 로직과 동일하게 유지)
const defaultProfileImage = "https://api.dicebear.com/8.x/identicon/svg?seed=";

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // useAuth 훅에서 사용자 프로필 관련 상태와 함수를 가져옵니다.
  // fetchUserProfile은 훅 내부에서 자동으로 호출되므로 여기서는 가져오지 않습니다.
  const { currentUserProfile, loading, error, updateProfile } = useAuth();

  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [currentIntroduction, setCurrentIntroduction] = useState<string>("");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteExistingImage, setDeleteExistingImage] =
    useState<boolean>(false);

  // currentUserProfile이 변경될 때마다 폼 상태 초기화
  useEffect(() => {
    if (currentUserProfile) {
      setCurrentNickname(currentUserProfile.nickname || "");
      setCurrentIntroduction(currentUserProfile.introduction || "");
      // 프로필 이미지가 null이거나 비어있으면 기본 Dicebear 아바타 사용
      const initialProfileImage =
        currentUserProfile.profileImage ||
        `${defaultProfileImage}${encodeURIComponent(
          currentUserProfile.nickname
        )}`;
      setPreviewImageUrl(initialProfileImage);
      setSelectedFile(null);
      setDeleteExistingImage(false);
    } else {
      // currentUserProfile이 null이면 (로그아웃 등), 폼도 초기 상태로
      setCurrentNickname("");
      setCurrentIntroduction("");
      setPreviewImageUrl(defaultProfileImage + "Default");
      setSelectedFile(null);
      setDeleteExistingImage(false);
    }
  }, [currentUserProfile]);

  // 닉네임 변경 핸들러
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentNickname(e.target.value);
  };

  // 자기소개 변경 핸들러
  const handleIntroductionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCurrentIntroduction(e.target.value);
  };

  // 파일 선택 input 변경 핸들러
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
      setDeleteExistingImage(false);
    } else {
      setSelectedFile(null);
      setPreviewImageUrl(
        currentUserProfile?.profileImage ||
          `${defaultProfileImage}${encodeURIComponent(
            currentUserProfile?.nickname || "Default"
          )}`
      );
    }
  };

  // 이미지 업로드 버튼 클릭 시 숨겨진 파일 input 트리거
  const handleProfileImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 기존 이미지 삭제 버튼 핸들러
  const handleDeleteProfileImage = () => {
    if (
      window.confirm(
        "현재 프로필 이미지를 삭제하고 기본 이미지로 변경하시겠습니까?"
      )
    ) {
      setSelectedFile(null);
      const currentNicknameForAvatar =
        currentUserProfile?.nickname || "Default";
      setPreviewImageUrl(
        `${defaultProfileImage}${encodeURIComponent(currentNicknameForAvatar)}`
      );
      setDeleteExistingImage(true);
    }
  };

  // "저장하기" 버튼 클릭 핸들러
  const handleSave = async () => {
    // 닉네임 유효성 검사
    if (
      currentNickname.trim().length < 2 ||
      currentNickname.trim().length > 10
    ) {
      alert("닉네임은 2자 이상 10자 이내로 입력해주세요.");
      return;
    }
    // 자기소개 유효성 검사
    if (currentIntroduction.trim().length > 100) {
      alert("자기소개는 100자 이내로 입력해주세요.");
      return;
    }

    // 변경사항 확인
    const isNicknameChanged =
      currentNickname !== (currentUserProfile?.nickname || "");
    const isIntroductionChanged =
      currentIntroduction !== (currentUserProfile?.introduction || "");
    const isNewImageSelected = selectedFile !== null;
    const isImageDeletionRequested = deleteExistingImage;
    // 실제 이미지 변경 여부를 정확히 판단
    const isImageActuallyChanged =
      isNewImageSelected ||
      isImageDeletionRequested ||
      (previewImageUrl !== currentUserProfile?.profileImage &&
        !previewImageUrl?.startsWith(defaultProfileImage) && // 새 이미지가 기본 이미지가 아니고
        (currentUserProfile?.profileImage === undefined ||
          !currentUserProfile?.profileImage?.startsWith(defaultProfileImage))); // 기존 이미지도 기본 이미지가 아닐 때

    if (
      !isNicknameChanged &&
      !isIntroductionChanged &&
      !isImageActuallyChanged
    ) {
      alert("변경할 내용이 없습니다.");
      return;
    }

    if (!window.confirm("정말로 정보를 수정하시겠습니까?")) {
      return;
    }

    // FormData 객체 생성 (multipart/form-data 형식으로 데이터 전송)
    const formData = new FormData();
    formData.append("nickname", currentNickname);
    formData.append("introduction", currentIntroduction);

    if (isNewImageSelected && selectedFile) {
      formData.append("profileImage", selectedFile);
    } else if (isImageDeletionRequested) {
      formData.append("deleteProfileImage", "true");
    }

    // useAuth 훅의 updateProfile 함수 호출
    const success = await updateProfile(formData);
    if (success) {
      // 훅 내부에서 alert 처리하므로 여기서는 추가 작업 없음
      // navigate('/mypage'); // 마이페이지 메인으로 이동 (필요하다면 훅에서 처리)
    }
    // 훅에서 에러 처리하므로 여기서는 추가 작업 없음
  };

  // "취소" 버튼 클릭 핸들러
  const handleCancel = () => {
    if (window.confirm("변경사항을 취소하고 이전으로 돌아가시겠습니까?")) {
      navigate(-1);
    }
  };

  // 로딩 및 에러 상태는 훅에서 관리하므로, 페이지에서는 이를 받아와 표시만 합니다.
  if (loading) {
    return <div className="text-center py-12">회원 정보를 불러오는 중...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">오류: {error}</div>;
  }
  // currentUserProfile이 아직 로드되지 않았다면 로딩 중으로 간주 (초기 상태)
  if (!currentUserProfile) {
    return <div className="text-center py-12">회원 정보를 불러오는 중...</div>;
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="회원 정보 수정"
        description="회원님의 닉네임, 자기소개, 프로필 사진을 수정할 수 있습니다."
      />

      <div className="p-8 space-y-6">
        {/* 프로필 이미지 섹션 */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={previewImageUrl || `${defaultProfileImage}Default`}
            alt="프로필 이미지"
            className="w-32 h-32 rounded-full object-cover border border-gray-300"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfileImageChange}
            className="hidden"
            accept="image/*"
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleProfileImageUploadClick}
              className="px-4 py-2 rounded-md text-sm font-normal"
            >
              사진 변경
            </Button>
            {/* 현재 프로필 이미지가 기본 이미지가 아니거나, 업로드된 이미지가 있는 경우에만 삭제 버튼 표시 */}
            {currentUserProfile?.profileImage &&
              !currentUserProfile.profileImage.startsWith(
                defaultProfileImage
              ) && (
                <Button
                  onClick={handleDeleteProfileImage}
                  className="px-4 py-2 rounded-md text-sm font-normal"
                >
                  사진 삭제
                </Button>
              )}
          </div>
        </div>

        {/* 이름 섹션 */}
        <div>
          <label
            htmlFor="name"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            이름
          </label>
          <input
            id="name"
            type="text"
            value={currentUserProfile?.name || ""}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"


          />
        </div>
        {/* 전화번호 섹션 */}
        <div>
          <label
            htmlFor="phone"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            전화번호
          </label>
          <input
            id="phone"
            type="tel"
            value={currentUserProfile?.phone || ""}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
          />
        </div>
        {/* 닉네임 섹션 */}
        <div>
          <label
            htmlFor="nickname"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-800"
            maxLength={10}
            value={currentNickname}
            onChange={handleNicknameChange}
            placeholder="2자 이상 10자 이내"
          />
        </div>

        {/* 자기소개 섹션 */}
        <div>
          <label
            htmlFor="introduction"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            자기소개
          </label>
          <textarea
            id="introduction"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 resize-none text-gray-800"
            rows={5}
            maxLength={100}
            value={currentIntroduction}
            onChange={handleIntroductionChange}
            placeholder="100자 이내로 자신을 소개해주세요."
          ></textarea>
        </div>

        {/* 저장/취소 버튼 */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            onClick={handleCancel}
            bgColor="bg-gray-300"
            textColor="text-gray-800"
            hoverBgColor="hover:bg-gray-400"
            className="px-6 py-2 rounded-lg font-normal"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            bgColor="bg-main"
            textColor="text-white"
            hoverBgColor="hover:bg-apply"
            className="px-6 py-2 rounded-lg font-normal"
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장하기"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;
