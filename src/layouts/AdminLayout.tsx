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
  gridOutline,
  libraryOutline,
  documentTextOutline,
  peopleOutline,
  alertCircleOutline,
  logOutOutline,
  personCircleOutline,
} from "ionicons/icons";
import logo from "../assets/logo.svg";
import "./MainLayout.css";

const AdminMainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fullName = localStorage.getItem("full_name") || "Admin";

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
      {/* HEADER */}
      <IonHeader className="layout-header">
        <IonToolbar className="toolbar no-padding">
          <div className="header-container">
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
                onClick={() => goTo("/dashboardadmin")}
              />
              <span className="app-title">eNanayCare Admin</span>
            </div>

            <div className="header-right desktop-only">
              <div className="user-profile">
                <IonIcon icon={personCircleOutline} className="profile-icon" />
                <div>
                  <p className="profile-name">{fullName}</p>
                  <p className="profile-role">System Administrator</p>
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
              <button className="side-item" onClick={() => goTo("/dashboardadmin")}>
                <IonIcon icon={gridOutline} /> Dashboard
              </button>
              <button className="side-item" onClick={() => goTo("/adminmaterials")}>
                <IonIcon icon={libraryOutline} /> Educational Materials
              </button>
              <button className="side-item" onClick={() => goTo("/adminreports")}>
                <IonIcon icon={documentTextOutline} /> Reports
              </button>
              <button className="side-item" onClick={() => goTo("/adminuserpage")}>
                <IonIcon icon={peopleOutline} /> User Management
              </button>
              <button className="side-item" onClick={() => goTo("/adminriskoverview")}>
                <IonIcon icon={alertCircleOutline} /> Risk Overview
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

          <main className="main-dashboard">{children}</main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminMainLayout;
