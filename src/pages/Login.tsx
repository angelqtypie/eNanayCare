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

const MotherLogin: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      // ✅ Use Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.user) {
        setError("Invalid email or password");
        return;
      }

      // ✅ Fetch mother record linked to this user
      const { data: mother, error: motherError } = await supabase
        .from("mothers")
        .select("id, name, email")
        .eq("email", email)
        .single();

      if (motherError || !mother) {
        setError("Mother account not found");
        await supabase.auth.signOut();
        return;
      }

      // ✅ Store info in localStorage
      localStorage.setItem("mother_email", mother.email);
      localStorage.setItem("mother_name", mother.name);

      history.push("/Capstone/dashboardmother");
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mother Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonInput
          label="Email"
          placeholder="Enter your email"
          type="email"
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

export default MotherLogin;
