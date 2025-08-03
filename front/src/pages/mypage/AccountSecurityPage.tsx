// src/pages/mypage/AccountSecurityPage.tsx
import { useState } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader"; // 대소문자 수정 및 확장자 추가
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth"; // useAuth 훅 임포트

const AccountSecurityPage: React.FC = () => {
  const { currentUserProfile, changePassword, loading } = useAuth(); // useAuth 훅에서 changePassword와 loading 가져오기

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    // async 함수로 변경
    // 프론트엔드 유효성 검사 (기존 로직 유지)
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("모든 비밀번호 입력란을 채워주세요.");
      return;
    }
    if (newPassword.length < 8) {
      // API 명세서에 맞춰 최소 8자로 변경 (validation-result-handler)
      alert("새 비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    // useAuth 훅의 changePassword 함수 호출
    const success = await changePassword({
      currentPassword,
      newPassword,
      confirmNewPassword: confirmPassword, // ✨ confirmPassword 변수를 confirmNewPassword 속성으로 전달하도록 수정 ✨
    });

    if (success) {
      // 성공 시 입력 필드 초기화
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // 성공 메시지는 useAuth 훅에서 이미 alert로 처리합니다.
    }
    // 실패 메시지도 useAuth 훅에서 alert로 처리합니다.
  };

  return (
    <div>
      <section id="userLeave" className="container mx-auto p-6">
        <MyPageHeader
          title="계정 관리"
          description="회원님의 비밀번호를 수정할 수 있습니다."
        />
        <div className="p-8">
          <div className="space-y-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-lg font-medium"
            >
              이메일
            </label>
            <input
              type="email"
              value={currentUserProfile?.email || ""}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
            />
            <label
              htmlFor="password"
              className="block text-gray-700 text-lg font-medium"
            >
              비밀번호
            </label>
            <input
              type="password"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
            />
            <input
              type="password"
              placeholder="새 비밀번호 (8자 이상)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
            />
          </div>
          <div className="flex justify-end gap-4 mt-3">
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? "변경 중..." : "변경하기"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountSecurityPage;
