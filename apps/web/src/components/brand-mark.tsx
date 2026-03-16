import { LogoIcon } from "@/components/logo-icon";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  iconClassName?: string;
};

export function BrandMark({ className, iconClassName }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center isolate",
        className
      )}
    >
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(85,196,138,0.24),rgba(85,196,138,0.12)_38%,rgba(20,33,61,0.08)_68%,transparent_100%)] blur-md dark:bg-none" />
      <LogoIcon
        className={cn(
          "relative h-[88%] w-[88%] drop-shadow-[0_10px_18px_rgba(20,33,61,0.18)] dark:drop-shadow-none",
          iconClassName
        )}
      />
    </span>
  );
}