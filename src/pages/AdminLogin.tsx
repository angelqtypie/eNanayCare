// FILE: src/pages/BHWLogin.tsx
import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonText,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLoading,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const BHWLogin: React.FC = () => {
  const history = useHistory();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");

      if (!fullName.trim() || !password.trim()) {
        setError("Full name and password are required");
        return;
      }

      setLoading(true);

      // Fetch profile by full_name
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, full_name, password")
        .eq("full_name", fullName.trim())
        .single();

      if (profileError || !profile) {
        setError("No BHW found with this name");
        return;
      }

      if (profile.role !== "bhw") {
        setError("You are not authorized as BHW");
        return;
      }

      // Check password (plain text for now — use bcrypt in production!)
      if (profile.password !== password.trim()) {
        setError("Invalid password");
        return;
      }

      // Save session manually
      localStorage.setItem("role", profile.role);
      localStorage.setItem("full_name", profile.full_name);
      localStorage.setItem("bhw_id", profile.id);

      history.push("/Capstone/dashboardbhw");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>BHW Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonInput
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onIonChange={(e) => setFullName(e.detail.value || "")}
        />
        <IonInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value || "")}
        />

        {error && <IonText color="danger">{error}</IonText>}

        <IonButton expand="block" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </IonButton>

        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default BHWLogin;
