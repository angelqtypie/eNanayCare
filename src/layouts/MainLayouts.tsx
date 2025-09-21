// src/layouts/MainLayout.tsx
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
} from "ionicons/icons";
import logo from "../assets/logo.svg";
import "./MainLayout.css";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goTo = (path: string) => {
    setSidebarOpen(false);
    history.push(path);
  };

  return (
    <IonPage className="layout-page">
      {/* HEADER */}
      <IonHeader className="layout-header">
        <IonToolbar className="toolbar no-padding">
          <div className="header-container">
            {/* LEFT SIDE */}
            <div className="header-left">
              <button
                className="sidebar-toggle"
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

            {/* RIGHT SIDE */}
            <div className="header-right desktop-only">
              <IonButton
                className="logout-btn"
                color="medium"
                fill="clear"
                onClick={() => history.push("/Capstone/landingpage")}
              >
                <IonIcon icon={logOutOutline} slot="end" />
                Logout
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* CONTENT WITH SIDEBAR */}
      <IonContent className="layout-content" fullscreen>
        <div className="dashboard-layout">
          {/* SIDEBAR */}
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <h3 className="sidebar-title">Menu</h3>
            <nav className="sidebar-nav">
              <button className="side-item" onClick={() => goTo("/Capstone/dashboardbhw")}>
                <IonIcon icon={pulseOutline} />
                Dashboard
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/mothers")}>
                <IonIcon icon={peopleOutline} />
                Mothers
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/appointments")}>
                <IonIcon icon={calendarOutline} />
                Appointments
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/reminders")}>
                <IonIcon icon={notificationsOutline} />
                Reminders
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/adminfaq")}>
                <IonIcon icon={chatbubbleEllipsesOutline} />
                FAQ
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/guidelines")}>
                <IonIcon icon={documentTextOutline} />
                DOH Guidelines
              </button>
              <button className="side-item" onClick={() => goTo("/Capstone/booklet")}>
                <IonIcon icon={bookOutline} />
                Pregnancy Booklet
              </button>
            </nav>
          </aside>

          {/* MAIN AREA (child page injected here) */}
          <main className="main-dashboard">{children}</main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainLayout;
