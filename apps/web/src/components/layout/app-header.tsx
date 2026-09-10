"use client";

import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/ui/logo";
import { useLogout, useSession } from "@/hooks/use-session";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppHeader() {
  const { data: user } = useSession();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface-card">
      <div className="flex h-[72px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/forms" className="focus-ring rounded">
          <Logo tone="marine" />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/help"
            aria-label="Help and settings"
            className="focus-ring flex size-10 items-center justify-center rounded-lg text-content-secondary transition-colors hover:bg-surface-subtle"
          >
            <Settings className="size-5" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account menu"
              className="focus-ring flex size-9 items-center justify-center rounded-full bg-brand text-body-s font-semibold text-content-inverse"
            >
              {user ? initials(user.full_name) : <User className="size-4" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <div className="flex flex-col gap-0.5 px-3.5 pb-2 pt-1">
                  <span className="truncate text-body-m font-semibold text-content-primary">
                    {user.full_name}
                  </span>
                  <span className="truncate text-[12px] text-content-secondary">
                    {user.email}
                  </span>
                </div>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => logout.mutate()}>
                <LogOut className="size-[18px]" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
