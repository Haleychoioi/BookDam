import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import Button from "../../components/common/Button";

const UserLeavePage: React.FC = () => { 
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  {/* 약관에 동의해야 버튼 활성화 */}
  const handleLeaveClick = () => {
    if (agreed) setIsModalOpen(true);
  };
  {/* 모달창에서 탈퇴버튼 클릭 -> alert창 -> 홈으로 이동 */}
  const handleConfirmLeave = () => {
    console.log("탈퇴 요청!");
    setIsModalOpen(false);

    setTimeout (() => {
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    }, 100);
  };

  const handleCancelLeave = () => {
    setIsModalOpen(false);
  };

  return (
  <div>
    {/*모달 */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-md shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">정말 탈퇴하시겠습니까?</h2>
          <p className="mb-6 text-gray-700">
            탈퇴하면 모든 정보가 삭제되며 복구할 수 없습니다.
          </p>
          <div className="flex justify-end gap-4">
            <Button 
              onClick={handleCancelLeave} 
              bgColor="bg-gray-300"
              textColor="text-white"
              hoverBgColor="hover:bg-gray-400"
              className="px-4 py-2 rounded">
              취소
            </Button>
            <Button onClick={handleConfirmLeave} className="px-4 py-2 rounded">
              탈퇴하기
            </Button>
          </div>
        </div>
      </div>
    )}

    <section id="userLeave" className="container mx-auto p-6">
      <MyPageHeader
        title="회원 탈퇴"
        description="탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다."
      />
      <div className="p-8">
        <label 
          htmlFor="password"
          className="block text-gray-700 text-lg font-medium mb-2"
        >
          비밀번호
        </label>
        <p className="text-gray-600 text-md mb-4">
          회원 탈퇴를 위하여 비밀번호를 입력하여주시길 바랍니다.
        </p>
        <input
          type="password"
          id="password"
          name="password"
          required
          placeholder="현재 비밀번호 입력"
          className="w-full max-w-md px-4 py-3 mb-5 border border-gray-300 rounded-md focus:outline-none text-gray-800"
        />
        <h2 className="block text-gray-700 text-lg font-medium mt-5 mb-4">회원 탈퇴 약관</h2>
        <div className="border border-gray-300 rounded-md p-7">
          <ul className="list-disc pl-6 space-y-2 text-gray-800">
            <li>
              회원 탈퇴 시, 계정 정보 및 활동 내역 (게시물, 댓글, 좋아요 등)은 모두 삭제되며 복구 되지 않습니다.
            </li>
            <li>
              탈퇴 후에는 동일 이메일 또는 닉네임으로의 재가입이 제한될 수 있습니다.
            </li>
            <li>
              커뮤니티 활동 이력은 시스템상 통계 데이터에 반영될 수 있습니다.
            </li>
            <li>
              탈퇴 요청 시, 즉시 탈퇴 처리되며 취소가 불가능하니 신중히 결정해주세요.
            </li>
          </ul>
        </div>
        <label className="flex items-center mt-4">
          <input 
            type="checkbox" 
            className="mr-2" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required 
          />
          위 내용을 확인하였으며, 이에 동의합니다.
        </label>
        <div className="flex justify-end gap-4">
          <Button 
            onClick={handleLeaveClick} 
            disabled={!agreed}>
            탈퇴하기
          </Button>
        </div>
      </div>

    </section>
  </div>
  )
};

export default UserLeavePage;