import { useState } from "react";
import { ToastContext } from "../context";
import { AutoToast } from "../AutoToast";

export function ToastProvider({ children }) {
  const [toastContent, popToast] = useState(null);

  const error = toastContent?.error || false,
    text = toastContent?.text || toastContent;

  // remove
  const onDismiss = () => popToast("");

  return (
    <ToastContext.Provider value={{ popToast }}>
      {children}
      <AutoToast error={error} content={text} onDismiss={onDismiss} />
    </ToastContext.Provider>
  );
}
