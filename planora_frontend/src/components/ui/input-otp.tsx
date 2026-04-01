"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

interface InputOtpProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export function InputOtp({
  length = 6,
  value,
  onChange,
}: InputOtpProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  useEffect(() => {
    inputRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  const focusIndex = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, length - 1));
    setActiveIndex(boundedIndex);
  };

  const updateDigit = (index: number, nextDigit: string) => {
    const nextValue = digits.map((digit, digitIndex) =>
      digitIndex === index ? nextDigit : digit
    );

    onChange(nextValue.join(""));
  };

  const handleChange = (index: number, nextValue: string) => {
    const cleaned = nextValue.replace(/\D/g, "");

    if (!cleaned) {
      updateDigit(index, "");
      return;
    }

    const nextDigits = [...digits];

    cleaned.slice(0, length - index).split("").forEach((digit, offset) => {
      nextDigits[index + offset] = digit;
    });

    onChange(nextDigits.join(""));
    focusIndex(Math.min(index + cleaned.length, length - 1));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      updateDigit(index - 1, "");
      focusIndex(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);

    if (!pasted) {
      return;
    }

    onChange(pasted.padEnd(length, ""));
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={() => setActiveIndex(index)}
          onPaste={handlePaste}
          className={cn(
            "h-14 w-12 rounded-2xl border border-[var(--color-border)] bg-white text-center text-xl font-semibold text-[var(--color-surface-950)] shadow-[0_12px_35px_rgba(15,23,42,0.06)] outline-none transition focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-100)] sm:h-16 sm:w-14"
          )}
        />
      ))}
    </div>
  );
}
