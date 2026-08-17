import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { analytics } from "@/lib/analytics";
import {
  buildAppStoreSuccessPath,
  createAppStoreHandoffEventId,
} from "@/lib/appStoreHandoff";
import { captureMarketingAttribution } from "@/lib/marketingAttribution";

const APP_ICON_SRC = "/assets/pestflow-app-store-icon.jpg";

export function MobileDownloadBanner() {
  const [handoffUrl, setHandoffUrl] = useState("/signup-success?handoff=app_store&source=home_mobile_top");
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("pf_mobile_download_banner_dismissed") === "1";
  });

  useEffect(() => {
    setHidden(sessionStorage.getItem("pf_mobile_download_banner_dismissed") === "1");
    const attribution = captureMarketingAttribution(
      new URLSearchParams(window.location.search),
      new URLSearchParams(window.location.hash.split("?")[1]),
    );
    setHandoffUrl(buildAppStoreSuccessPath(
      attribution,
      createAppStoreHandoffEventId(),
    ));
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
          className="grid h-8 w-8 shrink-0 place-items-center text-[#d4d4da] transition hover:text-white"
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
          href={handoffUrl}
          onClick={openAppStore}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-[20px] bg-[#0066cc] px-5 text-[15px] font-bold uppercase tracking-normal text-white shadow-[0_1px_2px_rgba(0,0,0,0.24)] transition hover:bg-[#005bb8]"
          aria-label="Download Pest Flow from the App Store"
        >
          VIEW
        </a>
      </div>
    </div>
  );
}
