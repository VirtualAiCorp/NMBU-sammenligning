
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { TopRightControls } from "./app/components/TopRightControls";
  import "./styles/index.css";
  import { lastEmneUrlOppslag } from "./app/data/emneUrl";

  void lastEmneUrlOppslag();

  createRoot(document.getElementById("root")!).render(<><App /><TopRightControls /></>);
  