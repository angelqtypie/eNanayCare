import React, { useEffect, useState } from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem, IonLabel, IonButton, IonToast } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

const MotherProfile: React.FC = () => {
  const userId = localStorage.getItem("userId");
  const [profile, setProfile] = useState<any>({});
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("mothers").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  };

  const handleSave = async () => {
    await supabase.from("mothers").update(profile).eq("id", userId);
    setToast(true);
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Edit Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Full Name</IonLabel>
          <IonInput value={profile.full_name || ""} onIonChange={(e) => setProfile({ ...profile, full_name: e.detail.value! })} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Address</IonLabel>
          <IonInput value={profile.address || ""} onIonChange={(e) => setProfile({ ...profile, address: e.detail.value! })} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Contact Number</IonLabel>
          <IonInput value={profile.contact_number || ""} onIonChange={(e) => setProfile({ ...profile, contact_number: e.detail.value! })} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Expected Delivery Date</IonLabel>
          <IonInput type="date" value={profile.expected_delivery || ""} onIonChange={(e) => setProfile({ ...profile, expected_delivery: e.detail.value! })} />
        </IonItem>

        <IonButton expand="block" color="success" onClick={handleSave}>Save Changes</IonButton>

        <IonToast isOpen={toast} message="Profile updated successfully!" duration={2000} onDidDismiss={() => setToast(false)} />
      </IonContent>
    </IonPage>
  );
};

export default MotherProfile;
