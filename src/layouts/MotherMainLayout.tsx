import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonLabel,
} from "@ionic/react";
import {
  homeOutline,
  bookOutline,
  notificationsOutline,
  personCircleOutline,
  chatbubbleEllipsesOutline,
  close,
  send,
} from "ionicons/icons";
import logo from "../assets/logo.png";
import botAvatar from "../assets/logo.png";
import { supabase } from "../utils/supabaseClient";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface QA {
  id: string;
  question: string;
  answer: string;
}

const MotherMainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [questions, setQuestions] = useState<QA[]>([]);
  const [nickname, setNickname] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "Nanay";
  const firstName = (nickname || fullName).split(" ")[0];

  // === Fetch Profile ===
  useEffect(() => {
    const fetchMotherSettings = async () => {
      if (!userId) return;
      const { data: mother } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (!mother?.mother_id) return;
      const { data } = await supabase
        .from("mother_settings")
        .select("nickname, profile_image_url")
        .eq("mother_id", mother.mother_id)
        .maybeSingle();
      if (data) {
        setNickname(data.nickname || null);
        setProfileImage(data.profile_image_url || null);
      }
    };
    fetchMotherSettings();
  }, [userId]);

  // === Fetch Chatbot Questions ===
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from("chatbot_qa")
        .select("id, question, answer")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (data) setQuestions(data as QA[]);
    };
    fetchQuestions();
  }, []);

  const goTo = (path: string) => history.push(path);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBodyRef.current?.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const sendMessage = (text: string, sender: "user" | "bot") => {
    setMessages((prev) => [...prev, { sender, text }]);
    scrollToBottom();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    sendMessage(userMessage, "user");
    setInput("");

    const words = userMessage.toLowerCase().split(" ");
    let reply = "I’m still learning! Try selecting a question or ask me about prenatal care.";

    const { data } = await supabase
      .from("chatbot_qa")
      .select("question, answer")
      .eq("is_active", true);

    if (data && data.length > 0) {
      for (let word of words) {
        const match = (data as QA[]).find((q) =>
          q.question.toLowerCase().includes(word)
        );
        if (match) {
          reply = match.answer;
          break;
        }
      }
    }

    setTimeout(() => sendMessage(reply, "bot"), 500);
  };

  const handleQuestionClick = (qa: QA) => {
    sendMessage(qa.question, "user");
    setTimeout(() => sendMessage(qa.answer, "bot"), 500);
  };

  return (
    <IonPage className="mother-layout">
      {/* ===== HEADER ===== */}
      <IonHeader className="mother-header">
        <IonToolbar>
          <div className="header-content">
            <div className="header-left" onClick={() => goTo("/dashboardmother")}>
              <img src={logo} alt="eNanayCare" className="mother-logo" />
              <span className="app-title">
                eNanay<span className="highlight">Care</span>
              </span>
            </div>
            <div className="header-right">
              <IonButton
                fill="clear"
                className="profile-btn"
                onClick={() => goTo("/mothersprofile")}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-img" />
                ) : (
                  <IonIcon icon={personCircleOutline} className="profile-icon" />
                )}
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* ===== MAIN CONTENT ===== */}
      <IonContent className="mother-content">
        <main className="mother-main">{children}</main>

        {/* ===== CHATBOT ===== */}
        {showChat && (
          <div className="chat-box">
            <div className="chat-header">
              <b>MAMABOT</b>
              <IonIcon
                icon={close}
                className="close-icon"
                onClick={() => setShowChat(false)}
              />
            </div>

            <div className="chat-body" ref={chatBodyRef}>
              {messages.length === 0 && (
                <div className="msg bot">
                  <img src={botAvatar} alt="Bot" className="chat-avatar" />
                  <div className="chat-text bot-bubble">
                    Hi <b>{firstName}</b>! I'm <b>MAMABOT</b>, your pregnancy buddy.
                    Tap a question below or type your own!
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.sender}`}>
                  {m.sender === "bot" ? (
                    <>
                      <img src={botAvatar} alt="Bot" className="chat-avatar" />
                      <div className="chat-text bot-bubble">{m.text}</div>
                    </>
                  ) : (
                    <>
                      <div className="chat-text user-bubble">{m.text}</div>
                      <img
                        src={
                          profileImage ||
                          "https://cdn-icons-png.flaticon.com/512/921/921071.png"
                        }
                        alt="You"
                        className="chat-avatar"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="chat-questions">
              {questions.map((q) => (
                <button
                  key={q.id}
                  className="question-btn"
                  onClick={() => handleQuestionClick(q)}
                >
                  {q.question}
                </button>
              ))}
            </div>

            <div className="chat-input">
              <input
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className="send-btn" onClick={handleSend}>
                <IonIcon icon={send} />
              </button>
            </div>
          </div>
        )}

{/* ===== CHATBOT FAB ICON ===== */}
{!showChat && (
  <IonFab vertical="bottom" horizontal="end" slot="fixed" className="chatbot-fab-wrapper">
    <IonFabButton className="chatbot-fab" onClick={() => setShowChat(true)}>
      <IonIcon icon={chatbubbleEllipsesOutline} className="chatbot-icon" />
    </IonFabButton>
  </IonFab>
        )}
      </IonContent>

      {/* ===== FOOTER ===== */}
      <footer className="mother-footer-nav">
        <IonButton
          fill="clear"
          className={`footer-btn ${location.pathname === "/dashboardmother" ? "active" : ""}`}
          onClick={() => goTo("/dashboardmother")}
        >
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonButton>

        <IonButton
          fill="clear"
          className={`footer-btn ${location.pathname === "/educationalmaterials" ? "active" : ""}`}
          onClick={() => goTo("/educationalmaterials")}
        >
          <IonIcon icon={bookOutline} />
          <IonLabel>Learn</IonLabel>
        </IonButton>

        <IonButton
          fill="clear"
          className={`footer-btn ${location.pathname === "/mothernotifications" ? "active" : ""}`}
          onClick={() => goTo("/mothernotifications")}
        >
          <IonIcon icon={notificationsOutline} />
          <IonLabel>Alerts</IonLabel>
        </IonButton>
      </footer>

      {/* ===== CSS ===== */}
      <style>{`
        :root {
          --primary-pink: #d26a8a;
          --primary-dark: #a2385a;
          --pink-light: #fdeaf1;
          --text-dark: #3d2c35;
          --bubble-bot: #f7d0e2;
          --bubble-user: #ec97b4;
        }

        *::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }

        .mother-layout {
          background: var(--pink-light);
          min-height: 100vh;
        }

        /* HEADER */
        .mother-header {
          background: linear-gradient(90deg, var(--primary-dark), var(--primary-pink));
          color: white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0rem 1rem;
        }

        .mother-logo { width: 42px; height: 42px; }

        .app-title {
          font-weight: 800;
          font-size: 1.6rem;
          color: black;
          margin-left: 10px;
          letter-spacing: 0.5px;
        }

        .highlight { color: pink }

        .profile-img {
          width: 42px; height: 42px;
          border-radius: 50%;
          border: 2px solid #fff;
          object-fit: cover;
        }

        .profile-icon { font-size: 2.2rem; color: #fff; }

        /* MAIN */
        .mother-main { padding: 1rem; padding-bottom: 120px; }

        /* CHATBOX */
        .chat-box {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 350px;
          max-height: 75vh;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.25);
          overflow: hidden;
          z-index: 1000;
        }

        .chat-header {
          background: linear-gradient(90deg, var(--primary-dark), var(--primary-pink));
          color: white;
          font-weight: bold;
          text-align: center;
          padding: 12px;
          position: relative;
        }

        .close-icon {
          position: absolute;
          right: 12px;
          top: 12px;
          font-size: 22px;
          cursor: pointer;
        }

        .chat-body {
          flex: 1;
          padding: 10px;
          background: #fff9fb;
          overflow-y: auto;
        }

        .msg { 
          display: flex; 
          align-items: flex-end; 
          margin: 6px 0; 
        }

        .msg.bot { justify-content: flex-start; }
        .msg.user { justify-content: flex-end; }

        .chat-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          object-fit: cover;
        }

        .chat-text {
          padding: 10px 14px;
          border-radius: 18px;
          max-width: 75%;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .bot-bubble { background: var(--bubble-bot); color: var(--text-dark); margin-left: 6px; }
        .user-bubble { background: var(--bubble-user); color: white; margin-right: 6px; }

        .chat-questions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 6px;
          background: #fff;
          border-top: 1px solid #f3c1d8;
          overflow-y: auto;
          max-height: 150px;
        }

        .question-btn {
          background: var(--bubble-bot);
          color: var(--primary-dark);
          border: none;
          border-radius: 16px;
          padding: 6px 12px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.2s;
        }

        .question-btn:hover {
          background: var(--primary-pink);
          color: white;
        }

        .chat-input {
          display: flex;
          align-items: center;
          padding: 8px;
          border-top: 1px solid #f3c1d8;
          background: #fff;
        }

        .chat-input input {
          flex: 1;
          border: 1px solid #f3b0c3;
          border-radius: 20px;
          padding: 10px 14px;
          font-size: 0.9rem;
        }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--primary-dark);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 6px;
        }

        /* CHATBOT FAB ICON */
