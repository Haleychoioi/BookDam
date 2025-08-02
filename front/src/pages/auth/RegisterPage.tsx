// src/pages/auth/RegisterPage.tsx
import React, { useState } from "react";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 눈 아이콘 임포트

const RegisterPage: React.FC = () => {
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    nickname: "",
    phone: "",
    email: "",
    password: "",
    introduction: "",
    agreement: false,
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  // 에러 메시지 상태 추가
  const [errors, setErrors] = useState({
    name: "",
    nickname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    introduction: "",
    agreement: "",
    general: "", // 일반적인 제출 오류
  });

  // 비밀번호 보이기/숨기기 상태 추가
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 실시간 유효성 검사
  const validateField = (name: string, value: string | boolean) => {
    let message = "";
    switch (name) {
      case "email":
        if (!value) message = "이메일을 입력해주세요.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string))
          message = "유효한 이메일 형식이 아닙니다.";
        break;
      case "password":
        if (!value) message = "비밀번호를 입력해주세요.";
        else if ((value as string).length < 8)
          message = "비밀번호는 최소 8자 이상이어야 합니다.";
        break;
      case "confirmPassword":
        if (!value) message = "비밀번호 확인을 입력해주세요.";
        else if (value !== form.password)
          message = "비밀번호가 일치하지 않습니다.";
        break;
      case "nickname":
        if (!value) message = "닉네임을 입력해주세요.";
        else if ((value as string).length < 1 || (value as string).length > 10)
          message = "닉네임은 1자 이상 10자 이하로 입력해주세요.";
        break;
      case "phone":
        if (!value) message = "전화번호를 입력해주세요.";
        break;
      case "name":
        if (!value) message = "이름을 입력해주세요.";
        break;
      case "introduction":
        // maxLength로 입력 제한하므로 여기서는 초과 검사 불필요
        break;
      case "agreement":
        if (!value) message = "이용약관에 동의해야 회원가입을 할 수 있습니다.";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const newValue = type === "checkbox" ? checked : value;

    if (name === "confirmPassword") {
      setConfirmPassword(newValue as string);
      validateField("confirmPassword", newValue);
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: newValue,
      }));
      validateField(name, newValue);
      if (name === "password") {
        validateField("confirmPassword", confirmPassword);
      }
    }
  };

  const handleCopyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrors((prev) => ({
      ...prev,
      password: "보안을 위해 복사 및 붙여넣기가 금지됩니다.",
      confirmPassword: "보안을 위해 복사 및 붙여넣기가 금지됩니다.",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 전체 폼 유효성 검사 (필수 필드 및 형식 검사)
    let isValid = true;

    // 각 필드의 초기 유효성 검사 수행 (실시간 검사가 이미 발생했더라도 제출 시 최종 확인)
    const fieldsToValidate: Array<keyof typeof form> = [
      "name",
      "nickname",
      "phone",
      "email",
      "password",
      "introduction",
    ];
    fieldsToValidate.forEach((field) => {
      validateField(field, form[field]);
      if (errors[field]) isValid = false; // validateField가 errors 상태를 직접 업데이트하므로, 여기서 바로 체크
    });
    // confirmPassword 별도 검사
    validateField("confirmPassword", confirmPassword);
    if (errors.confirmPassword) isValid = false;
    // agreement 별도 검사
    validateField("agreement", form.agreement);
    if (errors.agreement) isValid = false;

    // 만약 하나라도 에러가 있다면 제출 방지 및 일반 에러 메시지 표시
    if (
      !isValid ||
      !form.agreement ||
      Object.values(errors).some((msg) => msg !== "")
    ) {
      setErrors((prev) => ({
        ...prev,
        general: "모든 필수 정보를 올바르게 입력해주세요.",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, general: "" })); // 일반 오류 메시지 초기화

    const dataToSend = {
      name: form.name,
      nickname: form.nickname,
      phone: form.phone,
      email: form.email,
      password: form.password,
      introduction: form.introduction,
      agreement: form.agreement,
    };

    const success = await register(dataToSend);
    if (!success) {
      // useAuth 훅에서 이미 alert 처리되므로 여기서는 추가 작업 없음.
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
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          {errors.general && (
            <div className="bg-red-100 border border-red text-red-700 px-4 py-3 rounded relative mb-4">
              {errors.general}
            </div>
          )}
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
              onBlur={() => validateField("name", form.name)}
              required
              placeholder="이름을 입력하세요"
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-semibold mb-1"
            >
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              onBlur={() => validateField("nickname", form.nickname)}
              placeholder="닉네임을 입력하세요 (1자 이상 10자 이하)"
              maxLength={10} // ✨ 닉네임 글자 수 제한 추가 ✨
              required
              className={`w-full border ${
                errors.nickname ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2`}
            />
            {errors.nickname && (
              <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>
            )}
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
              onBlur={() => validateField("phone", form.phone)}
              required
              placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
              className={`w-full border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
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
              onBlur={() => validateField("email", form.email)}
              required
              placeholder="이메일 주소를 입력하세요"
              className={`w-full border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-1"
            >
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={() => validateField("password", form.password)}
                onCopy={handleCopyPaste}
                onPaste={handleCopyPaste}
                required
                placeholder="비밀번호를 입력하세요 (최소 8자)"
                className={`w-full border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded px-4 py-2 pr-10`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold mb-1"
            >
              비밀번호 재입력
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                onBlur={() => validateField("confirmPassword", confirmPassword)}
                onCopy={handleCopyPaste}
                onPaste={handleCopyPaste}
                required
                placeholder="비밀번호를 다시 입력하세요"
                className={`w-full border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded px-4 py-2 pr-10`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="introduction"
              className="block text-sm font-semibold mb-1"
            >
              한 줄 소개
            </label>
            <textarea
              id="introduction"
              name="introduction"
              value={form.introduction}
              onChange={handleChange}
              onBlur={() => validateField("introduction", form.introduction)}
              placeholder="자신을 한 줄로 소개해보세요 (100자 이내, 선택사항)"
              rows={3}
              maxLength={100} // ✨ 자기소개 글자 수 제한 추가 ✨
              className={`w-full border ${
                errors.introduction ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2 resize-none`}
            />
            {errors.introduction && (
              <p className="text-red-500 text-xs mt-1">{errors.introduction}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agreement"
              name="agreement"
              checked={form.agreement}
              onChange={handleChange}
              onBlur={() => validateField("agreement", form.agreement)}
              required
              className={`w-4 h-4 ${
                errors.agreement ? "border-red-500" : "border-gray-300"
              }`}
            />
            <label htmlFor="agreement" className="text-sm text-gray-700">
              이용약관에 동의합니다
            </label>
          </div>
          {errors.agreement && (
            <p className="text-red-500 text-xs mt-1">{errors.agreement}</p>
          )}

          <div className="text-center pt-5">
            <Button type="submit" disabled={loading}>
              {loading ? "가입 중..." : "가입하기"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default RegisterPage;
