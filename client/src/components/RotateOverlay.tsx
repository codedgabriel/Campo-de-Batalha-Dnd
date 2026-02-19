// Exibido sobre tudo quando o device está em portrait
// e a Screen Orientation API não conseguiu travar automaticamente

export function RotateOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
      }}
    >
      {/* Ícone animado de rotação */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#b48a3c"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: "spin-once 1.2s ease-in-out infinite alternate" }}
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 17h6" />
        <path d="M8.5 7.5A4 4 0 0 1 12 6a4 4 0 0 1 3.5 1.5" />
        <path d="M15.5 7.5L17 6l-1.5 2" />
      </svg>

      <style>{`
        @keyframes spin-once {
          0%   { transform: rotate(0deg);   }
          100% { transform: rotate(-90deg); }
        }
      `}</style>

      <p
        style={{
          color: "#e8d9b5",
          fontSize: "1.2rem",
          fontFamily: "'Cinzel', serif",
          textAlign: "center",
          letterSpacing: "0.05em",
        }}
      >
        Gire o celular para o modo paisagem
      </p>

      <p
        style={{
          color: "#7a7a8a",
          fontSize: "0.85rem",
          fontFamily: "'Lato', sans-serif",
          textAlign: "center",
          maxWidth: "260px",
        }}
      >
        DM Battlefield foi feito para ser usado na horizontal
      </p>
    </div>
  );
}
