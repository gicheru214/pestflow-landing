import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
}: BrandLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {imageFailed ? (
        <ShieldCheck
          aria-hidden="true"
          className={cn("h-10 w-10 shrink-0 text-lime-500", iconClassName)}
        />
      ) : (
        <img
          src="/assets/pestflow-shield-transparent.png"
          alt=""
          aria-hidden="true"
          decoding="async"
          onError={() => setImageFailed(true)}
          className={cn("h-10 w-10 shrink-0 object-contain", iconClassName)}
        />
      )}
      <span
        className={cn(
          "font-heading text-2xl font-extrabold tracking-tight text-[#17300a]",
          textClassName,
        )}
      >
        PestFlow
      </span>
    </span>
  );
}
