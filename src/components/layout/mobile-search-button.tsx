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
      className="md:hidden fixed top-3 right-4 z-40 h-9 w-9 rounded-full bg-background/80 backdrop-blur border border-border shadow-sm"
      aria-label="Search"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
}
