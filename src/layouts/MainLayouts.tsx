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
  heartOutline,
  settingsOutline,
  leafOutline,
  alertCircleOutline,
} from "ionicons/icons";
import logo from "../assets/logo.png";
import "./MainLayout.css";
import { supabase } from "../utils/supabaseClient";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullName, setFullName] = useState("Barangay Health Worker");
  const [zone, setZone] = useState<string | null>(null);

  useEffect(() => {
    const fetchBHW = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // fetch full_name and zone from Supabase users table
      const { data, error } = await supabase
        .from("users")
        .select("full_name, zone")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setFullName(data.full_name || "Barangay Health Worker");
        setZone(data.zone || null);
        localStorage.setItem("full_name", data.full_name);
        if (data.zone) localStorage.setItem("zone", data.zone);
      } else {
        console.error("Error fetching BHW info:", error);
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
            {/* LEFT SECTION */}
            <div className="header-left">
              <button
                className="sidebar-toggle mobile-only"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <IonIcon icon={menuOutline} />
              </button>

              <div
                className="logo-title desktop-only"
                onClick={() => goTo("/dashboardbhw")}
              >
                <img src={logo} alt="eNanayCare" className="dashboard-logo" />
                <span className="app-title">eNanayCare</span>
              </div>

              <span className="app-title mobile-only">eNanayCare</span>
            </div>

            {/* RIGHT SECTION: BHW info */}
            <div
              className="user-profile"
              onClick={() => goTo("/bhwprofile")}
              style={{ cursor: "pointer" }}
            >
              <div>
                <p className="profile-name">{fullName}</p>
                {/* now display assigned zone */}
                <p className="profile-role">
                  {zone ? `${zone}` : "No Zone Assigned"}
                </p>
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
              <button
                className="side-item"
                onClick={() => goTo("/dashboardbhw")}
              >
                <IonIcon icon={pulseOutline} /> Dashboard
              </button>
              <button className="side-item" onClick={() => goTo("/mothers")}>
                <IonIcon icon={peopleOutline} /> Mothers
              </button>
              <button
                className="side-item"
                onClick={() => goTo("/appointments")}
              >
                <IonIcon icon={calendarOutline} /> Appointments
              </button>
              <button
                className="side-item"
                onClick={() => goTo("/healthrecords")}
              >
                <IonIcon icon={heartOutline} /> Health Records
              </button>
              <button
                className="side-item"
                onClick={() => goTo("/bhwwellnesspage")}
              >
                <IonIcon icon={leafOutline} /> Wellness Logs
              </button>
              <button
                className="side-item"
                onClick={() => goTo("/riskreportpage")}
              >
                <IonIcon icon={alertCircleOutline} /> Risk Reports
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
