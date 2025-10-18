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
import botAvatar from "../assets/logo.svg"; // Default bot image
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

  /** ✅ FIXED: Use correct column and show uploaded image */
  useEffect(() => {
    const fetchMotherSettings = async () => {
      if (!userId) return;

      // Find mother_id using the correct column (user_id)
      const { data: mother, error: motherError } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (motherError || !mother?.mother_id) {
        console.warn("Mother record not found");
        return;
      }

      // Fetch profile settings for this mother
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

    // Optional: refresh every 20 seconds to reflect changes from profile page
    const interval = setInterval(fetchMotherSettings, 20000);
    return () => clearInterval(interval);
  }, [userId]);

  /** Routing helper */
  const goTo = (path: string) => history.push(path);

  /** Chatbot logic */
  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    // Fetch random active Q&A from DB
    const { data } = await supabase
      .from("chatbot_qa")
      .select("answer")
      .eq("is_active", true);

    let reply =
      "I’m still learning! Try asking about healthy meals or prenatal care 💕";

    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      reply = random.answer;
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 500);
  };

  return (
    <IonPage className="mother-layout-page">
      {/* HEADER */}
      <IonHeader className="mother-header">
        <IonToolbar>
          <div className="header-container">
            {/* Left: Logo */}
            <div className="header-left" onClick={() => goTo("/dashboardmother")}>
              <img src={logo} alt="eNanayCare" className="mother-logo" />
              <span className="app-title">
                eNanay<span className="highlight">Care</span>
              </span>
            </div>

            {/* Right: Profile */}
            <div className="header-right">
              <IonButton
                fill="clear"
                className="profile-icon-btn"
                onClick={() => goTo("/mothersprofile")}
              >
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
                  <IonIcon
                    icon={personCircleOutline}
                    className="profile-icon"
                  />
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
              <IonIcon
                icon={close}
                onClick={() => setShowChat(false)}
                className="close-icon"
              />
            </div>
            <div className="chat-body">
              {messages.length === 0 ? (
                <div className="msg bot">
                  <img src={botAvatar} alt="Bot" className="chat-avatar" />
                  <div className="chat-text">
                    Hi <b>{firstName}</b>! I'm <b>MAMABOT</b>, your pregnancy
                    buddy. Ask me anything about prenatal care!
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`msg ${m.sender}`}>
                    {m.sender === "bot" && (
                      <img src={botAvatar} alt="Bot" className="chat-avatar" />
                    )}
                    {m.sender === "user" && (
                      <img
                        src={
                          profileImage ||
                          "https://cdn-icons-png.flaticon.com/512/921/921071.png"
                        }
                        alt="You"
                        className="chat-avatar user-avatar"
                      />
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
    </IonPage>
  );
};

export default MotherMainLayout;
