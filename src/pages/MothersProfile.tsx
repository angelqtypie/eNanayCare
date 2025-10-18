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
import { logOutOutline, personCircleOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import MotherMainLayout from "../layouts/MotherMainLayout";
import { motion } from "framer-motion";

const MothersProfile: React.FC = () => {
  const history = useHistory();
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") === "true"
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "Nanay";

  useEffect(() => {
    if (!userId) {
      setError("User not logged in");
      return;
    }
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      if (!userId) return;

      // Fetch mother_id using user_id (not auth_user_id)
      const { data: mother, error: motherError } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", userId)
        .single();

      if (motherError || !mother) {
        setError("Mother record not found");
        return;
      }
      const motherId = mother.mother_id;

      // Fetch nickname and profile image using mother_id
      const { data, error } = await supabase
        .from("mother_settings")
        .select("nickname, profile_image_url")
        .eq("mother_id", motherId)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }
      if (data) {
        setNickname(data.nickname || "");
        setProfileImage(data.profile_image_url || "");
      }
    } catch (err) {
      console.error("fetchProfile error:", err);
      setError("Failed to fetch profile.");
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return profileImage;
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("mother_profiles")
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      setError("Image upload failed.");
      setToastMsg("Image upload failed.");
      return null;
    }

    const { data } = supabase.storage
      .from("mother_profiles")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const getMotherId = async (userId: string) => {
    const { data, error } = await supabase
      .from("mothers")
      .select("mother_id")
      .eq("user_id", userId)
      .single();
    if (error) return null;
    return data?.mother_id || null;
  };

  const saveProfile = async () => {
    setLoading(true);
    setError(null);
    setToastMsg(null);

    try {
      if (!userId) {
        setError("Not logged in.");
        setToastMsg("Not logged in.");
        setLoading(false);
        return;
      }
      const motherId = await getMotherId(userId);
      if (!motherId) {
        setError("Mother record not found.");
        setToastMsg("Mother record not found.");
        setLoading(false);
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
        console.error("Upsert Error:", error);
        setError("Failed to update profile.");
        setToastMsg("Failed to update profile.");
        setLoading(false);
        return;
      }

      localStorage.setItem("darkMode", darkMode.toString());
      localStorage.setItem("notifications", notifications.toString());
      setToastMsg("Profile saved!");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile.");
      setToastMsg("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.clear();
    history.push("/landingpage");
  };

  return (
    <MotherMainLayout>
      <IonHeader>
        <IonToolbar
          style={{
            "--background":
              "linear-gradient(120deg, #f9e0eb, #fbeaf1, #faf2f7)",
            "--color": "#6a3a55",
          }}
        >
          <IonTitle
            style={{
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            Profile Settings
          </IonTitle>
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
                <IonIcon
                  icon={personCircleOutline}
                  className="profile-placeholder"
                />
              )}
              <p className="mother-name">{fullName}</p>
              <p className="nickname">
                {nickname ? `"${nickname}"` : "No nickname set"}
              </p>
            </div>

            <IonItem lines="none" className="input-box">
              <IonLabel position="stacked">Nickname</IonLabel>
              <IonInput
                value={nickname}
                placeholder="Enter nickname"
                onIonChange={(e) => setNickname(e.detail.value!)}
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
            <div className="button-group">
              <IonButton
                expand="block"
                color="success"
                onClick={saveProfile}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Profile"}
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
            color={error ? "danger" : "success"}
            onDidDismiss={() => {
              setToastMsg(null);
              setError(null);
            }}
          />
        </motion.div>

        <style>{`
          .profile-container {
            background: #fff8fb;
            min-height: 100vh;
            padding: 20px 15px 80px;
            font-family: 'Poppins', sans-serif;
            display: flex;
            justify-content: center;
          }

          .profile-card {
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 6px 18px rgba(241, 167, 194, 0.35);
            border-radius: 20px;
            padding: 25px;
            width: 100%;
            max-width: 420px;
            text-align: center;
            backdrop-filter: blur(8px);
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
            box-shadow: 0 4px 12px rgba(241, 167, 194, 0.35);
            border: 3px solid #f1a7c2;
          }

          .profile-placeholder {
            font-size: 110px;
            color: #f1a7c2;
          }

          .mother-name {
            font-weight: 600;
            color: #d5649f;
            margin-top: 10px;
          }

          .nickname {
            color: #999;
            font-size: 0.9rem;
          }

          .input-box {
            background: #fff;
            margin: 10px 0;
            border-radius: 14px;
            box-shadow: 0 3px 10px rgba(241, 167, 194, 0.25);
            padding: 5px 10px;
          }

          .input-box ion-label {
            color: #d5649f;
            font-weight: 500;
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
            box-shadow: 0 3px 10px rgba(241, 167, 194, 0.25);
            padding: 10px;
          }

          .toggles ion-item {
            --inner-padding-end: 0;
          }

          .button-group {
            margin-top: 20px;
          }

          .logout-btn {
            color: #d5649f;
            font-weight: 500;
            margin-top: 10px;
          }

          .logout-btn ion-icon {
            margin-right: 4px;
          }

          @media (max-width: 400px) {
            .profile-card {
              padding: 18px;
            }
            .profile-img {
              width: 95px;
              height: 95px;
            }
          }
        `}</style>
      </IonContent>
    </MotherMainLayout>
  );
};

export default MothersProfile;
