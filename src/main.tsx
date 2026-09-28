import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// ?gallery : 자체 제작 그림 모음 (따로 받는 조각이라 놀이 화면에는 영향 없음)
const Gallery = lazy(() => import("./dev/Gallery"));
const showGallery = new URLSearchParams(window.location.search).has("gallery");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {showGallery ? (
      <Suspense fallback={null}>
        <Gallery />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
