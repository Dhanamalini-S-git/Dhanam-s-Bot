const inputField = document.getElementById("user-input");

// Handle enter key press
inputField.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const sendBtn = document.getElementById("send-btn");
    
    const message = input.value.trim();

    if (!message) return;

    // Show user message
    chatBox.innerHTML += `
        <div class="message user">
            <div class="msg-content">${escapeHTML(message)}</div>
        </div>
    `;

    input.value = "";
    input.focus();
    chatBox.scrollTop = chatBox.scrollHeight;

    // Show typing indicator
    const typingId = "typing-" + Date.now();
    chatBox.innerHTML += `
        <div class="message bot" id="${typingId}">
            <div class="avatar"><i class="ph ph-robot"></i></div>
            <div class="msg-content">
                <div class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
    
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";

    try {
        // Send message to Python backend
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        // Remove typing indicator
        document.getElementById(typingId).remove();

        // Show AI response
        chatBox.innerHTML += `
            <div class="message bot">
                <div class="avatar"><i class="ph ph-robot"></i></div>
                <div class="msg-content">${formatText(data.reply)}</div>
            </div>
        `;
    } catch (error) {
        document.getElementById(typingId).remove();
        chatBox.innerHTML += `
            <div class="message bot">
                <div class="avatar"><i class="ph ph-warning-circle"></i></div>
                <div class="msg-content" style="color: #ef4444;">Oops! Something went wrong.</div>
            </div>
        `;
    }

    sendBtn.disabled = false;
    sendBtn.style.opacity = "1";
    chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Simple formatter for bold text and line breaks
function formatText(text) {
    let formatted = escapeHTML(text);
    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}