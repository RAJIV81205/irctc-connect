"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Command } from "lucide-react";
import { sections } from "../app/docsData";

interface SearchCommandProps {
  onNavigate: (sectionId: string) => void;
}

export default function SearchCommand({ onNavigate }: SearchCommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isMac =
    typeof navigator !== "undefined" &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    setSelectedIndex(0);
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => {
          const next = !open;
          if (!next) {
            setSearchQuery("");
            setSelectedIndex(0);
          }
          return next;
        });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredSections = sections.filter((section) =>
    section.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = useCallback(
    (sectionId: string) => {
      onNavigate(sectionId);
      closeSearch();
    },
    [onNavigate, closeSearch],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSections.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && filteredSections[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredSections[selectedIndex].id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredSections, selectedIndex, handleSelect, closeSearch]);

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={openSearch}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline mr-10">Search docs...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-400">
          {isMac ? (
            <>
              <Command className="w-3 h-3" />K
            </>
          ) : (
            "Ctrl+K"
          )}
        </kbd>
      </button>

      {/* Mobile Search Icon */}
      <button
        onClick={openSearch}
        className="sm:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-slate-400" />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
          onClick={closeSearch}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Search Dialog */}
          <div
            className="relative w-full max-w-2xl bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 outline-none text-lg"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono text-slate-400 bg-slate-950 border border-slate-700 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredSections.length > 0 ? (
                <div className="p-2">
                  {filteredSections.map((section, index) => {
                    const IconComponent = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSelect(section.id)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          index === selectedIndex
                            ? "bg-blue-900/30 text-blue-400"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <IconComponent className="w-5 h-5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium">{section.label}</div>
                          <div className="text-xs text-slate-500">
                            Jump to {section.label.toLowerCase()} section
                          </div>
                        </div>
                        {index === selectedIndex && (
                          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono text-slate-400 bg-slate-950 border border-slate-700 rounded">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No results found for &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="hidden sm:flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-950 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded">
                    ↓
                  </kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded">
                    ↵
                  </kbd>
                  to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded">
                  ESC
                </kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
