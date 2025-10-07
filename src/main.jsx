// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UIProvider } from "./context";
import App from "./App.jsx";
import "./index.css";

// 👇 on importe notre détecteur de base
import { detectRouterBase } from "./routerBase.js";

// Détection automatique du bon basename
const BASENAME = detectRouterBase();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UIProvider>
      {/* Router configuré selon le contexte (dev/prod + langue) */}
      <BrowserRouter basename={BASENAME}>
        <App />
      </BrowserRouter>
    </UIProvider>
  </React.StrictMode>
);
