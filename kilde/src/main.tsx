
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { ThemeToggle } from "./app/components/ThemeToggle";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<><App /><ThemeToggle /></>);
  