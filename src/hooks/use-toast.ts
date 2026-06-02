import { useState, useCallback } from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export interface ToastState extends ToastOptions {
  id: string;
  visible: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 4000 }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);

    setToasts((prev) => [...prev, { id, title, description, variant, duration, visible: true }]);

    // Remove a notificação automaticamente após o tempo de duração esgotar
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      );
      
      // Limpa totalmente do estado após a animação de fade-out acabar
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  return {
    toast,
    toasts,
  };
}
