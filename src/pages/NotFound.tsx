import { motion } from "framer-motion";
import { FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glass-border max-w-sm rounded-3xl p-10 text-center shadow-card dark:shadow-card-dark"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <FileQuestion className="h-7 w-7" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Back to dashboard
        </Link>
      </motion.div>
    </div>
  );
}
