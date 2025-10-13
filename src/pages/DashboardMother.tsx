import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import {
  calendarOutline,
  heartOutline,
  bulbOutline,
  bandageOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import MotherMainLayout from "../layouts/MotherMainLayout";
import { supabase } from "../utils/supabaseClient";
import "./DashboardMother.css";

const DashboardMother: React.FC = () => {
  const history = useHistory();
  const [motherName, setMotherName] = useState("Mommy");
  const [dailyTip, setDailyTip] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // 🌸 Default fallback tips
  const fallbackTips = [
    "Stay hydrated — drink at least 8 glasses of water daily 💧",
    "Eat more fruits and vegetables for a balanced diet 🥦🍎",
    "Take short naps to fight fatigue 😴",
    "Avoid skipping prenatal vitamins 💊",
    "Walk for at least 20 minutes a day (if approved by your doctor) 🚶‍♀️",
    "Always keep your prenatal check-up schedule 📅",
    "Avoid stress — meditation and calm music help 🎵",
    "Talk to your baby — it helps bonding early 🤰💬",
    "Get enough sleep — your body needs rest 🌙",
    "Eat iron-rich foods like spinach and red meat to prevent anemia 🥩",
    "Don’t forget to smile — your journey is beautiful 💕",
    "Monitor your baby’s movements daily 🍼",
    "Avoid smoking and alcohol — your baby depends on you 🚫",
    "Stay positive — healthy mom, healthy baby 💖",
  ];

  // 🔹 Fetch nickname from mother_settings
  const fetchNickname = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Get the mother.id first
      const { data: mother, error: motherError } = await supabase
        .from("mothers")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (motherError || !mother) {
        console.warn("Mother not found:", motherError?.message);
        return;
      }

      // Fetch nickname from mother_settings
      const { data: settings, error: settingsError } = await supabase
        .from("mother_settings")
        .select("nickname")
        .eq("mother_id", mother.id)
        .maybeSingle();

      if (settingsError) {
        console.warn("Settings fetch error:", settingsError.message);
        return;
      }

      if (settings?.nickname && settings.nickname.trim() !== "") {
        setMotherName(settings.nickname);
      } else {
        const fallback = localStorage.getItem("fullName") || "Mommy";
        setMotherName(fallback);
      }
    } catch (err) {
      console.error("fetchNickname error:", err);
    }
  };

  // 🔹 Fetch daily tips
  const fetchTips = async () => {
    interface Tip {
      title?: string;
      content?: string;
    }

    try {
      const { data, error } = await supabase
        .from("educational_materials")
        .select("title, content")
        .eq("is_published", true)
        .ilike("category", "%Maternal Health%");

      if (error) throw error;

      const tips =
        data && data.length > 0
          ? (data as Tip[]).map((t) => t.content || t.title || "")
          : fallbackTips;

      setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
    } catch (err) {
      console.error("Error fetching tips:", err);
      setDailyTip(fallbackTips[Math.floor(Math.random() * fallbackTips.length)]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Run both fetches on mount
  useEffect(() => {
    fetchNickname();
    fetchTips();
  }, []);

  return (
    <MotherMainLayout>
      <IonContent className="dashboard-content" fullscreen scrollY={true}>
        {/* 🌸 Header Section */}
        <div className="header-gradient">
          <div className="header-text">
            <h2>
              Hello, <span>{motherName}</span>
            </h2>
            <p>Your journey to motherhood is beautiful 🌼</p>
          </div>
          <div className="floating-decor decor-1">🍼</div>
          <div className="floating-decor decor-2">🌸</div>
        </div>

        {/* 🩷 Cards Section */}
        <div className="cards-grid">
          <IonCard
            className="mother-card pink"
            button
            onClick={() => history.push("/motherscalendar")}
          >
            <IonCardContent>
              <IonIcon icon={calendarOutline} className="card-icon" />
              <h3>Appointment</h3>
              <p>Next check-up: Oct 15, 2025 • 10:30 AM</p>
              <span className="status">Scheduled</span>
            </IonCardContent>
          </IonCard>

          <IonCard
            className="mother-card lavender"
            button
            onClick={() => history.push("/motherhealthrecords")}
          >
            <IonCardContent>
              <IonIcon icon={heartOutline} className="card-icon" />
              <h3>Health Records</h3>
              <p>BP: - | Weight: 160kg</p>
            </IonCardContent>
          </IonCard>

          <IonCard className="mother-card peach">
            <IonCardContent>
              <IonIcon icon={bulbOutline} className="card-icon" />
              <h3>Tip for Today</h3>
              {loading ? <IonSpinner name="dots" /> : <p>{dailyTip}</p>}
            </IonCardContent>
          </IonCard>

          <IonCard
            className="mother-card blue"
            button
            onClick={() => history.push("/motherimmunization")}
          >
            <IonCardContent>
              <IonIcon icon={bandageOutline} className="card-icon" />
              <h3>Immunization</h3>
              <p>No records yet</p>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </MotherMainLayout>
  );
};

export default DashboardMother;
