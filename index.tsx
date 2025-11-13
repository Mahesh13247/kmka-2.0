import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
document.addEventListener("contextmenu", (event) => event.preventDefault());

const isCtrlShiftKey = (event: KeyboardEvent, key: string) =>
  event.ctrlKey && event.shiftKey && event.key.toUpperCase() === key.toUpperCase();

document.addEventListener("keydown", (event) => {
  // Disable F12, Ctrl + Shift + I/J/C, Ctrl + U
  const isDisallowed =
    event.key === "F12" ||
    isCtrlShiftKey(event, "I") ||
    isCtrlShiftKey(event, "J") ||
    isCtrlShiftKey(event, "C") ||
    (event.ctrlKey && event.key.toUpperCase() === "U");

  if (isDisallowed) {
    event.preventDefault();
  }
});
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
