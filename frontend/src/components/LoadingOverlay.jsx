import React from "react";
import DotSpinner from "../loaders/Loader";

const LoadingOverlay = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(255,255,255,0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <DotSpinner />
  </div>
);

export default LoadingOverlay; 