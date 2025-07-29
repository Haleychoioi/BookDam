// src/pages/mypage/ProfileEditPage.tsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import Button from "../../components/common/Button";
import type { UserProfile } from "../../types";

// 기본 프로필 이미지 경로 (실제 프로젝트의 경로에 맞게 수정해주세요)
// 만약 로컬에 기본 이미지 파일이 없다면, 웹상의 기본 이미지 URL을 사용하거나,
// 회원가입 시 사용되는 Dicebear API URL을 여기에 넣어줄 수 있습니다.
const defaultProfileImage = "https://via.placeholder.com/150?text=Default";

const dummyUserProfile: UserProfile = {
  userId: 1,
  email: "dummy@example.com",
  name: "더미사용자",
  nickname: "기존닉네임123",
  phone: "010-1234-5678",
  agreement: true,
  role: "USER",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  profileImage: defaultProfileImage,
  introduction:
    "안녕하세요! 저는 독서를 좋아하고 웹 개발을 즐기는 사용자입니다. 함께 독서하고 소통해요!",
};

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [currentIntroduction, setCurrentIntroduction] = useState<string>("");
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState<
    string | null
  >(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [deleteExistingImage, setDeleteExistingImage] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: 실제 API 호출: GET /users/getProfile
        // API 명세서에 따르면 '내 정보 조회' API는 /user/getProfile (GET)
        // 이 API는 JWT 토큰 인증이 필요하며, 응답으로 user 객체를 반환합니다.
        await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션 (실제 API 호출로 대체)

        // 더미 데이터 또는 실제 API 응답으로 상태 초기화
        setCurrentNickname(dummyUserProfile.nickname || "");
        setCurrentIntroduction(dummyUserProfile.introduction || "");

        const initialImageUrl =
          dummyUserProfile.profileImage || defaultProfileImage;
        setCurrentProfileImageUrl(initialImageUrl);
        setPreviewImageUrl(initialImageUrl);

        // 만약 더미 프로필 이미지가 Dicebear URL이라면, deleteExistingImage를 true로 설정하지 않음
        // 실제 프로필 이미지가 기본 랜덤 이미지인 경우, 사용자가 삭제하지 않은 것으로 간주
        if (
          dummyUserProfile.profileImage &&
          dummyUserProfile.profileImage.includes("api.dicebear.com")
        ) {
          setDeleteExistingImage(false); // Dicebear 이미지는 삭제 대상으로 간주하지 않음 (선택 사항)
        } else {
          setDeleteExistingImage(false); // 기본적으로 이미지가 있으면 삭제 플래그는 false
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "회원 정보를 불러오는데 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

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
      setSelectedFile(file); // 선택된 파일 저장
      setPreviewImageUrl(URL.createObjectURL(file)); // 미리보기 URL 생성
      setDeleteExistingImage(false); // 새 이미지를 선택했으니 삭제 플래그 초기화
    } else {
      setSelectedFile(null); // 파일 선택 취소 시 파일 상태 초기화
      setPreviewImageUrl(currentProfileImageUrl); // 미리보기 원래 이미지로 복원
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
      setSelectedFile(null); // 새로 선택된 파일이 있다면 초기화
      setPreviewImageUrl(defaultProfileImage); // 미리보기 이미지를 기본 이미지로 변경
      setDeleteExistingImage(true); // 기존 이미지 삭제 플래그 설정
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
    const isNicknameChanged = currentNickname !== dummyUserProfile.nickname;
    const isIntroductionChanged =
      currentIntroduction !== (dummyUserProfile.introduction || "");
    const isNewImageSelected = selectedFile !== null;
    const isImageDeletionRequested = deleteExistingImage;
    const isImageActuallyChanged = currentProfileImageUrl !== previewImageUrl; // 실제로 보이는 이미지가 변경되었는지

    if (
      !isNicknameChanged &&
      !isIntroductionChanged &&
      !isNewImageSelected &&
      !isImageDeletionRequested &&
      !isImageActuallyChanged
    ) {
      alert("변경할 내용이 없습니다.");
      return;
    }

    if (!window.confirm("정말로 정보를 수정하시겠습니까?")) {
      return;
    }

    try {
      // FormData 객체 생성 (multipart/form-data 형식으로 데이터 전송)
      const formData = new FormData();
      formData.append("nickname", currentNickname);
      formData.append("introduction", currentIntroduction);

      if (isNewImageSelected && selectedFile) {
        formData.append("profileImage", selectedFile); // 새로운 파일 추가
      } else if (isImageDeletionRequested) {
        formData.append("deleteProfileImage", "true"); // 기존 이미지 삭제 요청
      }

      // TODO: 실제 API 호출: PUT /users/profile
      // Content-Type: multipart/form-data 헤더는 FormData 사용 시 fetch가 자동으로 설정하므로 명시할 필요 없음.
      // Authorization 토큰은 실제 구현 시 요청 헤더에 추가해야 합니다.
      const response = await fetch("/users/profile", {
        method: "PUT",
        // headers: {
        //   'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`, // 실제 토큰으로 교체
        // },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "프로필 수정 실패");
      }

      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("회원 정보가 성공적으로 수정되었습니다!");
      // TODO: 실제 앱에서는 전역 사용자 정보도 업데이트하고,
      // navigate('/mypage'); // 마이페이지 메인으로 이동
    } catch (err) {
      console.error("회원 정보 수정 중 오류:", err);
      alert("회원 정보 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // "취소" 버튼 클릭 핸들러
  const handleCancel = () => {
    if (window.confirm("변경사항을 취소하고 이전으로 돌아가시겠습니까?")) {
      navigate(-1);
    }
  };

  if (loading) {
    return <div className="text-center py-12">회원 정보를 불러오는 중...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">오류: {error}</div>;
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
            src={previewImageUrl || defaultProfileImage} // 미리보기 이미지 또는 기본 이미지
            alt="프로필 이미지"
            className="w-32 h-32 rounded-full object-cover border border-gray-300"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfileImageChange}
            className="hidden" // 실제 input은 숨기고 버튼으로 트리거
            accept="image/*" // 이미지 파일만 허용
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleProfileImageUploadClick}
              className="px-4 py-2 rounded-md text-sm font-normal"
            >
              사진 변경
            </Button>
            {/* 현재 프로필 이미지가 기본 이미지가 아니거나, 업로드된 이미지가 있는 경우에만 삭제 버튼 표시 */}
            {currentProfileImageUrl !== defaultProfileImage && (
              <Button
                onClick={handleDeleteProfileImage}
                className="px-4 py-2 rounded-md text-sm font-normal"
              >
                사진 삭제
              </Button>
            )}
          </div>
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
          >
            저장하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;
