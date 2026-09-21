import { Dialog as D } from 'radix-ui';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <D.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <D.Portal>
        <D.Overlay className="dialog-overlay" />
        <D.Content
          className={`dialog-content ${wide ? 'wide' : ''}`}
          aria-describedby={description ? 'dialog-desc' : undefined}
        >
          <div className="dialog-head">
            <div>
              <D.Title>{title}</D.Title>
              {description && <D.Description id="dialog-desc">{description}</D.Description>}
            </div>
            <D.Close className="icon-button" aria-label="Cerrar ventana">
              <X size={20} />
            </D.Close>
          </div>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
