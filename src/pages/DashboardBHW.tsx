// src/pages/DashboardBHW.tsx
import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenu,
  IonList,
  IonItem,
  IonMenuToggle,
  IonButtons,
  IonMenuButton,
  IonText,
} from "@ionic/react";
import PregnantWomenList from "../components/PregnantWomenList";
import Schedule from "../components/Schedule";
import DosAndDonts from "../components/DosAndDonts";
import HealthRecords from "../components/HealthRecords";
import Announcements from "../components/Announcements";
import Statistics from "../components/Statistics";

const DashboardBHW: React.FC = () => {
  // Set default page as "welcome"
  const [activePage, setActivePage] = useState<string>("welcome");

  // Fetch BHW full name from localStorage (set after login)
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    const storedName = localStorage.getItem("full_name");
    if (storedName) setFullName(storedName);
  }, []);

  const menuItems = [
    { title: "Pregnant Women List", key: "pregnant-women" },
    { title: "Schedule", key: "schedule" },
    { title: "Do's and Don'ts", key: "dos-donts" },
    { title: "Health Records", key: "health-records" },
    { title: "Announcements", key: "announcements" },
    { title: "Statistics", key: "statistics" },
  ];

  const renderContent = () => {
    switch (activePage) {
      case "pregnant-women":
        return <PregnantWomenList />;
      case "schedule":
        return <Schedule />;
      case "dos-donts":
        return <DosAndDonts />;
      case "health-records":
        return <HealthRecords />;
      case "announcements":
        return <Announcements />;
      case "statistics":
        return <Statistics />;
      case "welcome":
      default:
        return (
          <div style={{ padding: "20px" }}>
            <IonText>
              <h2>Welcome, {fullName}!</h2>
              <p>
                This is your BHW dashboard. Here you can manage maternal health
                records, schedules, announcements, and more.
              </p>
              <p>Use the menu to navigate to different sections.</p>
            </IonText>
          </div>
        );
    }
  };

  return (
    <>
      {/* Sidebar Menu */}
      <IonMenu contentId="main">
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>BHW Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {menuItems.map((item) => (
              <IonMenuToggle key={item.key} autoHide={true}>
                <IonItem
                  button
                  onClick={() => setActivePage(item.key)}
                  color={activePage === item.key ? "light" : undefined}
                >
                  {item.title}
                </IonItem>
              </IonMenuToggle>
            ))}
          </IonList>
        </IonContent>
      </IonMenu>

      {/* Main Content */}
      <IonPage id="main">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>
              {activePage === "welcome"
                ? "Dashboard"
                : menuItems.find((m) => m.key === activePage)?.title}
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>{renderContent()}</IonContent>
      </IonPage>
    </>
  );
};

export default DashboardBHW;
