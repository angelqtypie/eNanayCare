// File: src/components/FAQChatbot.tsx
import React, { useState } from "react";
import "../pages/FAQChatbot.css";

export default function FAQChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋! I'm here to help you with maternal health questions." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);

    // Generate bot reply
    const reply = getBotResponse(input);
    setMessages([...newMessages, { from: "bot", text: reply }]);

    setInput("");
  };

  const getBotResponse = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes("eat")) return "🍎 Focus on leafy greens, fruits, proteins, and whole grains.";
    if (lower.includes("exercise")) return "🤸‍♀️ Light exercises like walking, swimming, and prenatal yoga are safe.";
    if (lower.includes("appointment")) return "📅 You can view appointments in the 'Appointments' section.";
    if (lower.includes("medication")) return "💊 Always consult your BHW or doctor before taking medication.";
    if (lower.includes("mental health")) return "💙 It's normal to feel overwhelmed. Reach out to your BHW or support groups.";
    return "🤔 I'm still learning. Please ask another question or contact your BHW.";
  };

  return (
    <div className="chatbot-wrapper">
      {/* Toggle Button */}
      <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
        💬
      </button>

      {/* Chatbox */}
      {open && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <span>🤖 Maternal FAQ Bot</span>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.from}`}>
                <div className="bubble">{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              placeholder="Ask me something..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
