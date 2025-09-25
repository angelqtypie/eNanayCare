import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import {
  peopleOutline,
  calendarOutline,
  notificationsOutline,
  documentTextOutline,
} from "ionicons/icons";

import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";
import "./DashboardBHW.css";

const DashboardBHW: React.FC = () => {
  const [motherCount, setMotherCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMotherCount = async () => {
      try {
        const { count, error } = await supabase
          .from("mothers")
          .select("*", { count: "exact", head: true });

        if (error) throw error;
        setMotherCount(count ?? 0);
      } catch (err) {
        console.error("Error fetching mother count:", err);
        setMotherCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMotherCount();
  }, []);

  return (
    <MainLayout>
      <h1 className="dashboard-title">Welcome, BHW Admin</h1>
      <p className="dashboard-sub">
        Manage and monitor maternal health with ease.
      </p>

      <div className="card-grid">
        {/* Mothers */}
        <IonCard className="dash-card">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={peopleOutline} /> Mothers
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {loading ? (
              <IonSpinner name="dots" />
            ) : (
              <p>
                <strong>{motherCount}</strong> mothers registered
              </p>
            )}
          </IonCardContent>
        </IonCard>

        {/* Appointments */}
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

        {/* Reminders */}
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

        {/* DOH Guidelines */}
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
