'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClass?: string;
}

// ponytail: Replaced hand-rolled overlay & Framer Motion with native HTML5 <dialog>
export default function Modal({ isOpen, onClose, title, icon, children, maxWidthClass = 'max-w-md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle ESC key natively & click backdrop to close
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={`w-full ${maxWidthClass} rounded-2xl border border-card-border bg-card p-6 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm focus:outline-none open:animate-in open:fade-in open:zoom-in-95 duration-200 text-foreground`}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-text-muted hover:text-foreground transition-colors cursor-pointer"
        aria-label="Close modal"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2.5 mb-4">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            {icon}
          </div>
        )}
        <h3 className="text-base font-bold">{title}</h3>
      </div>

      {children}
    </dialog>
  );
}
