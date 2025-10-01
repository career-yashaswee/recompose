"use client";

import { useCallback, useMemo, useTransition } from "react";
import { Check, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type LocaleOption = {
  code: "en" | "hi" | "pa";
  label: string;
  flag: string;
};

export function LanguageSwitcher(): React.ReactElement {
  const { i18n } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const options: LocaleOption[] = useMemo(
    () => [
      { code: "en", label: "English", flag: "🇬🇧" },
      { code: "hi", label: "हिंदी", flag: "🇮🇳" },
      { code: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
    ],
    []
  );

  const handleChange = useCallback(
    (code: LocaleOption["code"]) => {
      if (code === i18n.language) return;
      startTransition(() => {
        void i18n.changeLanguage(code);
      });
    },
    [i18n]
  );

  const current = i18n.language as LocaleOption["code"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          <Globe className="h-4 w-4" />
          {options.find((o) => o.code === current)?.label ?? "Language"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{i18n.t("language.label")}</DropdownMenuLabel>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.code}
            onClick={() => handleChange(opt.code)}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{opt.flag}</span>
              <span className="flex-1">{opt.label}</span>
              {current === opt.code ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : null}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
