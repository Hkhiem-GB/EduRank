"use client";

import React, { useState, useRef, useEffect } from "react";
import { Icons } from "./Icons";

export interface CustomSelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  label?: string;
  id?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  size = "md",
  disabled = false,
  label,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses =
    size === "sm"
      ? "py-1 px-2.5 sm:py-1.5 sm:px-3 text-[11px] sm:text-xs rounded-lg sm:rounded-xl"
      : "py-1.5 px-2.5 sm:py-2 sm:px-3 text-xs sm:text-sm rounded-lg sm:rounded-xl";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 font-semibold flex items-center justify-between gap-1.5 sm:gap-2.5 transition-all duration-150 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${sizeClasses} ${
          isOpen ? "ring-2 ring-blue-500/40 border-blue-500 bg-white" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="ml-1">{selectedOption.badge}</span>
          )}
        </div>

        <Icons.ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 w-max min-w-full max-w-xs sm:max-w-md bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 max-h-64 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150 ${dropdownClassName}`}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-slate-400 text-center">
              Không có lựa chọn nào
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = String(opt.value) === String(value);

              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-medium flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/90 text-blue-700 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && <span className="ml-1">{opt.badge}</span>}
                  </div>

                  {isSelected && (
                    <Icons.Check className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
