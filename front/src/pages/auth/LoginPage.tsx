import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import axios from "axios";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      alert("로그인 성공!");
      // localStorage.setItem("token", response.data.token); // 필요한 경우
      navigate("/");
    } catch (error: any) {
      alert("로그인 실패: " + (error.response?.data?.message || "알 수 없는 오류"));
    }
  };

  return (
  <div>
    <section id="loginText" className="container mx-auto py-12 px-20 mt-10">
      <h1 className="text-3xl font-semibold mb-6">환영합니다, 로그인</h1>
      <p>당신의 독서 여정을 시작하기 위해 로그인하세요.함께 책을 나누고 소통합시다.</p>
    </section>
    <section id="login" className="container mx-auto py-12 px-20">
        <form className="space-y-4 max-w-md mx-auto" onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <Button type="submit">로그인</Button>
        </form>

    </section>
    <section id="register" className="container mx-auto py-12 px-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
        <div>
          <h2 className="text-2xl font-bold mb-4">회원 가입으로 새로운 시작</h2>
        </div>
        <div className="text-right">
          <p className="text-gray-700 mb-5">
            아직 회원이 아니신가요? <br />
            지금 가입하시면 다양한 독서 경험과 커뮤니티 활동에 참여하실 수 있습니다.
          </p>
          <Button to="/auth/register">가입하기</Button>
        </div>
      </div>
    </section>
  </div>
  )
};

export default LoginPage;
