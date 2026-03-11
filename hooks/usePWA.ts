import { useState, useEffect } from "react";

export const usePWA = (isStandaloneInit: boolean = false) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(isStandaloneInit);

  useEffect(() => {
    const handler = (e: any) => {
      console.log("PWA: beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Show custom prompt after a delay if not standalone
    const timer = setTimeout(() => {
      if (!isStandalone) {
        setShowInstallPrompt(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, [isStandalone]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const closeInstallPrompt = () => setShowInstallPrompt(false);

  return {
    showInstallPrompt,
    isStandalone,
    deferredPrompt,
    handleInstallApp,
    closeInstallPrompt
  };
};
