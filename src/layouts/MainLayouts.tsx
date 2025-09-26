import React, { useState } from "react";
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
  notificationsOutline,
  chatbubbleEllipsesOutline,
  documentTextOutline,
  bookOutline,
  logOutOutline,
  pulseOutline,
  personCircleOutline,
} from "ionicons/icons";
import logo from "../assets/logo.svg";
import "./MainLayout.css";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fullName = localStorage.getItem("full_name") || "BHW";

  const goTo = (path: string) => {
    setSidebarOpen(false);
    history.push(path);
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    history.push("/Capstone/landingpage");
  };

  return (
    <IonPage className="layout-page">
      {/* HEADER */}
      <IonHeader className="layout-header">
        <IonToolbar className="toolbar no-padding">
          <div className="header-container">
            {/* LEFT */}
            <div className="header-left">
              <button
                className="sidebar-toggle mobile-only"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <IonIcon icon={menuOutline} />
              </button>
              <img
                src={logo}
                alt="eNanayCare"
                className="dashboard-logo"
                onClick={() => goTo("/Capstone/dashboardbhw")}
              />
              <span className="app-title">eNanayCare</span>
            </div>

            {/* RIGHT (desktop only) */}
            <div className="header-right desktop-only">
              <div className="user-profile">
                <IonIcon icon={personCircleOutline} className="profile-icon" />
                <div>
                  <p className="profile-name">{fullName} </p>
                  <p className="profile-role">Barangay Health Worker</p>
                </div>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* CONTENT */}
      <IonContent className="layout-content" fullscreen>
        <div className="dashboard-layout">
          {/* SIDEBAR */}
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <nav className="sidebar-nav">
              <button className="side-item" onClick={() => goTo("/Capstone/dashboardbhw")}>
                <IonIcon icon={pulseOutline} /> Dashboard
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/mothers")}>
                <IonIcon icon={peopleOutline} /> Mothers
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/appointments")}>
                <IonIcon icon={calendarOutline} /> Appointments
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/reminders")}>
                <IonIcon icon={notificationsOutline} /> Reminders
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/adminfaq")}>
                <IonIcon icon={chatbubbleEllipsesOutline} /> FAQ
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/guidelines")}>
                <IonIcon icon={documentTextOutline} /> DOH Guidelines
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/booklet")}>
                <IonIcon icon={bookOutline} /> Pregnancy Booklet
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

              {/* Logout (mobile only, inside sidebar) */}
              <button className="side-item mobile-only" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} /> Logout
              </button>
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
