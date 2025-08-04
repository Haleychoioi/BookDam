import { Link, type LinkProps } from "react-router-dom";
import React from "react"; // React 임포트가 없었다면 추가

interface BaseButtonProps {
  className?: string;
  disabled?: boolean;
  bgColor?: string;
  hoverBgColor?: string;
  textColor?: string;
  hoverTextColor?: string;
}

interface NativeButtonProps
  extends BaseButtonProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  to?: never;
}

interface LinkButtonProps extends BaseButtonProps, LinkProps {
  to: string;
}

type ButtonProps = NativeButtonProps | LinkButtonProps;

const Button: React.FC<ButtonProps> = ({
  className = "",
  disabled = false,
  bgColor,
  hoverBgColor,
  textColor,
  hoverTextColor, // ✨ hoverTextColor 프롭스 구조분해 할당 유지 ✨
  ...props
}) => {
  const defaultBgColor = "bg-main";
  const defaultHoverBgColor = "hover:bg-apply";
  const defaultTextColor = "text-white";
  const defaultHoverTextColor = "hover:text-white"; // ✨ 기본 hoverTextColor 정의 유지 ✨

  const finalBgColor = bgColor || defaultBgColor;
  const finalHoverBgColor = hoverBgColor || defaultHoverBgColor;
  const finalTextColor = textColor || defaultTextColor;
  const finalHoverTextColor = hoverTextColor || defaultHoverTextColor; // ✨ 최종 hoverTextColor 적용 유지 ✨

  const hasCustomBorderRadius = /(^|\s)rounded(-\w+)?/.test(className);

  const baseStyles = `${finalBgColor} ${finalTextColor} px-5 py-3 font-normal ${finalHoverBgColor} ${finalHoverTextColor} transition-colors duration-200 ${
    hasCustomBorderRadius ? "" : "rounded-lg"
  }`;

  const disabledStyles = "opacity-50 cursor-not-allowed";

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
