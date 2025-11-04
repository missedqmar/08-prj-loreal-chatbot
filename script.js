/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Cloudflare Worker URL
const CLOUDFLARE_WORKER_URL =
  "https://snowy-brook-7562.marvinastonitas.workers.dev/";

// Conversation history to maintain context (LevelUp feature)
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a helpful beauty assistant for L'Oréal. You specialize in helping customers discover and understand L'Oréal's extensive range of products including makeup, skincare, haircare, and fragrances. You provide personalized routines and recommendations. You only answer questions related to L'Oréal products, beauty routines, skincare, makeup, haircare, fragrances, and beauty-related topics. If asked about unrelated topics, politely decline and redirect the conversation back to L'Oréal products and beauty advice. Be friendly, knowledgeable, and professional.",
  },
];

// Set initial welcome message
chatWindow.innerHTML =
  '<div class="welcome-msg">👋 Welcome to L\'Oréal Beauty Assistant!<br>Ask me about makeup, skincare, haircare, or fragrances.</div>';

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user's message
  const userMessage = userInput.value.trim();

  // Don't send empty messages
  if (!userMessage) return;

  // Display user's message in chat bubble
  displayMessage(userMessage, "user");

  // Clear input field
  userInput.value = "";

  // Disable send button while processing
  sendBtn.disabled = true;

  // Add user message to conversation history
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  // Show loading indicator
  const loadingId = displayLoading();

  try {
    // Send request to Cloudflare Worker with conversation history
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error("Failed to get response from API");
    }

    // Parse the JSON response
    const data = await response.json();

    // Remove loading indicator
    removeLoading(loadingId);

    // Extract AI response from the API
    const aiResponse = data.choices[0].message.content;

    // Add AI response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    // Display AI response in chat bubble
    displayMessage(aiResponse, "ai");
  } catch (error) {
    // Remove loading indicator
    removeLoading(loadingId);

    // Display error message
    displayMessage(
      "Sorry, I'm having trouble connecting right now. Please try again later.",
      "ai"
    );

    // Log error for debugging
    console.error("Error:", error);
  } finally {
    // Re-enable send button
    sendBtn.disabled = false;
  }
});

/* Function to display messages with chat bubble styling (LevelUp feature) */
function displayMessage(message, sender) {
  // Create message container
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;

  // Create message bubble
  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "msg-bubble";
  bubbleDiv.textContent = message;

  // Add bubble to message container
  msgDiv.appendChild(bubbleDiv);

  // Add to chat window
  chatWindow.appendChild(msgDiv);

  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Function to show loading indicator */
function displayLoading() {
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "msg ai";
  loadingDiv.id = "loading-" + Date.now();

  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "msg-bubble";
  bubbleDiv.innerHTML = '<span class="loading">Thinking</span>';

  loadingDiv.appendChild(bubbleDiv);
  chatWindow.appendChild(loadingDiv);

  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return loadingDiv.id;
}

/* Function to remove loading indicator */
function removeLoading(loadingId) {
  const loadingDiv = document.getElementById(loadingId);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}
