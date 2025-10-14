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

  const fallbackTips = [
    "Stay hydrated — drink at least 8 glasses of water daily",
    "Eat more fruits and vegetables for a balanced diet",
    "Take short naps to fight fatigue",
    "Avoid skipping prenatal vitamins",
    "Walk for at least 20 minutes a day (if approved by your doctor)",
    "Always keep your prenatal check-up schedule",
    "Avoid stress — meditation and calm music help",
    "Talk to your baby — it helps bonding early",
    "Get enough sleep — your body needs rest",
    "Eat iron-rich foods like spinach and red meat to prevent anemia",
  ];

  const fetchNickname = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const { data: mother } = await supabase
        .from("mothers")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (!mother) return;

      const { data: settings } = await supabase
        .from("mother_settings")
        .select("nickname")
        .eq("mother_id", mother.id)
        .maybeSingle();

      setMotherName(settings?.nickname || "Mommy");
    } catch (err) {
      console.error("fetchNickname error:", err);
    }
  };

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from("educational_materials")
        .select("content")
        .eq("is_published", true)
        .ilike("category", "%Maternal Health%");

      if (error || !data?.length)
        return setDailyTip(
          fallbackTips[Math.floor(Math.random() * fallbackTips.length)]
        );

      const randomTip = data[Math.floor(Math.random() * data.length)].content;
      setDailyTip(randomTip);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNickname();
    fetchTips();
  }, []);

  return (
    <MotherMainLayout>
      <IonContent className="dashboard-content" fullscreen scrollY={true}>
        <div className="header-gradient">
          <div className="floating-decor decor-1"></div>
          <div className="floating-decor decor-2"></div>
          <div className="floating-decor decor-3"></div>
          <div className="floating-decor decor-4"></div>

          <div className="header-text">
            <h2>
              Hello, <span>{motherName}</span>
            </h2>
            <p>Your journey to motherhood is beautiful 🌼</p>
          </div>
        </div>

        <div className="cards-grid">
          <IonCard
            className="mother-card soft-pink"
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
            className="mother-card soft-lilac"
            button
            onClick={() => history.push("/motherhealthrecords")}
          >
            <IonCardContent>
              <IonIcon icon={heartOutline} className="card-icon" />
              <h3>Health Records</h3>
              <p>BP: - | Weight: 160kg</p>
            </IonCardContent>
          </IonCard>

          <IonCard className="mother-card clean-white">
            <IonCardContent>
              <IonIcon icon={bulbOutline} className="card-icon" />
              <h3>Tip for Today</h3>
              {loading ? <IonSpinner name="dots" /> : <p>{dailyTip}</p>}
            </IonCardContent>
          </IonCard>

          <IonCard
            className="mother-card soft-rose"
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
