import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	icon?: ReactNode;
	iconPosition?: "left" | "right";
	fullWidth?: boolean;
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
			className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:cursor-pointer ${
				variantClasses[variant]
			} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
			{...rest}>
			{icon && iconPosition === "left" && icon}
			{children}
			{icon && iconPosition === "right" && icon}
		</button>
	);
};

export default Button;
