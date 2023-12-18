"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type UseMessageRowProps = {
  speaker: "user" | "assistant";
  text?: string;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useMessageRow = ({ speaker, text }: UseMessageRowProps) => {
  const isUserSpeaker = speaker === "user";
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (text === undefined) {
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => setIsCopied(true),
      (err) => console.error("Failed to copy!", err)
    );
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  const containerClasses = cn(
    "py-3 px-5 w-fit",
    isUserSpeaker
      ? "bg-sky-200 dark:bg-neutral-400"
      : "bg-sky-700 text-white dark:bg-gray-600",
    "rounded-3xl flex flex-col overflow-hidden scroll-pb-32"
  );

  const containerWrapperClasses = cn(
    "flex flex-col",
    isUserSpeaker ? "items-end" : "items-start"
  );

  const markdownClasses = cn(
    "prose",
    "dark:prose-invert",
    isUserSpeaker ? "text-green-900 dark:text-slate-300" : "text-white"
  );

  return {
    isUserSpeaker,
    isCopied,
    handleCopy,
    containerClasses,
    containerWrapperClasses,
    markdownClasses,
  };
};
