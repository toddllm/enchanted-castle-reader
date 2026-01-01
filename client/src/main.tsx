import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const redirectPath = sessionStorage.getItem("redirect");
if (redirectPath) {
  sessionStorage.removeItem("redirect");
  window.history.replaceState(null, "", redirectPath);
}

createRoot(document.getElementById("root")!).render(<App />);
