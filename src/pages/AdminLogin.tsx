// FILE: src/pages/AdminLogin.tsx
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

const AdminLogin: React.FC = () => {
  const history = useHistory();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!fullName || !password) {
      setError("Please enter both fullname and password");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("full_name", fullName.trim()) // ✅ trim spaces
        .eq("password", password.trim())
        .maybeSingle(); // ✅ safer than .single()

      if (profileError || !profile) {
        setError("Invalid fullname or password");
        return;
      }

      if (profile.role !== "bhw") {
        setError("You are not authorized as BHW");
        return;
      }

      // ✅ Store immediately
      localStorage.setItem("role", profile.role);
      localStorage.setItem("full_name", profile.full_name);
      localStorage.setItem("bhw_id", profile.id.toString());

      // ✅ Force redirect instantly (no 2nd click needed)
      history.replace("/Capstone/dashboardbhw");
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
          <IonTitle>BHW Admin Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonInput
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onIonInput={(e) => setFullName(e.detail.value ?? "")} // ✅ use onIonInput
        />
        <IonInput
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onIonInput={(e) => setPassword(e.detail.value ?? "")} // ✅ use onIonInput
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

export default AdminLogin;
