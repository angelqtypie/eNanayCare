// File: src/layouts/MotherMainLayout.tsx
import React, { useState, useEffect } from "react";
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
import logo from "../assets/logo.svg";
import botAvatar from "../assets/logo.svg"; // Add a cute Mamabot image
import { supabase } from "../utils/supabaseClient";
import "./MotherMainLayout.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const MotherMainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const history = useHistory();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [nickname, setNickname] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "Nanay";
  const firstName = (nickname || fullName).split(" ")[0];

  useEffect(() => {
    const fetchMotherSettings = async () => {
      if (!userId) return;

      const { data: mother, error: motherError } = await supabase
        .from("mothers")
        .select("id")
        .eq("auth_user_id", userId)
        .single();

      if (motherError || !mother) return;

      const { data, error } = await supabase
        .from("mother_settings")
        .select("nickname, profile_image_url")
        .eq("mother_id", mother.id)
        .single();

      if (!error && data) {
        setNickname(data.nickname);
        setProfileImage(data.profile_image_url);
      }
    };

    fetchMotherSettings();
  }, [userId]);

  const goTo = (path: string) => history.push(path);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    // Fetch random question/answer pair from DB
    const { data, error } = await supabase
      .from("chatbot_qa")
      .select("question, answer")
      .eq("is_active", true);

    let reply = "I'm not sure about that yet. Try asking about pregnancy tips";

    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      reply = random.answer;
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 600);
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
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
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

      {/* MAIN CONTENT */}
      <IonContent className="mother-layout-content" fullscreen>
        <main className="mother-main">{children}</main>

        {/* CHATBOT */}
        {showChat && (
          <div className="chat-box">
            <div className="chat-header">
              <b>MAMABOT</b>
              <IonIcon icon={close} onClick={() => setShowChat(false)} className="close-icon" />
            </div>
            <div className="chat-body">
              {messages.length === 0 ? (
                <div className="msg bot">
                  <img src={botAvatar} alt="Bot" className="chat-avatar" />
                  <div className="chat-text">
                    Hi <b>{firstName}</b>! I'm <b>MAMABOT</b>, your pregnancy buddy 
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`msg ${m.sender}`}>
                    {m.sender === "bot" && <img src={botAvatar} alt="Bot" className="chat-avatar" />}
                    {m.sender === "user" && profileImage && (
                      <img src={profileImage} alt="You" className="chat-avatar user-avatar" />
                    )}
                    <div className="chat-text">{m.text}</div>
                  </div>
                ))
              )}
            </div>

            <div className="chat-floating-input">
              <input
                placeholder="Ask something..."
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

        {!showChat && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => setShowChat(true)} className="chat-fab">
              <IonIcon icon={chatbubbleOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>

      {/* FOOTER NAV */}
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
    </IonPage>
  );
};

export default MotherMainLayout;
