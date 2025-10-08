import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonContent,
  IonIcon,
} from "@ionic/react";
import {
  peopleCircleOutline,
  bookOutline,
  calendarOutline,
  documentTextOutline,
  logOutOutline,
} from "ionicons/icons";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "./DashboardAdmin.css"; // Import CSS

const DashboardAdmin: React.FC = () => {
  const history = useHistory();

  const [counts, setCounts] = useState({
    total: 0,
    bhw: 0,
    mothers: 0,
    admins: 0,
    materials: 0,
    reports: 0,
    schedules: 0,
  });

  const handleLogout = () => {
    localStorage.clear();
    history.push("/landingpage");
  };

  const fetchCounts = async () => {
    const { data: users } = await supabase.from("users").select("role");
    const { count: materials } = await supabase
      .from("materials")
      .select("*", { count: "exact", head: true });
    const { count: reports } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true });
    const { count: schedules } = await supabase
      .from("schedules")
      .select("*", { count: "exact", head: true });

    if (users) {
      const total = users.length;
      const bhw = users.filter((u: any) => u.role === "bhw").length;
      const mothers = users.filter((u: any) => u.role === "mother").length;
      const admins = users.filter((u: any) => u.role === "admin").length;
      setCounts({
        total,
        bhw,
        mothers,
        admins,
        materials: materials || 0,
        reports: reports || 0,
        schedules: schedules || 0,
      });
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const cards = [
    {
      title: "Users",
      subtitle: `${counts.bhw} BHWs / ${counts.mothers} Mothers / ${counts.admins} Admins`,
      value: counts.total,
      icon: peopleCircleOutline,
      color: "#007bff",
      link: "/adminuserpage",
    },
    {
      title: "Materials",
      subtitle: "Uploaded",
      value: counts.materials,
      icon: bookOutline,
      color: "#28a745",
      link: "/adminmaterials",
    },
    {
      title: "Reports",
      subtitle: "Generated",
      value: counts.reports,
      icon: documentTextOutline,
      color: "#6f42c1",
      link: "/adminreports",
    },
    {
      title: "Schedules",
      subtitle: "Upcoming Events",
      value: counts.schedules,
      icon: calendarOutline,
      color: "#ffc107",
      link: "/adminschedule",
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary" className="header-toolbar">
          <IonTitle className="header-title">Admin Dashboard</IonTitle>
          <IonButton
            color="light"
            fill="clear"
            className="logout-button"
            slot="end"
            onClick={handleLogout}
          >
            <IonIcon icon={logOutOutline} className="logout-icon" />
            Logout
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, Admin 👋</h1>
          <p>Overview of system status and quick navigation.</p>
        </div>

        <div className="dashboard-grid">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className="dashboard-card"
              style={{ borderTopColor: card.color }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => history.push(card.link)}
            >
              <div className="card-content">
                <div className="card-header">
                  <IonIcon icon={card.icon} style={{ color: card.color }} />
                  <h3>{card.title}</h3>
                </div>
                <p className="card-subtitle">{card.subtitle}</p>
                <div className="card-footer" style={{ color: card.color }}>
                  <span className="card-value">{card.value}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DashboardAdmin;
