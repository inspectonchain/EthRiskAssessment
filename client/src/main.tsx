import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Override console methods to filter out browser extension errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('Could not establish connection') ||
      message.includes('Receiving end does not exist') ||
      message.includes('Extension context invalidated') ||
      message.includes('runtime.lastError')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('Could not establish connection') ||
      message.includes('Receiving end does not exist') ||
      message.includes('Extension context invalidated') ||
      message.includes('runtime.lastError')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Suppress unhandled rejection errors for browser extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'object') {
    const message = event.reason.message || '';
    if (message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('Extension context invalidated')) {
      event.preventDefault();
      return;
    }
  }
  // Only log actual application errors
  if (event.reason && !event.reason.message?.includes('runtime.lastError')) {
    console.warn('Unhandled promise rejection:', event.reason);
  }
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  if (event.error && event.error.message) {
    const message = event.error.message;
    if (message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('Extension context invalidated') ||
        message.includes('runtime.lastError')) {
      return;
    }
  }
  console.warn('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
