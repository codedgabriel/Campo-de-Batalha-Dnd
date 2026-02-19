import { useEffect, useState } from "react";

/**
 * useLockLandscape
 *
 * Tenta travar a orientação em landscape via Screen Orientation API.
 * Retorna `isPortrait` para que o app mostre um overlay de aviso
 * quando a API não conseguir travar (iOS Safari, por exemplo).
 */
export function useLockLandscape() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    // Tenta travar via API (funciona no Android Chrome / PWA instalado)
    async function lockOrientation() {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock("landscape");
        }
      } catch {
        // API não disponível (iOS Safari, desktop) — usamos o overlay
      }
    }

    lockOrientation();

    // Monitora a orientação atual para mostrar o overlay quando necessário
    function checkOrientation() {
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      setIsPortrait(portrait);
    }

    checkOrientation();

    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", checkOrientation);

    return () => {
      mq.removeEventListener("change", checkOrientation);
      // Libera o lock ao desmontar (opcional)
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch {
        // ignora
      }
    };
  }, []);

  return { isPortrait };
}
