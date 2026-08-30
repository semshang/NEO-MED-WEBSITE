"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

export function AuthToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      const showTimer = window.setTimeout(() => setShow(true), 0);
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("error");
      const newUrl = pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
      router.replace(newUrl, { scroll: false });

      // Auto hide
      const timer = window.setTimeout(() => setShow(false), 5000);
      return () => {
        window.clearTimeout(showTimer);
        window.clearTimeout(timer);
      };
    }
  }, [searchParams, pathname, router]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className="fixed top-24 left-1/2 z-[100] flex items-center space-x-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-lg"
        >
          <AlertCircle size={20} className="shrink-0" />
          <span className="font-medium text-sm">You don&apos;t have permission to access that page.</span>
          <button 
            onClick={() => setShow(false)}
            className="p-1 hover:bg-red-100 rounded-full transition-colors ml-2"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
