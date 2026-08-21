"use client";

import type { ReactNode } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  title: string;

  children: ReactNode;

  footer?: ReactNode;

  size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export default function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-50 w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl ${sizes[size]}`}
        >
          <div className="flex items-center justify-between border-b p-6">
            <Dialog.Title className="text-xl font-semibold text-[#0B1423]">
              {title}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                className="rounded-lg p-2 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-6">
            {children}
          </div>

          {footer && (
            <div className="flex justify-end gap-3 border-t p-6">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}