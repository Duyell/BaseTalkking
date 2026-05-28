import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ConfirmCtx {
  showConfirm: (message: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmCtx>({ showConfirm: async () => false });

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    message: string;
    resolve: (v: boolean) => void;
  } | null>(null);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ message, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (state) {
      state.resolve(result);
      setState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {state && <ConfirmDialog message={state.message} onClose={handleClose} />}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ message, onClose }: { message: string; onClose: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onClose(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'modalFadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-white)',
          borderRadius: 8,
          padding: '24px 28px',
          minWidth: 340,
          maxWidth: 400,
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          animation: 'modalSlideIn 0.25s ease',
        }}
      >
        <p style={{ fontSize: 15, color: 'var(--color-text)', lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button
            onClick={() => onClose(false)}
            style={{
              padding: '7px 28px', borderRadius: 4, fontSize: 14,
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-white)',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={() => onClose(true)}
            style={{
              padding: '7px 28px', borderRadius: 4, fontSize: 14,
              border: 'none',
              background: 'var(--color-error)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
