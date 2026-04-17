const NAME_KEYS = ["spinWheelNames", "wheelNames", "names", "participants"];
const WINNER_KEY = "winner";

const wheelCanvas = document.getElementById("wheelCanvas");
const spinBtn = document.getElementById("spinBtn");
const statusEl = document.getElementById("status");

const ctx = wheelCanvas.getContext("2d");
const center = wheelCanvas.width / 2;
const radius = center - 12;

let names = [];
let rotation = 0;
let isSpinning = false;

function parseNameString(raw) {
    return raw
        .split(/\r?\n|,/)
        .map((part) => part.trim())
        .filter(Boolean);
}

function readNamesFromStorage() {
    for (const key of NAME_KEYS) {
        const raw = localStorage.getItem(key);
        if (!raw) {
            continue;
        }

        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                const normalized = parsed.map((item) => String(item).trim()).filter(Boolean);
                if (normalized.length > 0) {
                    return normalized;
                }
            }
        } catch (_err) {
            const normalized = parseNameString(raw);
            if (normalized.length > 0) {
                return normalized;
            }
        }
    }

    return [];
}

function colorFor(index, total) {
    const hue = Math.round((index * 360) / Math.max(1, total));
    return `hsl(${hue} 64% 57%)`;
}

function drawWheelSegments() {
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    if (names.length === 0) {
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#e2e8ee";
        ctx.fill();

        ctx.fillStyle = "#1f2937";
        ctx.font = "700 22px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText("No names found", center, center);
        return;
    }

    const arc = (Math.PI * 2) / names.length;

    for (let i = 0; i < names.length; i += 1) {
        const start = i * arc;
        const end = start + arc;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = colorFor(i, names.length);
        ctx.fill();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#111827";
        ctx.font = "700 18px Segoe UI";
        const label = names[i].length > 14 ? `${names[i].slice(0, 13)}...` : names[i];
        ctx.fillText(label, radius - 18, 6);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(center, center, 56, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#d7e0e5";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function calculateWinner(finalRotationDeg) {
    const normalized = ((finalRotationDeg % 360) + 360) % 360;
    const pointerAngle = (360 - normalized + 270) % 360;
    const slice = 360 / names.length;
    const index = Math.floor(pointerAngle / slice) % names.length;
    return names[index];
}

function spinWheel() {
    if (isSpinning || names.length < 2) {
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    statusEl.textContent = "Spinning...";

    const extraSpins = 7 + Math.floor(Math.random() * 4);
    const randomOffset = Math.random() * 360;
    rotation += extraSpins * 360 + randomOffset;

    wheelCanvas.style.transform = `rotate(${rotation}deg)`;
}

wheelCanvas.addEventListener("transitionend", () => {
    if (!isSpinning || names.length === 0) {
        return;
    }

    const winner = calculateWinner(rotation);
    localStorage.setItem(WINNER_KEY, winner);
    statusEl.textContent = `Winner: ${winner}`;
    isSpinning = false;

    window.location.href = "output.html";
});

spinBtn.addEventListener("click", spinWheel);

function init() {
    names = readNamesFromStorage();
    drawWheelSegments();

    if (names.length < 2) {
        spinBtn.disabled = true;
        statusEl.textContent = "Need at least 2 names in localStorage key spinWheelNames to spin.";
    }
}

init();
