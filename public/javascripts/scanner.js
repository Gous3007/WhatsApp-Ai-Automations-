const socket = io();
const qrBox = document.getElementById("qrBox");
const statusBadge = document.getElementById("statusBadge");
const scanStep = document.getElementById("scanStep");
const connectStep = document.getElementById("connectStep");

socket.on("qr", (qrImage) => {
    qrBox.innerHTML = `<img src="${qrImage}" width="250" alt="WhatsApp QR Code"/>`;
    statusBadge.innerHTML = `
                <i class="fas fa-qrcode"></i>
                QR Code Ready - Scan Now!
            `;
    statusBadge.className = "status-badge";

    // Activate scan step
    scanStep.classList.add("active");
});

socket.on("connected", () => {
    statusBadge.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Connected Successfully!
            `;
    statusBadge.className = "status-badge connected-badge";

    // Activate connect step
    connectStep.classList.add("active");

    // Add success animation
    qrBox.style.transform = "scale(1.05)";
    qrBox.style.background = "#f0fff4";
    qrBox.style.borderColor = "#25D366";

    // Redirect after animation
    setTimeout(() => {
        window.location.href = "/send";
    }, 1500);
});

// Add some interactive feedback
document.addEventListener("DOMContentLoaded", function () {
    // Add hover effect to QR container
    qrBox.addEventListener("mouseenter", function () {
        if (qrBox.querySelector("img")) {
            qrBox.style.transform = "translateY(-5px)";
            qrBox.style.boxShadow = "0 15px 30px rgba(0, 0, 0, 0.1)";
        }
    });

    qrBox.addEventListener("mouseleave", function () {
        qrBox.style.transform = "translateY(0)";
        qrBox.style.boxShadow = "none";
    });
});