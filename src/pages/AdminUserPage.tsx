// src/pages/ManageUsers.tsx
import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonModal,
  IonCard,
  IonToggle,
} from "@ionic/react";
import { addOutline, peopleOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import AdminMainLayout from "../layouts/AdminLayout";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "bhw" | "mother";
  created_at: string;
  status: string;
  zone?: string | null;
}

interface Mother {
  mother_id: string;
  user_id: string | null;
  address: string | null;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "mother",
    password: "",
    zone: "",
  });

  const fetchUsersAndMothers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, full_name, role, created_at, status, zone")
        .order("created_at", { ascending: false });

      const { data: mothersData, error: mothersError } = await supabase
        .from("mothers")
        .select("mother_id, user_id, address");

      if (usersError) throw usersError;
      if (mothersError) throw mothersError;

      const updatedUsers: User[] =
        usersData?.map((user: User) => {
          const motherInfo = mothersData?.find(
            (m: Mother) => m.user_id === user.id
          );
          return {
            ...user,
            zone:
              user.role === "mother" && motherInfo?.address
                ? motherInfo.address
                : user.zone || "-",
          };
        }) || [];

      setUsers(updatedUsers);
      setMothers(mothersData || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUsersAndMothers();
  }, []);

  const handleAddUser = async () => {
    setError("");
    const { email, full_name, role, password, zone } = newUser;
    if (!email || !full_name || !role || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const body = { email, full_name, role, password, zone };
      const res = await fetch(import.meta.env.VITE_SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create user.");
      alert("✅ User created successfully.");
      setShowModal(false);
      setNewUser({
        email: "",
        full_name: "",
        role: "mother",
        password: "",
        zone: "",
      });
      fetchUsersAndMothers();
    } catch (err) {
      setError("❌ Failed: " + (err as Error).message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      fetchUsersAndMothers();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  return (
    <AdminMainLayout>
      <IonContent
        className="ion-padding"
        style={{
          backgroundColor: "#f1f5f9",
          minHeight: "100vh",
          padding: "40px 60px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "35px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <IonIcon icon={peopleOutline} color="primary" />
              Manage Users
            </h1>
            <p style={{ color: "#64748b", marginTop: 4 }}>
              View, add, or manage user access.
            </p>
          </div>

          <IonButton
            color="primary"
            onClick={() => setShowModal(true)}
            style={{
              borderRadius: "10px",
              padding: "0 20px",
              fontWeight: 500,
              boxShadow: "0 4px 8px rgba(37, 99, 235, 0.3)",
            }}
          >
            <IonIcon icon={addOutline} slot="start" />
            Add User
          </IonButton>
        </div>

        {/* Users Table */}
        <IonCard
          style={{
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 25px rgba(0,0,0,0.06)",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            padding: "10px 0",
          }}
        >
          <div style={{ padding: "0 25px 15px 25px", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 8px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    color: "#475569",
                    textAlign: "left",
                    fontWeight: 600,
                  }}
                >
                  <th style={{ padding: "14px 20px" }}>Name</th>
                  <th style={{ padding: "14px 20px" }}>Email</th>
                  <th style={{ padding: "14px 20px" }}>Role</th>
                  <th style={{ padding: "14px 20px" }}>Zone</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                  <th style={{ padding: "14px 20px" }}>Created</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#ffffff")
                    }
                  >
                    <td
                      style={{
                        padding: "14px 20px",
                        fontWeight: 500,
                        color: "#0f172a",
                      }}
                    >
                      {u.full_name}
                    </td>
                    <td style={{ padding: "14px 20px", color: "#334155" }}>
                      {u.email}
                    </td>
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
                      {u.zone || "-"}
                    </td>
                    <td style={{ padding: "14px 20px", color: "#475569" }}>
                      <IonToggle
                        checked={u.status === "active"}
                        onIonChange={() => handleToggleStatus(u.id, u.status)}
                        color="success"
                      />
                    </td>
                    <td style={{ padding: "14px 20px", color: "#475569" }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </IonCard>

        {/* ✅ Add User Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonContent
            style={{
              padding: "25px",
              background: "#fff",
              borderRadius: "16px",
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
                  setNewUser({
                    ...newUser,
                    full_name: e.detail.value || "",
                  })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Email</IonLabel>
              <IonInput
                type="email"
                value={newUser.email}
                onIonChange={(e) =>
                  setNewUser({ ...newUser, email: e.detail.value || "" })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Password</IonLabel>
              <IonInput
                type="password"
                value={newUser.password}
                onIonChange={(e) =>
                  setNewUser({
                    ...newUser,
                    password: e.detail.value || "",
                  })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel>Role</IonLabel>
              <IonSelect
                value={newUser.role}
                onIonChange={(e) => {
                  const selectedRole = e.detail.value;
                  setNewUser({
                    ...newUser,
                    role: selectedRole,
                    zone: selectedRole === "bhw" ? newUser.zone : "",
                  });
                }}
              >
                <IonSelectOption value="admin">Admin</IonSelectOption>
                <IonSelectOption value="bhw">BHW</IonSelectOption>
                <IonSelectOption value="mother">Mother</IonSelectOption>
              </IonSelect>
            </IonItem>

            {/* ✅ Zone Dropdown only if role is BHW */}
            {newUser.role === "bhw" && (
              <IonItem>
                <IonLabel>Zone</IonLabel>
                <IonSelect
                  placeholder="Select Zone"
                  value={newUser.zone}
                  onIonChange={(e) =>
                    setNewUser({ ...newUser, zone: e.detail.value })
                  }
                >
                  <IonSelectOption value="Zone 1">Zone 1</IonSelectOption>
                  <IonSelectOption value="Zone 2">Zone 2</IonSelectOption>
                  <IonSelectOption value="Zone 3">Zone 3</IonSelectOption>
                  <IonSelectOption value="Zone 4">Zone 4</IonSelectOption>
                  <IonSelectOption value="Zone 5">Zone 5</IonSelectOption>
                  <IonSelectOption value="Zone 5">Zone 6</IonSelectOption>
                  <IonSelectOption value="Zone 5">Zone 7</IonSelectOption>
                  <IonSelectOption value="Zone 5">Zone 8</IonSelectOption>
                  <IonSelectOption value="Zone 5">Zone 9</IonSelectOption>
                </IonSelect>
              </IonItem>
            )}

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
              <IonButton
                expand="block"
                color="medium"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </AdminMainLayout>
  );
};

export default ManageUsers;