.chatbot-fab-wrapper {
  position: fixed !important;
  bottom: 85px !important; /* Slightly above footer */
  right: 20px !important;
  z-index: 2000 !important;
}

.chatbot-fab {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-pink)) !important;
  width: 58px !important;
  height: 58px !important;
  border-radius: 50%;
  box-shadow: 0 6px 15px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2.8s infinite ease-in-out;
  transition: transform 0.3s ease;
}

.chatbot-fab:hover {
  transform: scale(1.08);
}

.chatbot-icon {
  font-size: 1.8rem;
  color: #fff;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 6px 15px rgba(0,0,0,0.3); }
  50% { transform: scale(1.05); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
}

        /* FOOTER */
        .mother-footer-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0px 0;
          background: linear-gradient(90deg, var(--primary-dark), var(--primary-pink));
          color: #fff;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          box-shadow: 0 -3px 10px rgba(0,0,0,0.25);
          z-index: 1000;
        }

        .footer-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          font-weight: bold;
          transition: 0.3s;
        }

        .footer-btn.active {
          text-shadow: 0 0 6px rgba(255,255,255,0.9);
        }

        .footer-btn.active ion-icon {
          background: rgba(255,255,255,0.25);
          border-radius: 50%;
          padding: 6px;
        }

        .mother-footer-nav ion-icon {
          font-size: 1.4rem;
          margin-bottom: 2px;
        }

        @media (max-width: 480px) {
          .chat-box { width: 95%; right: 2.5%; }
          .app-title { font-size: 1.2rem; }
          .footer-btn { font-size: 0.9rem; }
        }
      `}</style>
    </IonPage>
  );
};

export default MotherMainLayout;
