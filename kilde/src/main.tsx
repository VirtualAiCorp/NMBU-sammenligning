
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { TopRightControls } from "./app/components/TopRightControls";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<><App /><TopRightControls /></>);
  