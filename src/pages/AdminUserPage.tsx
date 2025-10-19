import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonCard,
  IonSelect,
  IonSelectOption,
  IonText,
} from "@ionic/react";
import { logOutOutline, addOutline, trashOutline, peopleOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import AdminMainLayout from "../layouts/AdminLayout";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const ManageUsers: React.FC = () => {
  const history = useHistory();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "mother",
    password: "",
  });

  const safeParseJSON = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(text || "Invalid server response");
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch users error:", error);
    else setUsers(data || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    history.push("/landingpage");
  };

  const handleAddUser = async () => {
    setError("");

    const { email, full_name, role, password } = newUser;

    if (!email || !full_name || !role || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(import.meta.env.VITE_SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(newUser),
      });

      const result = await safeParseJSON(res);
      if (!res.ok) throw new Error(result?.error || "Request failed");

      alert("✅ User created successfully.");
      setShowModal(false);
      setNewUser({ email: "", full_name: "", role: "mother", password: "" });
      fetchUsers();
    } catch (err) {
      setError("❌ Failed: " + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(import.meta.env.VITE_SUPABASE_DELETE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ user_id: id }),
      });

      const result = await safeParseJSON(res);
      if (!res.ok) throw new Error(result?.error || "Request failed");

      alert("✅ User deleted!");
      fetchUsers();
    } catch (err) {
      alert("❌ Failed: " + (err as Error).message);
    }
  };

  return (
    <AdminMainLayout>
      <IonContent
        className="ion-padding"
        style={{
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
          padding: "40px 60px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "35px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <IonIcon icon={peopleOutline} color="primary" />
              Manage Users
            </h1>
            <p style={{ color: "#64748b", marginTop: 4 }}>
              View, add, or remove users.
            </p>
          </div>

          <IonButton
            color="primary"
            onClick={() => setShowModal(true)}
            style={{
              borderRadius: "10px",
              padding: "0 20px",
              fontWeight: 500,
            }}
          >
            <IonIcon icon={addOutline} slot="start" />
            Add User
          </IonButton>
        </div>

        {/* USERS TABLE */}
        <IonCard
  style={{
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 25px rgba(0,0,0,0.06)",
    padding: "10px 0",
    overflow: "hidden",
    border: "1px solid #f1f5f9",
  }}
>
  <div style={{ padding: "0 25px 15px 25px" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: "0 8px",
      }}
    >
      <thead>
        <tr style={{ background: "#f8fafc", color: "#475569", textAlign: "left", fontWeight: 600 }}>
          <th style={{ padding: "14px 20px", borderRadius: "10px 0 0 10px" }}>Name</th>
          <th style={{ padding: "14px 20px" }}>Email</th>
          <th style={{ padding: "14px 20px" }}>Role</th>
          <th style={{ padding: "14px 20px" }}>Created</th>
          <th style={{ padding: "14px 20px", textAlign: "center", borderRadius: "0 10px 10px 0" }}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((u, i) => (
          <tr
            key={u.id}
            style={{
              background: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              borderRadius: "12px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            <td style={{ padding: "14px 20px", fontWeight: 500, color: "#0f172a" }}>{u.full_name}</td>
            <td style={{ padding: "14px 20px", color: "#334155" }}>{u.email}</td>
            <td style={{ padding: "14px 20px" }}>
              <span
                style={{
                  backgroundColor:
                    u.role === "admin"
                      ? "#dcfce7"
                      : u.role === "bhw"
                      ? "#dbeafe"
                      : "#fef9c3",
                  color:
                    u.role === "admin"
                      ? "#166534"
                      : u.role === "bhw"
                      ? "#1d4ed8"
                      : "#854d0e",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {u.role}
              </span>
            </td>
            <td style={{ padding: "14px 20px", color: "#475569" }}>
              {new Date(u.created_at).toLocaleDateString()}
            </td>
            <td style={{ padding: "14px 20px", textAlign: "center" }}>
              <IonButton
                color="danger"
                fill="outline"
                size="small"
                onClick={() => handleDelete(u.id)}
                style={{
                  "--border-color": "#ef4444",
                  "--color": "#ef4444",
                  borderRadius: "8px",
                  fontWeight: 500,
                  height: "30px",
                  "--padding-start": "10px",
                  "--padding-end": "10px",
                }}
              >
                <IonIcon icon={trashOutline} slot="start" />
                Delete
              </IonButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</IonCard>


        {/* ADD USER MODAL */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div
            style={{
              padding: "25px",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              maxWidth: "420px",
              margin: "100px auto",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "20px",
                color: "#0f172a",
                textAlign: "center",
              }}
            >
              Add New User
            </h2>

            <IonItem>
              <IonLabel position="floating">Full Name</IonLabel>
              <IonInput
                value={newUser.full_name}
                onIonChange={(e) =>
                  setNewUser({ ...newUser, full_name: e.detail.value! })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Email</IonLabel>
              <IonInput
                type="email"
                value={newUser.email}
                onIonChange={(e) =>
                  setNewUser({ ...newUser, email: e.detail.value! })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Password</IonLabel>
              <IonInput
                type="password"
                value={newUser.password}
                onIonChange={(e) =>
                  setNewUser({ ...newUser, password: e.detail.value! })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel>Role</IonLabel>
              <IonSelect
                value={newUser.role}
                onIonChange={(e) =>
                  setNewUser({ ...newUser, role: e.detail.value })
                }
              >
                <IonSelectOption value="admin">Admin</IonSelectOption>
                <IonSelectOption value="bhw">BHW</IonSelectOption>
                <IonSelectOption value="mother">Mother</IonSelectOption>
              </IonSelect>
            </IonItem>

            {error && (
              <IonText color="danger">
                <p
                  style={{
                    marginTop: "10px",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </p>
              </IonText>
            )}

            <div style={{ marginTop: "20px" }}>
              <IonButton expand="block" color="success" onClick={handleAddUser}>
                Create User
              </IonButton>
              <IonButton expand="block" color="medium" onClick={() => setShowModal(false)}>
                Cancel
              </IonButton>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </AdminMainLayout>
  );
};

export default ManageUsers;
