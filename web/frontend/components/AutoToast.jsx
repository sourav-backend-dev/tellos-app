import { Toast } from "@shopify/polaris";
import { useEffect, useState } from "react";

export const AutoToast = (props) => {
  const { onDismiss, content } = props;
  const [active, setActive] = useState(false);

  if (content && typeof content !== "string") {
    throw new Error("toast content only string type");
  }

  useEffect(() => {
    if (content && content.length > 0) {
      setActive(true);
    }
  }, [content]);

  const toggleActive = () => {
    setActive((active) => !active);
    typeof onDismiss === "function" && onDismiss();
  };

  if (!active) return null;

  return <Toast {...props} onDismiss={toggleActive} />;
};
