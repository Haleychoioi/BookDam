import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import Button from "../../components/common/Button";

const ChangePassWordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    alert("비밀번호가 변경되었습니다.")
  }

  return (
  <div>
    <section id="userLeave" className="container mx-auto p-6">
      <MyPageHeader
        title="비밀번호 변경"
        description="회원님의 비밀번호를 수정할 수 있습니다."
      />
      <div className="p-8">
        <div className="space-y-4">
          <label htmlFor="password" className="block text-gray-700 text-lg font-medium">
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
          <Button onClick={handleChangePassword}>
             변경하기
          </Button>
        </div>
      </div>
    </section>
  </div>
  )
};

export default ChangePassWordPage;