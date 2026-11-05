import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiInbox, FiX } from "react-icons/fi";

// ---------- Avatar ----------
const PALETTE = ["#12a150", "#0e7490", "#7c3aed", "#c2410c", "#be185d", "#4d7c0f", "#1d4ed8"];

export const avatarUrl = (avatar) => {
  if (!avatar) return null;
  if (/^https?:\/\//.test(avatar)) return avatar;
  return `/${avatar.replace(/^\/+/, "")}`;
};

export function Avatar({ user, size = 36 }) {
  const [broken, setBroken] = useState(false);
  const src = avatarUrl(user?.avatar);
  const name = user?.name || user?.email || "?";
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = PALETTE[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
  const style = { width: size, height: size, fontSize: size * 0.38 };

  useEffect(() => setBroken(false), [src]);

  if (src && !broken) {
    return <img className="avatar" src={src} alt="" style={style} onError={() => setBroken(true)} />;
  }
  return (
    <div className="avatar" style={{ ...style, background: color }} aria-hidden="true">
      {initials}
    </div>
  );
}

export function Person({ user, sub }) {
  return (
    <div className="person">
      <Avatar user={user} />
      <div style={{ minWidth: 0 }}>
        <strong>{user?.name}</strong>
        <span>{sub ?? user?.email}</span>
      </div>
    </div>
  );
}

// ---------- small bits ----------
export const Spinner = ({ small }) => <span className={`spinner${small ? " sm" : ""}`} role="status" aria-label="Loading" />;

export const Loading = () => (
  <div className="center">
    <Spinner />
  </div>
);

export function Empty({ icon: Icon = FiInbox, title, children }) {
  return (
    <div className="empty">
      <Icon />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function ErrorAlert({ children }) {
  if (!children) return null;
  return (
    <div className="alert alert-error" role="alert">
      <FiAlertCircle />
      <span>{children}</span>
    </div>
  );
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

export function Stat({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="card stat">
      <div className={`stat-icon${tone ? ` ${tone}` : ""}`}>
        <Icon />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ---------- Modal ----------
export function Modal({ title, onClose, children, width }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={width ? { maxWidth: width } : undefined}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ title, message, confirmLabel = "Confirm", danger, busy, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="muted">{message}</p>
      <div className="modal-foot" style={{ marginTop: 22 }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} disabled={busy}>
          {busy && <Spinner small />} {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ---------- Toasts ----------
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
