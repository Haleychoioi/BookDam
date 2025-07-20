import { Link, type LinkProps } from "react-router-dom";

// 1. 모든 버튼 타입이 공통적으로 가질 수 있는 기본 Props
// children과 onClick 등은 각 HTML 요소 타입에서 가져오므로 여기서는 정의하지 않습니다.
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
  to?: never; // 'to' prop은 여기서는 절대로 없어야 함
}

// 3. React Router Link 컴포넌트로 렌더링될 때의 Props
interface LinkButtonProps extends BaseButtonProps, LinkProps {
  to: string; // 'to' prop은 Link일 경우 반드시 있어야 함
}

// 4. 최종 Button 컴포넌트 Props 타입 (판별 가능한 유니언)
type ButtonProps = NativeButtonProps | LinkButtonProps;

const Button: React.FC<ButtonProps> = ({
  className = "",
  disabled = false,
  bgColor, // ✨ 직접 받은 배경색 ✨
  hoverBgColor, // ✨ 직접 받은 호버 배경색 ✨
  textColor, // ✨ 직접 받은 텍스트색 ✨
  ...props // 나머지 모든 HTML 속성들 (children, onClick, to, type 등)
}) => {
  // 기본값 (검은색 버튼 디자인을 기반)
  const defaultBgColor = "bg-accent";
  const defaultHoverBgColor = "hover:bg-primary";
  const defaultTextColor = "text-white";

  // 최종 적용될 배경색, 호버색, 텍스트색
  const finalBgColor = bgColor || defaultBgColor;
  const finalHoverBgColor = hoverBgColor || defaultHoverBgColor;
  const finalTextColor = textColor || defaultTextColor;

  // 기본 버튼 스타일 (하드코딩된 색상 클래스 제거하고 동적으로 적용)
  const baseStyles = `${finalBgColor} ${finalTextColor} px-5 py-3 font-medium ${finalHoverBgColor} transition-colors duration-200`;
  // 비활성화 상태 스타일
  const disabledStyles = "opacity-50 cursor-not-allowed";

  // 최종 적용될 스타일 클래스
  const combinedStyles = `${baseStyles} ${className} ${
    disabled ? disabledStyles : ""
  }`;

  if ("to" in props && typeof props.to === "string") {
    // LinkProps 타입에 필요한 속성들만 추출하여 Link 컴포넌트에 전달
    // children과 onClick은 props에서 바로 추출하여 Link에 전달
    const { to, children, onClick, ...rest } = props as LinkButtonProps;
    return (
      <Link to={to} className={combinedStyles} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  } else {
    // NativeButtonProps 타입에 필요한 속성들만 추출하여 button 태그에 전달
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
