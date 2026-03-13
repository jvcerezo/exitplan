"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileSearchButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      data-tour="sidebar-search"
      onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      className="md:hidden fixed top-[calc(env(safe-area-inset-top)+1.4rem)] right-[calc(env(safe-area-inset-right)+0.75rem)] z-40 h-10 w-10 rounded-full bg-background/85 backdrop-blur border border-border shadow-sm"
      aria-label="Search"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
}
