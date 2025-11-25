"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SearchField from "@/components/ui/SearchField";

export default function MobileStickyHeader() {
  const [bgAlpha, setBgAlpha] = useState(0);
  const [hideActions, setHideActions] = useState(false);
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
      const y = typeof window !== "undefined" ? window.scrollY : 0;
      const alpha = Math.max(0, Math.min(1, y / 350));
      setBgAlpha(alpha);
      setHideActions(y >= 350);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <div className="sticky top-0 left-0 right-0 z-50 lg:block lg:top-16">
      <div
        className={
          "w-full px-[10px] h-[45px] min-h-[45px] max-h-[45px] flex items-center justify-between transition-colors duration-200"
        }
        style={{ backgroundColor: `rgba(255,255,255,${bgAlpha})` }}
      >
        <button
          aria-label="Back"
          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left text-[14px] text-[#333]"></i>
        </button>
        {hideActions && (
          <div className="flex-1 px-2">
            <SearchField
              placeholder="Search menu"
              value={""}
              onChange={() => {}}
              readOnly
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("merchant:open-search"));
                }
              }}
            />
          </div>
        )}
        {hideActions ? (
          <div className="flex items-center gap-2">
            <button
              aria-label="More"
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
            >
              <i className="fas fa-ellipsis-v text-[14px] text-[#333]"></i>
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
