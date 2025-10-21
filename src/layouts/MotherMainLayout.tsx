import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
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
  chatbubbleOutline,
  close,
  send,
} from "ionicons/icons";
import logo from "../assets/logo.png";
import botAvatar from "../assets/logo.png";
import { supabase } from "../utils/supabaseClient";
import "./MotherMainLayout.css";

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

  useEffect(() => {
    const fetchMotherSettings = async () => {
      if (!userId) return;
      const { data: mother } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (!mother?.mother_id) return;

      const { data, error } = await supabase
        .from("mother_settings")
        .select("nickname, profile_image_url")
        .eq("mother_id", mother.mother_id)
        .maybeSingle();
      if (!error && data) {
        setNickname(data.nickname || null);
        setProfileImage(data.profile_image_url || null);
      }
    };
    fetchMotherSettings();
  }, [userId]);

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
    <IonPage className="mother-layout-page">
      {/* HEADER */}
      <IonHeader className="mother-header">
        <IonToolbar>
          <div className="header-container">
            <div className="header-left" onClick={() => goTo("/dashboardmother")}>
              <img src={logo} alt="eNanayCare" className="mother-logo" />
              <span className="app-title">
                eNanay<span className="highlight">Care</span>
              </span>
            </div>
            <div className="header-right">
              <IonButton fill="clear" className="profile-icon-btn" onClick={() => goTo("/mothersprofile")}>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #f3b0c3",
                    }}
                  />
                ) : (
                  <IonIcon icon={personCircleOutline} className="profile-icon" />
                )}
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* CONTENT */}
      <IonContent className="mother-layout-content">
        <main className="mother-main">{children}</main>

        {/* CHAT UI */}
        {showChat && (
          <div className="chat-box">
            <div className="chat-header">
              <b>MAMABOT</b>
              <IonIcon icon={close} onClick={() => setShowChat(false)} className="close-icon" />
            </div>

            <div className="chat-body" ref={chatBodyRef}>
              {messages.length === 0 && (
                <div className="msg bot">
                  <img src={botAvatar} alt="Bot" className="chat-avatar" />
                  <div className="chat-text bot-bubble">
                    Hi <b>{firstName}</b>! I'm <b>MAMABOT</b>, your pregnancy buddy. Tap a question below or type your own!
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.sender}`}>
                  {m.sender === "bot" && <img src={botAvatar} alt="Bot" className="chat-avatar" />}
                  {m.sender === "user" && (
                    <img
                      src={profileImage || "https://cdn-icons-png.flaticon.com/512/921/921071.png"}
                      alt="You"
                      className="chat-avatar user-avatar"
                    />
                  )}
                  <div className={`chat-text ${m.sender === "bot" ? "bot-bubble" : "user-bubble"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-questions">
              {questions.map((q) => (
                <button key={q.id} className="question-btn" onClick={() => handleQuestionClick(q)}>
                  {q.question}
                </button>
              ))}
            </div>

            <div className="chat-input-wrapper">
              <input
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <IonButton fill="clear" color="primary" onClick={handleSend}>
                <IonIcon icon={send} />
              </IonButton>
            </div>
          </div>
        )}

        {/* Chat FAB */}
        {!showChat && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => setShowChat(true)}>
              <IonIcon icon={chatbubbleOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>

      {/* FOOTER NAVIGATION */}
      <footer className="mother-footer-nav">
        <IonButton fill="clear" onClick={() => goTo("/dashboardmother")}>
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonButton>
        <IonButton fill="clear" onClick={() => goTo("/educationalmaterials")}>
          <IonIcon icon={bookOutline} />
          <IonLabel>Learn</IonLabel>
        </IonButton>
        <IonButton fill="clear" onClick={() => goTo("/mothernotifications")}>
          <IonIcon icon={notificationsOutline} />
          <IonLabel>Alerts</IonLabel>
        </IonButton>
      </footer>

      {/* Inline Styling for Key Elements */}
      <style>{`
        .mother-main {
          padding: 16px;
          padding-bottom: 120px; /* ensures space above footer */
        }
        .chat-body {
          padding: 12px;
          overflow-y: auto;
          max-height: 50vh;
        }
        .chat-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          margin-right: 6px;
        }
        .msg {
          display: flex;
          margin-bottom: 8px;
          align-items: flex-end;
        }
        .msg.user { justify-content: flex-end; }
        .msg.bot { justify-content: flex-start; }
        .chat-text {
          padding: 10px 14px;
          max-width: 75%;
          border-radius: 18px;
        }
        .bot-bubble {
          background: #f8d1e0;
          color: #6d214f;
          border-top-left-radius: 0;
        }
        .user-bubble {
          background: #f197ba;
          color: #fff;
          border-top-right-radius: 0;
        }
        .chat-questions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 6px;
          overflow-y: auto;
          max-height: 120px;
        }
        .question-btn {
          background: #f8d1e0;
          color: #6d214f;
          border: none;
          border-radius: 16px;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .question-btn:hover {
          background: #f4b8cd;
        }
        .chat-input-wrapper {
          display: flex;
          padding: 6px;
          border-top: 1px solid #e3b7cb;
        }
        .chat-input-wrapper input {
          flex: 1;
          padding: 8px;
          border-radius: 12px;
          border: 1px solid #f3b0c3;
          font-size: 0.95rem;
        }
      `}</style>
    </IonPage>
  );
};

export default MotherMainLayout;
