"use client";

import * as Primitive from "@radix-ui/react-switch";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Switch = forwardRef<
  React.ElementRef<typeof Primitive.Root>,
  React.ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    className={cn(
      "focus-ring inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-marine data-[state=unchecked]:bg-line-strong",
      className,
    )}
    {...props}
  >
    <Primitive.Thumb className="pointer-events-none block size-5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
  </Primitive.Root>
));
Switch.displayName = "Switch";
