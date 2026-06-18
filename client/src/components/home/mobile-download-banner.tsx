import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { analytics } from "@/lib/analytics";

const APP_STORE_URL = "https://apps.apple.com/us/app/pestflow/id6773204838";
const APP_ICON_SRC = "/assets/pestflow-app-store-icon.jpg";

function shouldUseNativeSafariBanner() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIos = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|FBAN|FBAV|FBIOS|Instagram|Messenger/i.test(ua);
  return isIos && isSafari;
}

export function MobileDownloadBanner() {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return true;
    return shouldUseNativeSafariBanner() || sessionStorage.getItem("pf_mobile_download_banner_dismissed") === "1";
  });

  useEffect(() => {
    setHidden(shouldUseNativeSafariBanner() || sessionStorage.getItem("pf_mobile_download_banner_dismissed") === "1");
  }, []);

  if (hidden) return null;

  const openAppStore = () => {
    analytics.track("Landing Mobile App Banner Click", { surface: "home_mobile_top" });
  };

  const dismiss = () => {
    sessionStorage.setItem("pf_mobile_download_banner_dismissed", "1");
    setHidden(true);
  };

  return (
    <div className="sticky top-0 z-[70] md:hidden border-b border-[#1d1d1f] bg-[#2f3033]/95 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[74px] w-full max-w-xl items-center gap-3 px-2.5 py-2">
        <button
          type="button"
          onClick={dismiss}
          className="grid h-8 w-5 shrink-0 place-items-center text-[#a9a9af] transition hover:text-white"
          aria-label="Dismiss app download banner"
        >
          <X className="h-[16px] w-[16px] stroke-[2.2]" />
        </button>
        <div className="grid h-[58px] w-[58px] shrink-0 place-items-center overflow-hidden rounded-[13px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.35)] ring-1 ring-white/20">
          <img
            src={APP_ICON_SRC}
            alt=""
            className="h-full w-full object-contain"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="min-w-0 flex-1 pb-[1px]">
          <div className="truncate text-[17px] font-semibold leading-[1.1] tracking-normal text-white">
            PestFlow
          </div>
          <div className="truncate text-[14px] font-normal leading-[1.25] tracking-normal text-[#d4d4da]">
            Business
          </div>
          <div className="truncate text-[13px] font-normal leading-[1.25] tracking-normal text-[#d4d4da]">
            Free - On the App Store
          </div>
        </div>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={openAppStore}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-[20px] bg-[#0a84ff] px-5 text-[15px] font-bold uppercase tracking-normal text-white shadow-[0_1px_2px_rgba(0,0,0,0.24)] transition hover:bg-[#1f8fff]"
          aria-label="Download Pest Flow from the App Store"
        >
          VIEW
        </a>
      </div>
    </div>
  );
}
