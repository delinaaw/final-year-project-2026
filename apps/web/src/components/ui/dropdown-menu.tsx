"use client";

import * as Primitive from "@radix-ui/react-dropdown-menu";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;

export const DropdownMenuContent = forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[212px] overflow-hidden rounded-[14px] border border-line bg-surface-card py-2 shadow-[0_8px_12px_0_rgb(1_3_62_/_0.08)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    />
  </Primitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  React.ComponentPropsWithoutRef<typeof Primitive.Item> & { destructive?: boolean }
>(({ className, destructive, ...props }, ref) => (
  <Primitive.Item
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center gap-3 px-3.5 py-2.5 text-body-m outline-none transition-colors data-[highlighted]:bg-surface-subtle",
      destructive ? "text-feedback-error" : "text-content-primary",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export function DropdownMenuSeparator() {
  return (
    <div className="px-3 py-1.5">
      <div className="h-px w-full bg-line" />
    </div>
  );
}
