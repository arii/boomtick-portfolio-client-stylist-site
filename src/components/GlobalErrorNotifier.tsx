import React, { useEffect, useState } from "react";
import { AlertCircle, X, RefreshCw } from "lucide-react";

interface ElevatedError {
  id: number;
  message: string;
  source?: string;
}

export const GlobalErrorNotifier: React.FC = () => {
  const [errors, setErrors] = useState<ElevatedError[]>([]);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Avoid noise from cross-origin browser extensions
      if (!event.message || event.message.includes("ResizeObserver")) return;
      const newErr: ElevatedError = {
        id: Date.now() + Math.random(),
        message: event.message,
        source: event.filename
          ? `${event.filename}:${event.lineno}`
          : undefined,
      };
      setErrors((prev) => [...prev.slice(-2), newErr]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg =
        typeof reason === "string"
          ? reason
          : reason?.message || "Unhandled asynchronous rejection";
      const newErr: ElevatedError = {
        id: Date.now() + Math.random(),
        message: msg,
      };
      setErrors((prev) => [...prev.slice(-2), newErr]);
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {errors.map((err) => (
        <div
          key={err.id}
          className="pointer-events-auto bg-stone-950/95 border border-red-500/80 text-stone-100 p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-start gap-3 animate-fade-in"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-0.5">
              Elevated Runtime Warning
            </span>
            <p className="text-xs text-stone-200 font-mono break-words leading-snug">
              {err.message}
            </p>
            {err.source && (
              <span className="text-[10px] text-stone-500 font-mono block mt-1 truncate">
                {err.source}
              </span>
            )}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload</span>
              </button>
            </div>
          </div>
          <button
            onClick={() =>
              setErrors((prev) => prev.filter((e) => e.id !== err.id))
            }
            className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer rounded"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
