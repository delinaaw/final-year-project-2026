"use client";

import * as Primitive from "@radix-ui/react-radio-group";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const RadioGroup = Primitive.Root;

export const RadioGroupItem = forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  React.ComponentPropsWithoutRef<typeof Primitive.Item>
>(({ className, ...props }, ref) => (
  <Primitive.Item
    ref={ref}
    className={cn(
      "focus-ring flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-surface-card",
      className,
    )}
    {...props}
  >
    <Primitive.Indicator className="size-3 rounded-full bg-brand" />
  </Primitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";
