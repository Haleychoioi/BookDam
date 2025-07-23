import React, { useState } from "react";
import Button from "../../components/common/Button";

const RegisterPage: React.FC = () => {
    const [form, setForm] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    agree: false,
  });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value, type, checked } = e.target;
  setForm({
    ...form,
    [name]: type === "checkbox" ? checked : value,
  });
};
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">회원가입</h1>
        <h2 className="text-lg text-gray-700">
          우리의 커뮤니티에 참여하여 독서의 즐거움을 나누세요. <br />
          간단한 절차로 회원 가입을 통해 다양한 혜택을 누리실 수 있습니다.
        </h2>
      </div>
      <form className="max-w-md mx-auto space-y-4">
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
            required
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
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-semibold mb-1">
            한 줄 소개
          </label>
          <input
            type="text"
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="agree"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            required
            className="w-4 h-4"
          />
          <label htmlFor="agree" className="text-sm text-gray-700">
            이용약관에 동의합니다
          </label>
        </div>
        <div className="text-center pt-4">
          <Button>가입하기</Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
