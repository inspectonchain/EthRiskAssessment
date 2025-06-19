import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handlers to prevent runtime errors
window.addEventListener('unhandledrejection', (event) => {
  // Filter out plugin connection errors
  if (event.reason && typeof event.reason === 'object' && 
      event.reason.message && event.reason.message.includes('Could not establish connection')) {
    event.preventDefault();
    return;
  }
  console.warn('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  // Filter out plugin connection errors
  if (event.error && event.error.message && 
      event.error.message.includes('Could not establish connection')) {
    return;
  }
  console.warn('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
