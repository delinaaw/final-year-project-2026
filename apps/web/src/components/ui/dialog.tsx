"use client";

import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;

export const DialogContent = forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Overlay className="fixed inset-0 z-50 bg-content-primary/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
    <Primitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-[540px] -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-2xl border border-line bg-surface-card p-6 shadow-[0_8px_24px_0_rgb(1_3_62_/_0.12)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:p-7",
        className,
      )}
      {...props}
    >
      {children}
      {hideClose ? null : (
        <Primitive.Close className="focus-ring absolute right-5 top-5 rounded-lg p-1 text-content-secondary transition-colors hover:bg-surface-subtle">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </Primitive.Close>
      )}
    </Primitive.Content>
  </Primitive.Portal>
));
DialogContent.displayName = "DialogContent";

export function DialogHeader({
  title,
  description,
}: {
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 pr-8">
      <Primitive.Title className="text-[22px] font-bold leading-7 text-content-primary">
        {title}
      </Primitive.Title>
      {description ? (
        <Primitive.Description className="text-body-m leading-6 text-content-secondary">
          {description}
        </Primitive.Description>
      ) : null}
    </div>
  );
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{children}</div>;
}
