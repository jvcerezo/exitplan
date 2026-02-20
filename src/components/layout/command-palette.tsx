"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeftRight, Target, Calculator } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useGlobalSearch, type SearchResult } from "@/hooks/use-global-search";
import { cn } from "@/lib/utils";

const typeIcons = {
  transaction: ArrowLeftRight,
  goal: Target,
  budget: Calculator,
};

const typeLabels = {
  transaction: "Transactions",
  goal: "Goals",
  budget: "Budgets",
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [] } = useGlobalSearch(query);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const navigate = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      router.push(result.href);
    },
    [router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (i) => (i - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1)
      );
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex]);
    }
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    },
    {}
  );

  let flatIndex = 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[20%] left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 sm:max-w-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <div className="rounded-xl border bg-background shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search transactions, goals, budgets..."
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto p-1">
              {query.length < 2 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Type to search...
                </p>
              ) : results.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No results found.
                </p>
              ) : (
                Object.entries(grouped).map(([type, items]) => {
                  const Icon = typeIcons[type as keyof typeof typeIcons];
                  return (
                    <div key={type} className="mb-1 last:mb-0">
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        {typeLabels[type as keyof typeof typeLabels]}
                      </div>
                      {items.map((item) => {
                        const thisIndex = flatIndex++;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigate(item)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                              thisIndex === selectedIndex
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent/50"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium capitalize">
                                {item.title}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-medium">↑</kbd>
                  <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-medium">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-medium">↵</kbd>
                  <span className="ml-1">Open</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-medium sm:hidden">ESC</kbd>
                <span className="sm:hidden ml-1">Close</span>
              </span>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
