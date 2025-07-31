// src/pages/mypage/UserLeavePage.tsx
import { useState } from "react"; // useEffect 임포트 제거
// import { useNavigate } from "react-router-dom"; // useNavigate 임포트 제거
import MyPageHeader from "../../components/mypage/MyPageHeader"; // MyPageHeader로 수정 (대소문자 일치)
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

const UserLeavePage: React.FC = () => {
  // const navigate = useNavigate(); // navigate 선언 제거
  const [agreed, setAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");

  // useAuth 훅에서 회원 탈퇴 관련 상태와 함수를 가져옵니다.
  // error는 훅에서 alert 처리하므로 여기서는 가져오지 않습니다.
  const { deleteUser, loading } = useAuth();

  // 약관에 동의해야 버튼 활성화
  const handleLeaveClick = () => {
    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    if (agreed) setIsModalOpen(true);
  };

  // 모달창에서 탈퇴 버튼 클릭 -> 실제 탈퇴 로직 호출
  const handleConfirmLeave = async () => {
    setIsModalOpen(false);

    // useAuth 훅의 deleteUser 함수 호출
    // 현재 훅의 deleteUser는 비밀번호 인자 없음. 백엔드에서 비밀번호 검증이 필요하다면 훅 수정 필요
    const success = await deleteUser();

    if (success) {
      // 훅 내부에서 alert와 navigate 처리되므로 여기서는 추가 작업 없음
    } else {
      // 훅에서 에러 alert 처리하므로 여기서는 추가 작업 없음
    }
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
                className="px-4 py-2 rounded"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmLeave}
                className="px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "탈퇴 처리 중..." : "탈퇴하기"}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="현재 비밀번호 입력"
            className="w-full max-w-md px-4 py-3 mb-5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main text-gray-800"
          />
          <h2 className="block text-gray-700 text-lg font-medium mt-5 mb-4">
            회원 탈퇴 약관
          </h2>
          <div className="border border-gray-300 rounded-md p-7">
            <ul className="list-disc pl-6 space-y-2 text-gray-800">
              <li>
                회원 탈퇴 시, 계정 정보 및 활동 내역 (게시물, 댓글, 좋아요 등)은
                모두 삭제되며 복구 되지 않습니다.
              </li>
              <li>
                탈퇴 후에는 동일 이메일 또는 닉네임으로의 재가입이 제한될 수
                있습니다.
              </li>
              <li>
                커뮤니티 활동 이력은 시스템상 통계 데이터에 반영될 수 있습니다.
              </li>
              <li>
                탈퇴 요청 시, 즉시 탈퇴 처리되며 취소가 불가능하니 신중히
                결정해주세요.
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
              disabled={loading || !agreed || !password.trim()} // 로딩 중에도 비활성화
            >
              탈퇴하기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserLeavePage;
