"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "exitplan_custom_categories";

interface CustomCategories {
  expense: string[];
  income: string[];
}

function load(): CustomCategories {
  if (typeof window === "undefined") return { expense: [], income: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { expense: [], income: [] };
    return JSON.parse(raw) as CustomCategories;
  } catch {
    return { expense: [], income: [] };
  }
}

function save(data: CustomCategories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Manage user-created custom categories that persist in localStorage.
 * These are merged with the built-in categories in the transaction dialog.
 */
export function useCustomCategories(type: "expense" | "income") {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const data = load();
    setCategories(data[type]);
  }, [type]);

  const addCategory = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const data = load();
      // Avoid duplicates (case-insensitive)
      if (data[type].some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;
      data[type].push(trimmed);
      save(data);
      setCategories([...data[type]]);
    },
    [type]
  );

  const removeCategory = useCallback(
    (name: string) => {
      const data = load();
      data[type] = data[type].filter((c) => c !== name);
      save(data);
      setCategories([...data[type]]);
    },
    [type]
  );

  return { customCategories: categories, addCategory, removeCategory };
}
