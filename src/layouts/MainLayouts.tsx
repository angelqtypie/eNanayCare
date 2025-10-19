// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
} from "@ionic/react";
import {
  menuOutline,
  peopleOutline,
  calendarOutline,
  logOutOutline,
  pulseOutline,
  personCircleOutline,
  heartOutline,
  settingsOutline,
} from "ionicons/icons";
import logo from "../assets/logo.svg";
import "./MainLayout.css";
import { supabase } from "../utils/supabaseClient";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullName, setFullName] = useState("Barangay Health Worker");

  useEffect(() => {
    const fetchBHW = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const { data, error } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", userId)
        .single();
      if (!error && data) {
        setFullName(data.full_name);
        localStorage.setItem("full_name", data.full_name);
      }
    };
    fetchBHW();
  }, []);

  const goTo = (path: string) => {
    setSidebarOpen(false);
    history.push(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    setSidebarOpen(false);
    history.push("/landingpage");
  };

  return (
    <IonPage className="layout-page">
      <IonHeader className="layout-header">
        <IonToolbar className="toolbar">
          <div className="header-container">
            <div className="header-left">
              {/* Mobile: Show menu icon */}
              <button
                className="sidebar-toggle mobile-only"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <IonIcon icon={menuOutline} />
              </button>

              {/* Desktop: Show logo + title */}
              <div className="desktop-only logo-title" onClick={() => goTo("/dashboardbhw")}>
                <img src={logo} alt="eNanayCare" className="dashboard-logo" />
                <span className="app-title">eNanayCare</span>
              </div>
            </div>

            <div className="header-right">
              <div
                className="user-profile"
                onClick={() => goTo("/bhwprofile")}
                style={{ cursor: "pointer" }}
              >
                <IonIcon icon={personCircleOutline} className="profile-icon" />
                <div>
                  <p className="profile-name">{fullName}</p>
                  <p className="profile-role">Barangay Health Worker</p>
                </div>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="layout-content" fullscreen scrollY={false}>
        <div className="dashboard-layout">
          {/* SIDEBAR */}
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <nav className="sidebar-nav">
              <button className="side-item" onClick={() => goTo("/dashboardbhw")}>
                <IonIcon icon={pulseOutline} /> Dashboard
              </button>
              <button className="side-item" onClick={() => goTo("/mothers")}>
                <IonIcon icon={peopleOutline} /> Mothers
              </button>
              <button className="side-item" onClick={() => goTo("/appointments")}>
                <IonIcon icon={calendarOutline} /> Appointments
              </button>
              <button className="side-item" onClick={() => goTo("/healthrecords")}>
                <IonIcon icon={heartOutline} /> Health Records
              </button>
              <button className="side-item" onClick={() => goTo("/bhwprofile")}>
                <IonIcon icon={settingsOutline} /> Settings
              </button>
              <IonButton
                className="logout-btn"
                color="medium"
                fill="clear"
                onClick={handleLogout}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Logout
              </IonButton>
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="main-dashboard">{children}</main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainLayout;
