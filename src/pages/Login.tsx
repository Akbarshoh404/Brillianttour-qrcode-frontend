import { motion } from "framer-motion";
import { FileStack, Lock, LogIn, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/services/api";

interface LoginFormValues {
  username: string;
  password: string;
}

export function Login() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({ defaultValues: { username: "", password: "" } });

  if (status === "authenticated") {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = handleSubmit(async ({ username, password }) => {
    setError(null);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="glass glass-border w-full max-w-sm rounded-3xl p-8 shadow-card dark:shadow-card-dark"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
            <FileStack className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">PDF Manager</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to manage documents</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Username</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                {...register("username", { required: true })}
                type="text"
                autoComplete="username"
                autoFocus
                className="w-full rounded-xl border border-black/[0.06] bg-black/[0.03] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-100 dark:focus:bg-white/[0.06]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                {...register("password", { required: true })}
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-black/[0.06] bg-black/[0.03] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-100 dark:focus:bg-white/[0.06]"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-xs font-medium text-red-500">{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            <LogIn className="h-4 w-4" />
            Sign in
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
