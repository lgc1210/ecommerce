import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type ButtonVariant = "primary" | "outline" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
	icon?: ReactNode;
	iconPosition?: "left" | "right";
	fullWidth?: boolean;
}

interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonBaseProps {}

interface LinkButtonProps extends LinkProps, ButtonBaseProps {
	disabled?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		"bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/25",
	outline:
		"border border-ink/15 text-ink hover:border-primary hover:text-primary-dark",
	ghost: "text-ink hover:bg-cream-soft",
	dark: "bg-ink text-cream hover:bg-ink-soft",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "h-9 px-4 text-sm",
	md: "h-11 px-6 text-sm",
	lg: "h-13 px-8 text-base",
};

const baseClasses =
	"inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-colors";

const getButtonClasses = (
	variant: ButtonVariant,
	size: ButtonSize,
	fullWidth: boolean,
): string =>
	`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""}`;

const Button = ({
	variant = "primary",
	size = "md",
	icon,
	iconPosition = "right",
	fullWidth = false,
	className = "",
	children,
	...rest
}: ButtonProps) => {
	return (
		<button
			className={`${getButtonClasses(variant, size, fullWidth)} disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:cursor-default ${className}`}
			{...rest}>
			{icon && iconPosition === "left" && icon}
			{children}
			{icon && iconPosition === "right" && icon}
		</button>
	);
};

const LinkButton = ({
	variant = "primary",
	size = "md",
	icon,
	iconPosition = "right",
	fullWidth = false,
	disabled = false,
	className = "",
	children,
	...rest
}: LinkButtonProps) => {
	const classes = `${getButtonClasses(variant, size, fullWidth)} ${className}`;

	const content = (
		<>
			{icon && iconPosition === "left" && icon}
			{children}
			{icon && iconPosition === "right" && icon}
		</>
	);

	// Link không có thuộc tính disabled. Khi bị vô hiệu hoá thì render <span> để không điều hướng
	// được và không nhận focus bàn phím, vẫn giữ nguyên giao diện nút.
	if (disabled) {
		return (
			<span
				aria-disabled='true'
				className={`${classes} cursor-not-allowed opacity-50`}>
				{content}
			</span>
		);
	}

	return (
		<Link className={classes} {...rest}>
			{content}
		</Link>
	);
};

export { Button, LinkButton };
