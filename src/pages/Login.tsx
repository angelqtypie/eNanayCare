// /src/pages/Login.tsx
import { useState } from "react";
import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const Login = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState("mother");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return setError(error.message);

      const userId = data?.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          full_name: fullName,
          role,
        });
        localStorage.setItem("role", role);
        history.push(`/Capstone/dashboard${role.toLowerCase()}`);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setError(error.message);

      const userId = data?.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (profile?.role) {
          localStorage.setItem("role", profile.role);
          history.push(`/Capstone/dashboard${profile.role.toLowerCase()}`);
        } else {
          setError("No role found for this user.");
        }
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isSignUp ? "Sign Up" : "Login"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isSignUp && (
          <IonInput
            label="Full Name"
            type="text"
            value={fullName}
            onIonChange={(e) => setFullName(e.detail.value!)}
          />
        )}

        <IonInput
          label="Email"
          type="email"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value!)}
        />

        <IonInput
          label="Password"
          type="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value!)}
        />

        {isSignUp && (
          <IonSelect value={role} onIonChange={(e) => setRole(e.detail.value)}>
            <IonSelectOption value="mother">Mother</IonSelectOption>
            <IonSelectOption value="bhw">BHW</IonSelectOption>
          </IonSelect>
        )}

        {error && <IonText color="danger">{error}</IonText>}

        <IonButton expand="block" onClick={handleSubmit}>
          {isSignUp ? "Create Account" : "Login"}
        </IonButton>

        <IonButton fill="clear" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;
