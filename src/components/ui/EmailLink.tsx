"use client";

import { useState, type ReactNode } from "react";

/**
 * Email link that always *does something* when clicked. A bare `mailto:` link
 * silently does nothing on machines with no configured mail handler (a common
 * complaint), so on click we also copy the address to the clipboard and show a
 * brief "copied" confirmation. We do NOT preventDefault, so people who do have a
 * mail client still get a compose window as well.
 */
export function EmailLink({
  email,
  className = "",
  children,
}: {
  email: string;
  className?: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <a
      href={`mailto:${email}`}
      onClick={() => {
        navigator.clipboard
          ?.writeText(email)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {});
      }}
      className={className}
      title={`Email ${email} — also copies the address to your clipboard`}
    >
      {copied ? "copied ✓" : children}
    </a>
  );
}
