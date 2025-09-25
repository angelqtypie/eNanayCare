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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      // ✅ Login with Supabase Auth
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError || !data?.user) {
        setError("Invalid credentials");
        return;
      }

      // ✅ Fetch BHW profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("auth_user_id", data.user.id)
        .single();

      if (profileError || !profile || profile.role !== "bhw") {
        setError("You are not authorized as BHW");
        await supabase.auth.signOut();
        return;
      }

      // ✅ Store in localStorage
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
          label="Email"
          placeholder="Enter your email"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value || "")}
        />
        <IonInput
          label="Password"
          placeholder="Enter your password"
          type="password"
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
