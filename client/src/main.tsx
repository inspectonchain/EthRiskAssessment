import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handlers to prevent runtime errors
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.warn('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
