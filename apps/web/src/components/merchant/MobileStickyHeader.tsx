"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MobileStickyHeader() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    // Prefer going back in history; fall back to home when no history
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const onScroll = () => {
      // Small threshold so the background appears once user starts scrolling
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 left-0 right-0 z-50 lg:block lg:top-16">
      <div
        className={
          "w-full px-[10px] h-[45px] min-h-[45px] max-h-[45px] flex items-center justify-between transition-colors duration-200 " +
          (scrolled ? "bg-white/60 backdrop-blur-sm shadow-sm" : "")
        }
      >
        <button
          aria-label="Back"
          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left text-[14px] text-[#333]"></i>
        </button>
        <div className="flex items-center gap-2">
          <button
            aria-label="Information"
            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <i className="fas fa-info text-[14px] text-[#333]"></i>
          </button>
          <button
            aria-label="Wishlist"
            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <i className="fa-regular fa-heart text-[14px] text-[#333]"></i>
          </button>
          <button
            aria-label="Share"
            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <i className="fa-regular fa-share-from-square text-[14px] text-[#333]"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
