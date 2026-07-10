import { AnimatePresence, motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { useState } from "react";

interface QrImageProps {
  src: string;
  alt: string;
  size: number;
}

/** QR code `<img>` with a skeleton while it loads and a graceful fallback on failure. */
export function QrImage({ src, alt, size }: QrImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <AnimatePresence>
        {status === "loading" && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 animate-pulse rounded-lg bg-black/[0.08] dark:bg-white/[0.1]"
          />
        )}
      </AnimatePresence>

      {status === "error" ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg bg-black/[0.04] text-gray-400 dark:bg-white/[0.06]">
          <ImageOff className="h-4 w-4" />
        </div>
      ) : (
        <motion.img
          key={src}
          src={src}
          alt={alt}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          initial={{ opacity: 0 }}
          animate={{ opacity: status === "loaded" ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="h-full w-full"
          style={{ width: size, height: size }}
        />
      )}
    </div>
  );
}
