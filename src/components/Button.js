import { classNames } from "@/lib/format";

export default function Button({ as: Comp = "button", className = "", variant = "primary", size = "md", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
    ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };
  return <Comp className={classNames(base, variants[variant] || variants.primary, sizes[size] || sizes.md, className)} {...props} />;
}
