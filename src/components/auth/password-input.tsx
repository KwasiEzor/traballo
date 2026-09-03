"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface PasswordInputProps {
  id: string;
  name: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}

export function PasswordInput({
  id,
  name,
  required = true,
  minLength,
  autoComplete,
  placeholder = "••••••••",
  className,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cn("pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
