import { Link, type LinkProps } from "react-router-dom";

// 1. 모든 버튼 타입이 공통적으로 가질 수 있는 기본 Props
interface BaseButtonProps {
  className?: string; // Tailwind CSS 클래스를 추가로 적용
  disabled?: boolean; // 버튼 비활성화 여부
  bgColor?: string; // 예: "bg-blue-500", "bg-red-600"
  hoverBgColor?: string; // 예: "hover:bg-blue-600", "hover:bg-red-700"
  textColor?: string; // 예: "text-white", "text-gray-900"
}

// 2. HTML <button> 태그로 렌더링될 때의 Props
interface NativeButtonProps
  extends BaseButtonProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  to?: never;
}

// 3. React Router Link 컴포넌트로 렌더링될 때의 Props
interface LinkButtonProps extends BaseButtonProps, LinkProps {
  to: string;
}

// 4. 최종 Button 컴포넌트 Props 타입 (판별 가능한 유니언)
type ButtonProps = NativeButtonProps | LinkButtonProps;

const Button: React.FC<ButtonProps> = ({
  className = "",
  disabled = false,
  bgColor,
  hoverBgColor,
  textColor,
  ...props
}) => {
  // 기본값 (검은색 버튼 디자인을 기반)
  const defaultBgColor = "bg-main";
  const defaultHoverBgColor = "hover:bg-apply";
  const defaultTextColor = "text-white";

  // 최종 적용될 배경색, 호버색, 텍스트색
  const finalBgColor = bgColor || defaultBgColor;
  const finalHoverBgColor = hoverBgColor || defaultHoverBgColor;
  const finalTextColor = textColor || defaultTextColor;

  // ✨ 여기가 수정된 부분입니다! ✨
  // className에 rounded-none 또는 다른 rounded- 접두사를 가진 클래스가 있는지 확인
  const hasCustomBorderRadius = /(^|\s)rounded(-\w+)?/.test(className);

  // 기본 버튼 스타일 (하드코딩된 색상 클래스 제거하고 동적으로 적용)
  // hasCustomBorderRadius가 false일 때만 rounded-xl을 추가
  const baseStyles = `${finalBgColor} ${finalTextColor} px-5 py-3 font-medium ${finalHoverBgColor} transition-colors duration-200 ${
    hasCustomBorderRadius ? "" : "rounded-xl" // 이미 rounded 관련 클래스가 없으면 기본 rounded-xl 적용
  }`;

  // 비활성화 상태 스타일
  const disabledStyles = "opacity-50 cursor-not-allowed";

  // 최종 적용될 스타일 클래스
  const combinedStyles = `${baseStyles} ${className} ${
    disabled ? disabledStyles : ""
  }`;

  if ("to" in props && typeof props.to === "string") {
    const { to, children, onClick, ...rest } = props as LinkButtonProps;
    return (
      <Link to={to} className={combinedStyles} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  } else {
    const {
      type = "button",
      children,
      onClick,
      ...rest
    } = props as NativeButtonProps;
    return (
      <button
        type={type}
        className={combinedStyles}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    );
  }
};

export default Button;
