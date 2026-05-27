import { createRoot } from 'react-dom/client'
import './css/base/index.css'
import './css/base/design-tokens.css'
import App from './App.jsx'

function mountCursorGlow() {
    if (typeof window === "undefined") {
        return;
    }

    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
        return;
    }

    if (document.querySelector('.cursor-glow[data-owner="global-cursor"]')) {
        return;
    }

    const layer = document.createElement("div");
    layer.className = "cursor-glow";
    layer.setAttribute("aria-hidden", "true");
    layer.setAttribute("data-owner", "global-cursor");
    layer.innerHTML = `
        <div class="cursor-glow__tracker">
            <div class="cursor-glow__orb"></div>
            <div class="cursor-glow__core"></div>
        </div>
    `;

    document.body.appendChild(layer);

    const tracker = layer.querySelector(".cursor-glow__tracker");

    if (!tracker) {
        return;
    }

    const setPosition = (nextX, nextY) => {
        tracker.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
    };

    const handleMove = (event) => {
        setPosition(event.clientX, event.clientY);
    };

    setPosition(window.innerWidth / 2, window.innerHeight / 2);

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("mousemove", handleMove, { passive: true });
}

mountCursorGlow();

createRoot(document.getElementById('root')).render(
    
    <App />
)
