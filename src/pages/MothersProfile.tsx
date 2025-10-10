import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonTextarea,
  IonToast,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

const MothersProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem("userId");
  const fullName = (localStorage.getItem("fullName") || "Nanay").trim() || "Nanay";

  useEffect(() => {
    if (!userId) {
      setError("User not logged in");
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error: pErr } = await supabase
        .from("mothers")
        .select("*")
        .eq("id", userId)
        .single();

      if (pErr && pErr.code !== "PGRST116") {
        console.warn("fetchProfile warning:", pErr.message || pErr);
      }
      if (data) setProfile(data);
    } catch (err) {
      console.error("fetchProfile error:", err);
    }
  };

  const saveProfile = async () => {
    try {
      if (!userId) {
        setToastMsg("You must be logged in to save profile.");
        return;
      }

      const updates = {
        id: userId,
        full_name: profile.full_name ?? fullName,
        address: profile.address ?? null,
        contact_number: profile.contact_number ?? null,
        expected_delivery: profile.expected_delivery ?? null,
        notes: profile.notes ?? null,
      };

      const { error: upErr } = await supabase.from("mothers").upsert(updates);

      if (upErr) {
        console.error("saveProfile error:", upErr);
        setToastMsg("Failed to save profile.");
        return;
      }

      setToastMsg("Profile saved.");
      if (updates.full_name) localStorage.setItem("fullName", updates.full_name);
    } catch (err) {
      console.error("saveProfile exception:", err);
      setToastMsg("Failed to save profile.");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-toolbar">
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content">
        {error && <p style={{ color: "var(--ion-color-danger)" }}>{error}</p>}

        <div style={{ marginBottom: 12 }}>
          <h3>Hello, {profile.full_name ?? fullName}</h3>
        </div>

        <IonItem>
          <IonLabel position="stacked">Full Name</IonLabel>
          <IonInput value={profile.full_name ?? fullName} onIonChange={(e) => setProfile({ ...profile, full_name: e.detail.value })} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Address</IonLabel>
          <IonInput value={profile.address ?? ""} onIonChange={(e) => setProfile({ ...profile, address: e.detail.value })} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Contact Number</IonLabel>
          <IonInput value={profile.contact_number ?? ""} onIonChange={(e) => setProfile({ ...profile, contact_number: e.detail.value })} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Expected Delivery Date</IonLabel>
          <IonInput type="date" value={profile.expected_delivery ?? ""} onIonChange={(e) => setProfile({ ...profile, expected_delivery: e.detail.value })} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Notes</IonLabel>
          <IonTextarea value={profile.notes ?? ""} onIonChange={(e) => setProfile({ ...profile, notes: e.detail.value })} />
        </IonItem>

        <div style={{ padding: 16 }}>
          <IonButton expand="block" color="success" onClick={saveProfile}>Save Profile</IonButton>
        </div>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg ?? ""}
          duration={2000}
          color="success"
          onDidDismiss={() => setToastMsg(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default MothersProfile;
