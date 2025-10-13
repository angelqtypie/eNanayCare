import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonToast,
  IonToggle,
} from "@ionic/react";
import {
  logOutOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import MotherMainLayout from "../layouts/MotherMainLayout";

const MothersProfile: React.FC = () => {
  const history = useHistory();
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") === "true"
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = localStorage.getItem("userId"); // auth user id
  const fullName = localStorage.getItem("fullName") || "Nanay";

  useEffect(() => {
    if (!userId) {
      setError("User not logged in");
      return;
    }
    fetchProfile();
  }, [userId]);

  // 🔹 Fetch profile data (nickname + image)
  const fetchProfile = async () => {
    try {
      const { data: mother, error: motherError } = await supabase
        .from("mothers")
        .select("id")
        .eq("auth_user_id", userId)
        .single();

      if (motherError || !mother) {
        console.warn("No mother record found for this user");
        return;
      }

      const motherId = mother.id;

      const { data, error } = await supabase
        .from("mother_settings")
        .select("nickname, profile_image_url")
        .eq("mother_id", motherId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.warn("fetchProfile warning:", error.message);
        return;
      }

      if (data) {
        setNickname(data.nickname || "");
        setProfileImage(data.profile_image_url || "");
      }
    } catch (err) {
      console.error("fetchProfile error:", err);
    }
  };

  // 🔹 Upload image to Supabase storage bucket (mother_profiles)
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return profileImage;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`; // Each mother has a folder

    const { error: uploadError } = await supabase.storage
      .from("mother_profiles")
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      console.error("uploadImage error:", uploadError.message);
      setToastMsg("Image upload failed.");
      return null;
    }

    const { data } = supabase.storage
      .from("mother_profiles")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // 🔹 Get real mother_id from mothers table
  const getMotherId = async (userId: string) => {
    const { data, error } = await supabase
      .from("mothers")
      .select("id")
      .eq("auth_user_id", userId)
      .single();

    if (error) {
      console.error("getMotherId error:", error.message);
      return null;
    }

    return data?.id || null;
  };

  // 🔹 Save nickname + profile image only
  const saveProfile = async () => {
    try {
      if (!userId) {
        setToastMsg("Not logged in.");
        return;
      }

      const motherId = await getMotherId(userId);
      if (!motherId) {
        setToastMsg("Mother record not found.");
        return;
      }

      const imageUrl = await uploadImage();

      const updates = {
        mother_id: motherId,
        nickname: nickname || null,
        profile_image_url: imageUrl || null,
      };

      const { error } = await supabase.from("mother_settings").upsert(updates);

      if (error) {
        console.error("saveProfile error:", error.message);
        setToastMsg("Failed to update profile.");
        return;
      }

      // 🔹 Local-only settings
      localStorage.setItem("darkMode", darkMode.toString());
      localStorage.setItem("notifications", notifications.toString());

      setToastMsg("Profile saved!");
    } catch (err) {
      console.error("saveProfile exception:", err);
      setToastMsg("Failed to save profile.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setSidebarOpen(false);
    history.push("/landingpage");
  };

  return (
    <MotherMainLayout>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <IonItem lines="full">
          <IonLabel position="stacked">Nickname</IonLabel>
          <IonInput
            value={nickname}
            placeholder="Enter nickname"
            onIonChange={(e) => setNickname(e.detail.value!)}
          />
        </IonItem>

        <IonItem lines="full">
          <IonLabel position="stacked">Profile Photo</IonLabel>
          {profileImage && (
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                margin: "10px auto",
                display: "block",
              }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </IonItem>

        <IonItem lines="full">
          <IonLabel>Notifications</IonLabel>
          <IonToggle
            checked={notifications}
            onIonChange={(e) => setNotifications(e.detail.checked)}
          />
        </IonItem>

        <IonItem lines="full">
          <IonLabel>Dark Mode</IonLabel>
          <IonToggle
            checked={darkMode}
            onIonChange={(e) => setDarkMode(e.detail.checked)}
          />
        </IonItem>

        <div style={{ padding: 16 }}>
          <IonButton expand="block" color="success" onClick={saveProfile}>
            Save Changes
          </IonButton>
          <IonButton
                className="logout-btn"
                color="medium"
                fill="clear"
                onClick={handleLogout}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Logout
              </IonButton>
        </div>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg ?? ""}
          duration={2000}
          color="success"
          onDidDismiss={() => setToastMsg(null)}
        />
      </IonContent>
    </MotherMainLayout>
  );
};

export default MothersProfile;
