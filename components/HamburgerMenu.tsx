import React from "react";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

export default function HamburgerMenu({ isOpen, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: 44,
        height: 44,
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 6,
        cursor: "pointer",
        padding: 8,
        color: "#ddd"
      }}
    >
      <span
        style={{
          width: 20,
          height: 2,
          background: "#ddd",
          margin: "2px 0",
          transition: "all 0.3s ease",
          transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
          transformOrigin: "center"
        }}
      />
      <span
        style={{
          width: 20,
          height: 2,
          background: "#ddd",
          margin: "2px 0",
          transition: "all 0.3s ease",
          opacity: isOpen ? 0 : 1
        }}
      />
      <span
        style={{
          width: 20,
          height: 2,
          background: "#ddd",
          margin: "2px 0",
          transition: "all 0.3s ease",
          transform: isOpen ? "rotate(-45deg) translate(7px, -6px)" : "none",
          transformOrigin: "center"
        }}
      />
    </button>
  );
}
