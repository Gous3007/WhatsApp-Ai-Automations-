const socket = io();
let isProcessing = false;
let totalMessages = 0;
let sentMessages = 0;
let failedMessages = 0;
let startTime = null;

// DOM Elements
const sendForm = document.getElementById("sendForm");
const sendButton = document.getElementById("sendButton");
const numbersTextarea = document.getElementById("numbers");
const messageTextarea = document.getElementById("message");
const messagePreview = document.getElementById("messagePreview");
const liveLog = document.getElementById("liveLog");

// Counter Elements
const numberCount = document.getElementById("numberCount");
const charCount = document.getElementById("charCount");
const previewCharCount = document.getElementById("previewCharCount");
const previewWordCount = document.getElementById("previewWordCount");
const previewLineCount = document.getElementById("previewLineCount");

// Tracking Elements
const trackingStatus = document.getElementById("trackingStatus");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const totalCount = document.getElementById("totalCount");
const queueCount = document.getElementById("queueCount");
const sentCount = document.getElementById("sentCount");
const failedCount = document.getElementById("failedCount");
const speedCount = document.getElementById("speedCount");

// Cards
const totalCard = document.getElementById("totalCard");
const queueCard = document.getElementById("queueCard");
const sentCard = document.getElementById("sentCard");
const failedCard = document.getElementById("failedCard");
const speedCard = document.getElementById("speedCard");

// Numbers counter and validation
numbersTextarea.addEventListener('input', function () {
    const numbers = this.value
        .split(/[\n,]+/)
        .map(n => n.trim())
        .filter(n => n);

    numberCount.textContent = numbers.length;
    totalCount.textContent = numbers.length;

    if (numbers.length > 0) {
        totalCard.classList.add('active');
        queueCount.textContent = numbers.length;
        queueCard.classList.add('active');
    } else {
        totalCard.classList.remove('active');
        queueCard.classList.remove('active');
    }
});

// Message counter and preview
messageTextarea.addEventListener('input', function () {
    const message = this.value;
    const charLength = message.length;
    const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;
    const lineCount = message.split('\n').length;

    // Update counters
    charCount.textContent = charLength;
    previewCharCount.textContent = charLength;
    previewWordCount.textContent = wordCount;
    previewLineCount.textContent = lineCount;

    // Update preview
    if (message.trim()) {
        messagePreview.textContent = message;
        messagePreview.classList.remove('preview-empty');
    } else {
        messagePreview.innerHTML = '<div class="preview-empty">Your message will appear here as you type...</div>';
        messagePreview.classList.add('preview-empty');
    }
});

// Form submission
sendForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isProcessing) return;

    const numbers = numbersTextarea.value
        .split(/[\n,]+/)
        .map(n => n.trim())
        .filter(n => n);
    const message = messageTextarea.value;

    if (numbers.length === 0 || !message.trim()) {
        addLogEntry('❌ Please enter both numbers and message', 'error');
        return;
    }

    startProcessing(numbers.length);

    try {
        await fetch("/send-messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numbers, message })
        });

        addLogEntry(`🚀 Started sending ${numbers.length} messages...`, 'info');
    } catch (error) {
        addLogEntry(`❌ Error: ${error.message}`, 'error');
        stopProcessing();
    }
});

// Socket listeners
socket.on("progress", (data) => {
    updateProgress(data);
});

socket.on("messageStatus", (data) => {
    if (data.status === 'success') {
        addLogEntry(`✅ Message sent to ${data.number}`, 'success');
    } else {
        addLogEntry(`❌ Failed to send to ${data.number}: ${data.error}`, 'error');
    }
});

// Functions
function startProcessing(total) {
    isProcessing = true;
    totalMessages = total;
    sentMessages = 0;
    failedMessages = 0;
    startTime = Date.now();

    // Update UI
    sendButton.disabled = true;
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending Messages...';

    // Update tracking status
    trackingStatus.textContent = 'Sending Messages...';
    trackingStatus.className = 'tracking-status sending';

    // Show live log
    liveLog.classList.add('active');

    // Activate cards
    speedCard.classList.add('active');

    addLogEntry('📊 Bulk sending process initiated', 'info');
}

function stopProcessing() {
    isProcessing = false;
    sendButton.disabled = false;
    sendButton.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Messages';

    // Update status
    if (failedMessages === 0) {
        trackingStatus.textContent = 'All Messages Sent Successfully!';
        trackingStatus.className = 'tracking-status completed';
    } else {
        trackingStatus.textContent = `Completed with ${failedMessages} failures`;
        trackingStatus.className = 'tracking-status error';
    }

    queueCard.classList.remove('active');
    if (sentMessages > 0) sentCard.classList.add('active');
    if (failedMessages > 0) failedCard.classList.add('active');
}

function updateProgress(data) {
    sentMessages = data.sent || 0;
    failedMessages = data.failed || 0;
    const processed = sentMessages + failedMessages;
    const remaining = totalMessages - processed;

    // Update progress bar
    const percentage = totalMessages > 0 ? (processed / totalMessages) * 100 : 0;
    progressBar.style.width = percentage + '%';
    progressText.textContent = Math.round(percentage) + '%';

    // Update counters
    queueCount.textContent = remaining;
    sentCount.textContent = sentMessages;
    failedCount.textContent = failedMessages;

    // Calculate speed
    if (startTime && processed > 0) {
        const elapsedMinutes = (Date.now() - startTime) / 60000;
        const speed = Math.round(processed / Math.max(elapsedMinutes, 0.1));
        speedCount.textContent = speed;
    }

    // Check if completed
    if (processed >= totalMessages) {
        stopProcessing();
        addLogEntry(`🎉 Process completed! ${sentMessages} sent, ${failedMessages} failed`, 'success');
    }
}

function addLogEntry(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    logEntry.innerHTML = `[${timestamp}] ${message}`;

    liveLog.appendChild(logEntry);
    liveLog.scrollTop = liveLog.scrollHeight;

    // Limit log entries to 100
    const entries = liveLog.querySelectorAll('.log-entry');
    if (entries.length > 100) {
        entries[0].remove();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    addLogEntry('🔄 System initialized and ready for bulk messaging', 'info');
});