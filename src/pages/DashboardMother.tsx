import React, { useState, useEffect } from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonToast,
} from "@ionic/react";

import {
  calendarOutline,
  bookOutline,
  heartOutline,
  notificationsOutline,
} from "ionicons/icons";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import MotherMainLayout from "../layouts/MotherMainLayout";
import "./MamaDashboard.css";

const MotherHomeDashboard: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [pregnancyMonth, setPregnancyMonth] = useState<number>(1);

  useEffect(() => {
    setPregnancyMonth(4);
  }, []);

  const handleReminderClick = () => {
    setShowToast(true);
  };

  return (
    <MotherMainLayout title="eNanayCare">
      <div className="dashboard-wrapper">
        {/* Banner */}
        <section className="welcome-banner gradient-banner">
          <div className="banner-text">
            <h2>Hi, Mama! 👋</h2>
            <p>
              You’re doing amazing. Month {pregnancyMonth} already—keep going! ❤️
            </p>
          </div>
          <img
            src="/assets/mama-avatar.svg"
            alt="Mama Avatar"
            className="avatar"
          />
          <div className="banner-wave"></div>
        </section>

        {/* Progress Section */}
        <section className="progress-section">
          <h1 className="section-title">Pregnancy Progress</h1>
          <div className="progress-circle-wrapper">
            <div className="progress-circle">
              <CircularProgressbar
                value={(pregnancyMonth / 9) * 100}
                text={`${pregnancyMonth}/9`}
                styles={buildStyles({
                  textColor: "#c2185b",
                  pathColor: "#e91e63",
                  trailColor: "#f8bbd0",
                  textSize: "16px",
                })}
              />
            </div>
          </div>
          <p className="progress-text">
            Every checkup and log brings you closer to your little one 💕
          </p>
        </section>

        {/* Core Feature Cards */}
        <IonGrid>
          <IonRow>
            <IonCol size="6" sizeMd="3">
              <IonCard
                button
                routerLink="/appointments"
                className="pastel-card pink-card hover-card"
              >
                <IonCardHeader>
                  <div className="circle-icon">
                    <IonIcon icon={calendarOutline} />
                  </div>
                  <IonCardTitle>Appointments</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>Upcoming checkups & reminders</IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6" sizeMd="3">
              <IonCard
                button
                onClick={handleReminderClick}
                className="pastel-card purple-card hover-card"
              >
                <IonCardHeader>
                  <div className="circle-icon">
                    <IonIcon icon={notificationsOutline} />
                  </div>
                  <IonCardTitle>Reminders</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>We’ll ping you for important events</IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6" sizeMd="3">
              <IonCard
                button
                routerLink="/pregnancy-booklet"
                className="pastel-card teal-card hover-card"
              >
                <IonCardHeader>
                  <div className="circle-icon">
                    <IonIcon icon={bookOutline} />
                  </div>
                  <IonCardTitle>Pregnancy Guide</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>Monthly tips & DOH-approved info</IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6" sizeMd="3">
              <IonCard
                button
                routerLink="/wellness-log"
                className="pastel-card pink-card hover-card"
              >
                <IonCardHeader>
                  <div className="circle-icon">
                    <IonIcon icon={heartOutline} />
                  </div>
                  <IonCardTitle>Wellness Log</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>Track weight, symptoms, baby kicks</IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Reminder set! We'll notify you ❤️"
        duration={2000}
        color="success"
      />
    </MotherMainLayout>
  );
};

export default MotherHomeDashboard;
