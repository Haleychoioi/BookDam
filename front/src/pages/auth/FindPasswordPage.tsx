// src/pages/auth/FindPasswordPage.tsx

import React, { useState } from "react";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
// useAuth 훅에 임시 비밀번호 발급 함수를 추가할 예정입니다.
// import { useAuth } from "../../hooks/useAuth";

const FindPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState<string | null>(null); // 에러 상태 추가
  const navigate = useNavigate();

  // useAuth 훅에 임시 비밀번호 발급 함수가 추가되면 이곳에 임포트하여 사용합니다.
  // const { issueTemporaryPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // TODO: useAuth 훅의 issueTemporaryPassword 함수 호출 (다음 단계에서 구현)
    try {
      // await issueTemporaryPassword(email, name);
      // 실제 API 호출 시 위 주석을 해제하고 사용
      console.log(`임시 비밀번호 요청: 이메일 - ${email}, 이름 - ${name}`);

      // Mock API 호출 (실제 구현 시 제거)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (Math.random() > 0.1) {
        // 90% 성공
        alert(
          "임시 비밀번호가 이메일로 전송되었습니다. 로그인 후 비밀번호를 변경해주세요."
        );
        navigate("/auth/login"); // 성공 시 로그인 페이지로 이동
      } else {
        throw new Error(
          "비밀번호 찾기 요청에 실패했습니다. 입력 정보를 확인해주세요."
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <section id="findPassword" className="max-w-md mx-auto p-6 mt-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          비밀번호 찾기
        </h1>
        <p className="text-center text-gray-600 mb-8">
          가입 시 입력했던 이메일과 이름을 입력해주세요. <br />
          임시 비밀번호를 이메일로 보내드립니다.
        </p>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">오류: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입 이메일 주소"
              required
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1">
              이름
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              required
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "전송 중..." : "임시 비밀번호 받기"}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default FindPasswordPage;
