import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initTikTokPixel } from "./lib/tiktokPixel";

initTikTokPixel(import.meta.env.VITE_TIKTOK_PIXEL_ID);

createRoot(document.getElementById("root")!).render(<App />);
