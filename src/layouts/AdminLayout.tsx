import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import {
  menuOutline,
  gridOutline,
  libraryOutline,
  alertCircleOutline,
  chatbubblesOutline,
  peopleOutline,
  logOutOutline,
  personCircleOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import logo from "../assets/logo.png";

const AdminMainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<string>("admin");
  const [fullName, setFullName] = useState<string>("Admin");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("full_name, role, profile_image")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setFullName(data.full_name || "Admin");
        setRole(data.role || "admin");
        setProfileImage(data.profile_image || null);
      }
    };

    fetchUser();
  }, []);

  const goTo = (path: string) => {
    setSidebarOpen(false);
    history.push(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setSidebarOpen(false);
    history.push("/landingpage");
  };

  return (
    <IonPage className="admin-layout">
      {/* HEADER */}
      <IonHeader className="fixed-header">
        <IonToolbar>
          <div className="header-container">
            <div className="header-left">
              <button
                className="sidebar-toggle mobile-only"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <IonIcon icon={menuOutline} />
              </button>

              <div className="logo-section" onClick={() => goTo("/dashboardadmin")}>
                <img src={logo} alt="eNanayCare" className="logo" />
                <span className="app-title">eNanayCare</span>
              </div>
            </div>

            <div className="header-right desktop-only">
              <div className="user-profile">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-photo" />
                ) : (
                  <IonIcon icon={personCircleOutline} className="profile-icon" />
                )}
                <div>
                  <p className="profile-name">{fullName}</p>
                  <p className="profile-role">
                    {role === "bhw" ? "Barangay Health Worker" : "System Administrator"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* MAIN CONTENT LAYOUT */}
      <IonContent fullscreen scrollY={false}>
        <div className="layout-wrapper">
          {/* SIDEBAR */}
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <nav className="sidebar-nav">
              <button className="side-item" onClick={() => goTo("/dashboardadmin")}>
                <IonIcon icon={gridOutline} />
                <IonLabel>Dashboard</IonLabel>
              </button>

              <button className="side-item" onClick={() => goTo("/adminuserpage")}>
                <IonIcon icon={peopleOutline} />
                <IonLabel>User Management</IonLabel>
              </button>


              <button className="side-item" onClick={() => goTo("/adminmaterials")}>
                <IonIcon icon={libraryOutline} />
                <IonLabel>Educational Materials</IonLabel>
              </button>

              {role === "admin" && (
                <button className="side-item" onClick={() => goTo("/adminchatbotqa")}>
                  <IonIcon icon={chatbubblesOutline} />
                  <IonLabel>Chatbot Q&A</IonLabel>
                </button>
              )}

              <IonButton
                fill="clear"
                color="medium"
                className="logout-btn"
                onClick={handleLogout}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Logout
              </IonButton>
            </nav>
          </aside>

          {/* SCROLLABLE MAIN CONTENT */}
          <main className="main-content">
            <div className="main-scroll">{children}</div>
          </main>
        </div>
      </IonContent>

      {/* STYLES */}
      <style>{`
        .admin-layout {
          --ion-background-color: #fff7fa;
          font-family: 'Poppins', sans-serif;
        }

        /* ===== HEADER ===== */
        .fixed-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1100;
          background-color: #fff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;
          height: 60px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .logo {
          width: 38px;
          height: 38px;
          margin-right: 8px;
        }

        .app-title {
          font-weight: 600;
          font-size: 1.1rem;
          color: #d5649f;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .profile-photo {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-name {
          margin: 0;
          font-weight: 600;
          color: #6a3a55;
        }

        .profile-role {
          font-size: 0.8rem;
          color: #999;
          margin: 0;
        }

        /* ===== LAYOUT ===== */
        .layout-wrapper {
          display: flex;
          height: 100vh;
          overflow: hidden;
          margin-top: 60px; /* offset for fixed header */
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
          width: 240px;
          background: #fff;
          border-right: 1px solid #f2d9e5;
          padding: 20px 10px;
          position: fixed;
          top: 60px;
          bottom: 0;
          left: 0;
          overflow-y: auto;
          transition: transform 0.3s ease-in-out;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: #e1bfd3;
          border-radius: 10px;
        }

        .side-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          background: transparent;
          border: none;
          padding: 10px 15px;
          font-size: 15px;
          color: #444;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .side-item:hover {
          background: #f8e5f0;
          color: #d5649f;
        }

        .logout-btn {
          margin-top: 20px;
          width: 100%;
        }

        /* ===== MAIN CONTENT ===== */
        .main-content {
          flex: 1;
          margin-left: 240px;
          padding: 25px;
          overflow-y: auto;
          height: calc(100vh - 60px);
          background-color: #fff7fa;
        }

        .main-content::-webkit-scrollbar {
          width: 8px;
        }
        .main-content::-webkit-scrollbar-thumb {
          background: #e2b8cf;
          border-radius: 6px;
        }

        /* ===== RESPONSIVE ===== */
        .mobile-only {
          display: none;
        }
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            z-index: 1000;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .main-content {
            margin-left: 0;
          }
          .mobile-only {
            display: block;
          }
          .desktop-only {
            display: none;
          }
        }
      `}</style>
    </IonPage>
  );
};

export default AdminMainLayout;
