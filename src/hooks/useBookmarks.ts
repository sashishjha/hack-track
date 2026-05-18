import { useEffect, useState } from 'react';

const STORAGE_KEY = 'hacktrack-bookmarks';

function readBookmarks(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(readBookmarks);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (id: string) => {
    setBookmarks(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmarkId => bookmarkId !== id));
  };

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => (prev.includes(id) ? prev.filter(bookmarkId => bookmarkId !== id) : [...prev, id]));
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  return { bookmarks, addBookmark, removeBookmark, toggleBookmark, isBookmarked };
}
