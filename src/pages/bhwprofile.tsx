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
} from "@ionic/react";
import { personCircleOutline, logOutOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MainLayout from "../layouts/MainLayouts";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";

const BhwProfile: React.FC = () => {
  const history = useHistory();
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  /** Fetch user or mother settings data */
  const fetchProfile = async () => {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, full_name, role")
      .eq("id", userId)
      .single();

    if (userError || !user) return;

    setFullName(user.full_name);
    setRole(user.role);

    // If mother, fetch mother_settings too
    if (user.role === "mother") {
      const { data: mother } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", user.id)
        .single();

      if (mother) {
        const { data: settings } = await supabase
          .from("mother_settings")
          .select("nickname, profile_image_url")
          .eq("mother_id", mother.mother_id)
          .single();

        if (settings) {
          setNickname(settings.nickname || "");
          setProfileImage(settings.profile_image_url || "");
        }
      }
    } else {
      // For bhw/admin users
      const { data } = await supabase
        .from("users")
        .select("profile_image_url")
        .eq("id", userId)
        .single();

      if (data) setProfileImage(data.profile_image_url || "");
    }
  };

  /** Upload to Supabase Storage */
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

  /** Save profile update (for both mother and bhw) */
  const saveProfile = async () => {
    const imageUrl = await uploadImage();
    if (!imageUrl && imageFile) {
      setToastMsg("Image upload failed.");
      return;
    }

    try {
      // Always update users table (for full_name)
      const { error: userErr } = await supabase
        .from("users")
        .update({ full_name: fullName })
        .eq("id", userId);

      if (userErr) throw userErr;

      // If mother, also update mother_settings table
      if (role === "mother") {
        const { data: mother } = await supabase
          .from("mothers")
          .select("mother_id")
          .eq("user_id", userId)
          .single();

        if (mother) {
          const { error: settingsErr } = await supabase
            .from("mother_settings")
            .upsert(
              {
                mother_id: mother.mother_id,
                nickname,
                profile_image_url: imageUrl,
              },
              { onConflict: "mother_id" }
            );

          if (settingsErr) throw settingsErr;
        }
      } else {
        // For bhw or admin users
        await supabase
          .from("users")
          .update({ profile_image_url: imageUrl })
          .eq("id", userId);
      }

      setToastMsg("Profile updated successfully!");
    } catch (e) {
      console.error(e);
      setToastMsg("Failed to save profile.");
    }
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
              {role === "mother" && <p className="profile-role">Mother</p>}
              {role === "bhw" && <p className="profile-role">Barangay Health Worker</p>}
            </div>

            <IonItem lines="none" className="input-box">
              <IonLabel position="stacked">Full Name</IonLabel>
              <IonInput
                value={fullName}
                placeholder="Enter full name"
                onIonChange={(e) => setFullName(e.detail.value!)}
              />
            </IonItem>

            {role === "mother" && (
              <IonItem lines="none" className="input-box">
                <IonLabel position="stacked">Nickname</IonLabel>
                <IonInput
                  value={nickname}
                  placeholder="Enter nickname"
                  onIonChange={(e) => setNickname(e.detail.value!)}
                />
              </IonItem>
            )}

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
