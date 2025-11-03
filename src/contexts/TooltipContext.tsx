import React, { createContext, useContext, useEffect, useState } from "react";

interface TooltipContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState<boolean>(localStorage.getItem("enableTooltips") === "true");

  useEffect(() => {
    localStorage.setItem("enableTooltips", String(enabled));
  }, [enabled]);

  return <TooltipContext.Provider value={{ enabled, setEnabled }}>{children}</TooltipContext.Provider>;
};

export function useTooltips() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("useTooltips must be used within TooltipProvider");
  return ctx;
}
