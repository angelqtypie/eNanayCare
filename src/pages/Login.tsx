// src/pages/RoleLogin.tsx
import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonLoading,
  IonCheckbox,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { Heart, Shield, UserCog, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";

const RoleLogin: React.FC = () => {
  const history = useHistory();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState(localStorage.getItem("loginEmail") || "");
  const [password, setPassword] = useState(localStorage.getItem("loginPassword") || "");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
  }, []);

  const roles = [
    {
      key: "mother",
      name: "Mother",
      icon: <Heart className="icon pink" />,
      color: "#ec4899",
      description: "Track your pregnancy progress, appointments, and receive personalized health insights.",
    },
    {
      key: "bhw",
      name: "Barangay Health Worker",
      icon: <Shield className="icon green" />,
      color: "#22c55e",
      description: "Monitor community maternal health, manage mother profiles, and support maternal care programs.",
    },
    {
      key: "admin",
      name: "Admin",
      icon: <UserCog className="icon blue" />,
      color: "#3b82f6",
      description: "Oversee system operations, manage all users, and posting maternal health matrials.",
    },
  ];

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const userId = authData?.user?.id;
      if (!userId) throw new Error("User not found.");

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Profile not found.");
      if (profile.role !== selectedRole)
        throw new Error(`This account is not registered as a ${selectedRole}.`);

      if (rememberMe) {
        localStorage.setItem("loginEmail", email);
        localStorage.setItem("loginPassword", password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("loginEmail");
        localStorage.removeItem("loginPassword");
        localStorage.removeItem("rememberMe");
      }

      localStorage.setItem("userId", userId);
      localStorage.setItem("role", profile.role);
      localStorage.setItem("fullName", profile.full_name);

      if (profile.role === "mother") history.push("/dashboardmother");
      if (profile.role === "bhw") history.push("/dashboardbhw");
      if (profile.role === "admin") history.push("/dashboardadmin");
    } catch (err) {
      setError((err as Error).message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setError("");
  };

  return (
    <IonPage>
      <IonHeader className="sticky-header">
        <IonToolbar>
          <div className="header-container">
            <div className="header-left">
              <img src={logo} alt="eNanayCare Logo" className="logo" />
              <h1 className="app-title">eNanayCare</h1>
            </div>
            <div className="nav-buttons">
              <IonButton fill="clear" color="dark" onClick={() => history.push("/")}>
                Home
              </IonButton>
              <IonButton fill="clear" color="dark" onClick={() => history.push("/login")}>
                Login
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="main-content">
        <style>{`
          .sticky-header {
            --background: white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            position: sticky;
            top: 0;
            z-index: 1000;
          }

          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 16px;
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .logo {
            width: 42px;
            height: 42px;
          }

          .app-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: #ec4899;
          }

          .nav-buttons ion-button {
            margin: 0 4px;
            font-size: 0.9rem;
          }

          .main-content {
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fdf2f8, #eef2ff);
            min-height: calc(100vh - 60px);
            width: 100%;
            overflow-x: hidden;
          }

          .wrapper {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: white;
            width: 100%;
            max-width: 1200px;
            border-radius: 20px;
            box-shadow: 0 6px 24px rgba(0,0,0,0.08);
            padding: 40px 20px;
            margin: 30px auto;
          }

          @media (min-width: 900px) {
            .wrapper {
              flex-direction: row;
              justify-content: space-evenly;
              align-items: center;
              padding: 60px;
              margin: 60px auto;
            }
          }

          .left {
            flex: 1;
            text-align: center;
          }
          .left h1 {
            font-size: 2.0rem;
            font-weight: 800;
            color: #111827;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #6b7280;
            font-size: 1rem;
            margin-bottom: 30px;
          }

          .right {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
          }

          .roles {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
          }

          .role {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 25px;
            cursor: pointer;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          }

          .role:hover {
            transform: scale(1.03);
            box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          }

          .role.selected {
            border: 2px solid var(--color);
          }

          .role h3 {
            margin-top: 10px;
            font-weight: 700;
            color: #111827;
          }

          .role p {
            font-size: 0.9rem;
            color: #4b5563;
          }

          .icon {
            width: 35px;
            height: 35px;
          }
          .icon.pink { color: #ec4899; }
          .icon.green { color: #22c55e; }
          .icon.blue { color: #3b82f6; }

          .login-form {
            text-align: left;
            width: 100%;
            max-width: 400px;
            margin: auto;
            display: flex;
            flex-direction: column;
          }

          .login-form h2 {
            text-align: center;
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 5px;
            color: #111827;
          }

          .login-form p {
            text-align: center;
            font-size: 0.9rem;
            color: #6b7280;
            margin-bottom: 20px;
          }

          .input-item {
            margin-top: 0px;
            --highlight-color-focused: #ec4899;
            position: relative;
          }

          ion-item.input-item ion-label {
            font-size: 1rem;
            color: #374151;
          }

          ion-input {
            font-size: 1rem;
            --padding-start: 10px;
          }

          .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #6b7280;
            transition: color 0.2s;
            z-index: 10;
          }

          .password-toggle:hover {
            color: #111827;
          }

          .remember-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
            font-size: 0.9rem;
            color: #374151;
          }

          .error {
            color: #dc2626;
            text-align: center;
            font-size: 0.9rem;
            margin-top: 8px;
          }

          .login-btn {
            margin-top: 18px;
            border-radius: 14px;
            font-weight: 600;
            color: white;
            --background: var(--color);
          }

          .back-btn {
            cursor: pointer;
            font-size: 0.9rem;
            color: #6b7280;
            margin-bottom: 10px;
          }

          @media (max-width: 768px) {
            .wrapper {
              padding: 30px 16px 60px;
              min-height: 100vh;
            }
            .password-toggle {
              right: 10px;
              top: 55%;
            }
          }
        `}</style>

        <div className="wrapper">
          {!selectedRole ? (
            <>
              <div className="left">
                <h1>Welcome to eNanayCare</h1>
                <p className="subtitle">Choose your role to log in.</p>
              </div>
              <div className="right">
                <div className="roles">
                  {roles.map((role) => (
                    <div
                      key={role.key}
                      className={`role ${selectedRole === role.key ? "selected" : ""}`}
                      style={{ "--color": role.color } as React.CSSProperties}
                      onClick={() => handleRoleSelect(role.key)}
                    >
                      {role.icon}
                      <h3>{role.name}</h3>
                      <p>{role.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="login-form">
              <span className="back-btn" onClick={() => setSelectedRole(null)}>
                ← Back to Role Selection
              </span>

              <h2>{roles.find((r) => r.key === selectedRole)?.name} Login</h2>
              <p>{roles.find((r) => r.key === selectedRole)?.description}</p>

              {/* Email */}
              <IonItem lines="none" className="input-item">
                <IonLabel position="floating">Email</IonLabel>
                <IonInput
                  type="email"
                  value={email}
                  onIonChange={(e) => setEmail(e.detail.value ?? "")}
                />
              </IonItem>

              {/* Password */}
              <IonItem lines="none" className="input-item">
                <IonLabel position="floating">Password</IonLabel>
                <IonInput
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value ?? "")}
                />
                <div
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </div>
              </IonItem>

              <div className="remember-container">
                <IonCheckbox
                  checked={rememberMe}
                  onIonChange={(e) => setRememberMe(e.detail.checked)}
                />
                <span>Remember Me</span>
              </div>

              {error && <p className="error">{error}</p>}

              <IonButton
                expand="block"
                className="login-btn"
                style={{
                  "--color": roles.find((r) => r.key === selectedRole)?.color,
                } as React.CSSProperties}
                onClick={handleLogin}
                disabled={loading}
              >
                Login
              </IonButton>

              <IonLoading isOpen={loading} message="Logging in..." />
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RoleLogin;
