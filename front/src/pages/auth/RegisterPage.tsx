import React, { useState } from "react";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";

import axios from "axios";

{/* 가상의 URL 설정 */}
const DEFAULT_PROFILE =
  "https://via.placeholder.com/120?text=Profile";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    introduction: "",
    agreement: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 간단한 유효성 검사 (필요 시 강화 가능)
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/auth/register", {
        name: form.name,
        nickname: form.nickname,
        phone: form.phone,
        email: form.email,
        password: form.password,
        introduction: form.introduction,
        agreement: form.agreement,
      });

      alert("회원가입 성공!");
      navigate("/auth/login");
    } catch (error: any) {
      alert("회원가입 실패: " + error.response?.data?.message);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <section id="register" className="container mx-auto py-12 px-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">회원가입</h1>
          <h2 className="text-lg text-gray-700">
            우리의 커뮤니티에 참여하여 독서의 즐거움을 나누세요. <br />
            간단한 절차로 회원 가입을 통해 다양한 혜택을 누리실 수 있습니다.
          </h2>
        </div>
        <form className="max-w-md mx-auto space-y-4"onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="이름을 입력하세요"
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div>
            <label htmlFor="nickname" className="block text-sm font-semibold mb-1">
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="닉네임을 입력하세요"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-1">
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="전화번호를 입력하세요"
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="이메일 주소를 입력하세요"
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="비밀번호를 입력하세요"
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1">
              비밀번호 재입력
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div>
            <label htmlFor="introduction" className="block text-sm font-semibold mb-1">
              한 줄 소개
            </label>
            <input
              type="text"
              id="introduction"
              name="introduction"
              value={form.introduction}
              onChange={handleChange}
              placeholder="자신을 한 줄로 소개해보세요 (선택사항)"
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agreement"
              name="agreement"
              checked={form.agreement}
              onChange={handleChange}
              required
              className="w-4 h-4"
            />
            <label htmlFor="agreement" className="text-sm text-gray-700">
              이용약관에 동의합니다
            </label>
          </div>
          <div className="text-center pt-5">
            <Button type="submit">가입하기</Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default RegisterPage;
