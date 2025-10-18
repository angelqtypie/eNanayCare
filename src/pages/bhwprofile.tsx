// File: src/pages/BhwProfile.tsx
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
import { personCircleOutline, logOutOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MainLayout from "../layouts/MainLayouts";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";

const BhwProfile: React.FC = () => {
  const history = useHistory();
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") === "true"
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("full_name, profile_image_url")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setFullName(data.full_name);
      setProfileImage(data.profile_image_url || "");
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return profileImage;
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("bhw_profiles")
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      setToastMsg("Image upload failed.");
      return null;
    }

    const { data } = supabase.storage
      .from("bhw_profiles")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const saveProfile = async () => {
    const imageUrl = await uploadImage();
    const { error } = await supabase
      .from("users")
      .update({ full_name: fullName, profile_image_url: imageUrl })
      .eq("id", userId);

    if (error) {
      setToastMsg("Failed to save profile.");
      return;
    }

    localStorage.setItem("full_name", fullName);
    localStorage.setItem("darkMode", darkMode.toString());
    localStorage.setItem("notifications", notifications.toString());
    setToastMsg("Profile updated successfully!");
  };

  const handleLogout = () => {
    localStorage.clear();
    history.push("/landingpage");
  };

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar
          style={{
            "--background": "linear-gradient(120deg, #e9efff, #f4f8ff)",
            "--color": "#3451b2",
          }}
        >
          <IonTitle style={{ fontWeight: "bold" }}>Profile Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="profile-container"
        >
          <div className="profile-card">
            <div className="profile-header">
              {profileImage ? (
                <motion.img
                  src={profileImage}
                  alt="Profile"
                  className="profile-img"
                  whileHover={{ scale: 1.05 }}
                />
              ) : (
                <IonIcon icon={personCircleOutline} className="profile-placeholder" />
              )}
              <p className="profile-name">{fullName}</p>
              <p className="profile-role">Barangay Health Worker</p>
            </div>

            <IonItem lines="none" className="input-box">
              <IonLabel position="stacked">Full Name</IonLabel>
              <IonInput
                value={fullName}
                placeholder="Enter full name"
                onIonChange={(e) => setFullName(e.detail.value!)}
              />
            </IonItem>

            <IonItem lines="none" className="input-box">
              <IonLabel position="stacked">Profile Photo</IonLabel>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="file-input"
              />
            </IonItem>

            <div className="toggles">
              <IonItem lines="none">
                <IonLabel>Notifications</IonLabel>
                <IonToggle
                  checked={notifications}
                  onIonChange={(e) => setNotifications(e.detail.checked)}
                />
              </IonItem>
              <IonItem lines="none">
                <IonLabel>Dark Mode</IonLabel>
                <IonToggle
                  checked={darkMode}
                  onIonChange={(e) => setDarkMode(e.detail.checked)}
                />
              </IonItem>
            </div>

            <div className="button-group">
              <IonButton expand="block" color="primary" onClick={saveProfile}>
                Save Profile
              </IonButton>
              <IonButton
                expand="block"
                color="medium"
                fill="clear"
                className="logout-btn"
                onClick={handleLogout}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Logout
              </IonButton>
            </div>
          </div>

          <IonToast
            isOpen={!!toastMsg}
            message={toastMsg ?? ""}
            duration={2000}
            color="success"
            onDidDismiss={() => setToastMsg(null)}
          />
        </motion.div>

        <style>{`
          .profile-container {
            background: #f8faff;
            min-height: 100vh;
            padding: 20px 15px 80px;
            font-family: 'Poppins', sans-serif;
            display: flex;
            justify-content: center;
          }

          .profile-card {
            background: white;
            box-shadow: 0 6px 18px rgba(145, 158, 217, 0.25);
            border-radius: 20px;
            padding: 25px;
            width: 100%;
            max-width: 420px;
            text-align: center;
          }

          .profile-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
          }

          .profile-img {
            width: 110px;
            height: 110px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #3451b2;
          }

          .profile-placeholder {
            font-size: 110px;
            color: #7890d5;
          }

          .profile-name {
            font-weight: 600;
            color: #3451b2;
            margin-top: 10px;
          }

          .profile-role {
            color: #666;
            font-size: 0.9rem;
          }

          .input-box {
            background: #fff;
            margin: 10px 0;
            border-radius: 14px;
            box-shadow: 0 3px 10px rgba(145, 158, 217, 0.15);
            padding: 5px 10px;
          }

          .file-input {
            width: 100%;
            padding: 6px 0;
            color: #555;
          }

          .toggles {
            margin-top: 15px;
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 3px 10px rgba(145, 158, 217, 0.15);
            padding: 10px;
          }

          .button-group {
            margin-top: 20px;
          }

          .logout-btn {
            color: #3451b2;
            font-weight: 500;
            margin-top: 10px;
          }
        `}</style>
      </IonContent>
    </MainLayout>
  );
};

export default BhwProfile;
