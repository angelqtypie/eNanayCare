import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from "@ionic/react";
import {
  peopleOutline,
  calendarOutline,
  notificationsOutline,
  documentTextOutline,
} from "ionicons/icons";

import MainLayout from "../layouts/MainLayouts"
import "./DashboardBHW.css";

const DashboardBHW: React.FC = () => {
  return (
    <MainLayout>
      <h1 className="dashboard-title">Welcome, BHW Admin</h1>
      <p className="dashboard-sub">
        Manage and monitor maternal health with ease.
      </p>

      <div className="card-grid">
        <IonCard className="dash-card">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={peopleOutline} /> Mothers
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>52</strong> mothers registered</p>
          </IonCardContent>
        </IonCard>

        <IonCard className="dash-card">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={calendarOutline} /> Appointments
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>No appointments scheduled yet.</p>
          </IonCardContent>
        </IonCard>

        <IonCard className="dash-card">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={notificationsOutline} /> Reminders
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>No reminders set yet.</p>
          </IonCardContent>
        </IonCard>

        <IonCard className="dash-card">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={documentTextOutline} /> DOH Guidelines
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Access DOH reference for maternal care.</p>
          </IonCardContent>
        </IonCard>
      </div>
    </MainLayout>
  );
};

export default DashboardBHW;
