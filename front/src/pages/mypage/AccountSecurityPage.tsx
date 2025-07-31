import { useState } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

const AccountSecurityPage: React.FC = () => {

  const { currentUserProfile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

    const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("모든 비밀번호 입력란을 채워주세요.");
      return;
    }
    if (newPassword.length < 6) {
      alert("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    alert("비밀번호가 변경되었습니다.");
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
            placeholder="새 비밀번호 (6자 이상)"
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
          <Button onClick={handleChangePassword}>
             변경하기
          </Button>
        </div>
      </div>
    </section>
  </div>
  )
};

export default AccountSecurityPage;