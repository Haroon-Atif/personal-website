"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

/**
 * Interactive terminal prompt in the nav bar. Type shell-style commands to move
 * around the site:
 *
 *   cd ~/blog      cd projects      cd ..      cd ~      ls      pwd      help
 *
 * `directories` is the set of navigable paths (top-level routes + blog topics),
 * computed server-side and passed in so `cd` can report "no such directory".
 */
export function NavPrompt({
  directories,
  pathname,
}: {
  directories: string[];
  pathname: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Current working directory, e.g. "/" -> "~", "/blog" -> "~/blog".
  const cwd = pathname.replace(/\/+$/, "") || "/";
  const display = cwd === "/" ? "~" : `~${cwd}`;

  // Auto-dismiss transient output.
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  // Resolve a `cd` argument against the current directory into an absolute path.
  function resolve(arg: string): string {
    if (!arg || arg === "~") return "/";
    let target: string;
    if (arg.startsWith("~")) {
      const rest = arg.slice(1);
      target = rest.startsWith("/") ? rest : `/${rest}`;
    } else if (arg.startsWith("/")) {
      target = arg;
    } else {
      target = cwd === "/" ? `/${arg}` : `${cwd}/${arg}`;
    }
    const stack: string[] = [];
    for (const part of target.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") stack.pop();
      else stack.push(part);
    }
    const resolved = `/${stack.join("/")}`;
    // Treat ~/home as an alias for the site root.
    return resolved === "/home" ? "/" : resolved;
  }

  function run(raw: string) {
    const input = raw.trim();
    if (!input) return;
    const [cmd, ...rest] = input.split(/\s+/);
    const arg = rest.join(" ");

    switch (cmd) {
      case "cd": {
        const dest = resolve(arg);
        if (directories.includes(dest)) {
          setValue("");
          setMsg(null);
          router.push(dest);
        } else {
          setMsg({ text: `cd: no such directory: ${arg || "~"}`, error: true });
        }
        break;
      }
      case "ls": {
        const top = directories
          .filter((d) => d.split("/").filter(Boolean).length <= 1)
          .map((d) => (d === "/" ? "home" : d.replace(/^\//, "")));
        setMsg({ text: top.join("   "), error: false });
        break;
      }
      case "pwd":
        setMsg({ text: display, error: false });
        break;
      case "help":
        setMsg({
          text: "commands: cd <dir> · ls · pwd · clear   (try: cd ~/blog, cd ..)",
          error: false,
        });
        break;
      case "clear":
        setValue("");
        setMsg(null);
        break;
      default:
        setMsg({ text: `command not found: ${cmd}`, error: true });
    }
  }

  return (
    <div className="relative font-mono text-sm">
      <div
        className="flex items-center"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Username links home; the path + input are the interactive shell. */}
        <Link
          href="/"
          onClick={(e) => e.stopPropagation()}
          className="text-accent hover:glow"
        >
          {site.handle}@dev
        </Link>
        <span className="text-faint">:</span>
        <span className="max-w-[40vw] truncate text-cyan sm:max-w-xs">
          {display}
        </span>
        <span className="text-faint">$&nbsp;</span>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (msg) setMsg(null);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") run(value);
            else if (e.key === "Escape") {
              setValue("");
              inputRef.current?.blur();
            }
          }}
          aria-label="Terminal navigation: type a command like cd ~/blog"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          size={Math.max(value.length, 1)}
          style={{ caretColor: "var(--accent-bright)" }}
          className="bg-transparent text-accent-bright caret-accent-bright outline-none"
        />
        {/* Idle block cursor when the shell isn't focused. */}
        {!focused && value === "" ? (
          <span className="cursor -ml-1.5 align-middle" aria-hidden />
        ) : null}
      </div>

      {/* Transient command output / errors. */}
      {msg ? (
        <p
          className={`absolute top-full left-0 mt-1 max-w-[80vw] truncate text-xs ${
            msg.error ? "text-red" : "text-muted"
          }`}
        >
          {msg.text}
        </p>
      ) : null}
    </div>
  );
}
