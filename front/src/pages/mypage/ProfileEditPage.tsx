import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import Button from "../../components/common/Button";
import type { UserProfile } from "../../types";

const dummyUserProfile: UserProfile = {
  nickname: "기존닉네임123",
  introduction:
    "안녕하세요! 저는 독서를 좋아하고 웹 개발을 즐기는 사용자입니다. 함께 독서하고 소통해요!",
};

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentNickname, setCurrentNickname] = useState("");
  const [currentIntroduction, setCurrentIntroduction] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: 실제 API 호출: GET /mypage/profile (현재 API 명세에는 GET 없음. PUT만 있음)
        //       일반적으로 회원 정보 수정 페이지 진입 시 현재 정보를 먼저 GET으로 불러옵니다.
        //       없다면 로그인 시 저장된 사용자 정보를 클라이언트에서 사용해야 함.
        await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션
        setCurrentNickname(dummyUserProfile.nickname);
        setCurrentIntroduction(dummyUserProfile.introduction);
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

  // "저장하기" 버튼 클릭 핸들러
  const handleSave = async () => {
    if (
      currentNickname.trim().length < 2 ||
      currentNickname.trim().length > 10
    ) {
      alert("닉네임은 2자 이상 10자 이내로 입력해주세요.");
      return;
    }
    if (currentIntroduction.trim().length > 100) {
      alert("자기소개는 100자 이내로 입력해주세요.");
      return;
    }

    if (
      currentNickname === dummyUserProfile.nickname &&
      currentIntroduction === dummyUserProfile.introduction
    ) {
      alert("변경할 내용이 없습니다.");
      return;
    }

    if (currentIntroduction.trim().length === 0) {
      // 자기소개가 비어있거나 공백만 있을 경우
      alert("자기소개를 입력해주세요.");
      return;
    }
    if (currentIntroduction.trim().length > 100) {
      // 자기소개가 100자 초과일 경우
      alert("자기소개는 100자 이내로 입력해주세요.");
      return;
    }

    if (!window.confirm("정말로 정보를 수정하시겠습니까?")) {
      return;
    }

    try {
      // TODO: 실제 API 호출: PUT /mypage/profile
      // 요청 본문: { nickname: currentNickname, introduction: currentIntroduction }
      console.log("회원 정보 수정 요청:", {
        nickname: currentNickname,
        introduction: currentIntroduction,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // API 호출 시뮬레이션

      if (Math.random() > 0.1) {
        // 90% 성공
        alert("회원 정보가 성공적으로 수정되었습니다!");
        // TODO: 실제 앱에서는 전역 사용자 정보도 업데이트해야 함
        // navigate('/mypage'); // 마이페이지 메인으로 이동
      } else {
        alert("회원 정보 수정에 실패했습니다. 다시 시도해주세요.");
      }
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
        description="회원님의 닉네임과 자기소개를 수정할 수 있습니다."
      />

      <div className=" p-8 space-y-6">
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
            onChange={(e) => setCurrentNickname(e.target.value)}
            placeholder="2자 이상 10자 이내"
          />
        </div>

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
            onChange={(e) => setCurrentIntroduction(e.target.value)}
            placeholder="100자 이내로 자신을 소개해주세요."
          ></textarea>
        </div>

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
