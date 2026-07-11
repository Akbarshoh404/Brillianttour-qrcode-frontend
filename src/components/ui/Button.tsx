import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(79,70,229,0.15),0_4px_12px_rgba(79,70,229,0.25)] hover:from-indigo-400 hover:to-indigo-500 disabled:hover:from-indigo-500 disabled:hover:to-indigo-600",
  secondary:
    "bg-black/[0.04] text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:bg-black/[0.07] dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:hover:bg-white/15",
  ghost: "text-gray-600 hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/10",
  danger:
    "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_rgba(220,38,38,0.25)] hover:from-red-400 hover:to-red-500 disabled:hover:from-red-500 disabled:hover:to-red-600",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", isLoading, disabled, className = "", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
