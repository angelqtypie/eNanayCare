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
import {
  addOutline,
  chevronDownOutline,
  chevronUpOutline,
  peopleOutline,
} from "ionicons/icons";
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

const AdminUserPage: React.FC = () => {
  const [zonesGrouped, setZonesGrouped] = useState<
    Record<string, { bhws: User[]; mothers: User[] }>
  >({});
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>(
    {}
  );
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "bhw",
    password: "",
    zone: "",
  });

  const fetchUsersAndMothers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, full_name, role, created_at, status, zone");

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

      // 🔹 Allow multiple BHWs per zone
      const grouped: Record<string, { bhws: User[]; mothers: User[] }> = {};

      for (let i = 1; i <= 8; i++) {
        const zoneName = `Zone ${i}`;
        const bhws = updatedUsers.filter(
          (u) => u.role === "bhw" && u.zone === zoneName
        );
        const mothers = updatedUsers.filter(
          (u) => u.role === "mother" && u.zone === zoneName
        );
        grouped[zoneName] = { bhws, mothers };
      }

      setZonesGrouped(grouped);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUsersAndMothers();
  }, []);

  const handleAddUser = async () => {
    setError("");
    const { email, full_name, password, zone } = newUser;

    if (!email || !full_name || !password || !zone) {
      setError("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { full_name, role: "bhw", zone },
        },
      });

      if (signUpError) throw signUpError;
      const userId = authData.user?.id;

      if (!userId) {
        alert("📧 Confirmation email sent to the BHW.");
        setShowModal(false);
        setNewUser({ email: "", full_name: "", role: "bhw", password: "", zone: "" });
        return;
      }

      const { error: userInsertError } = await supabase.from("users").insert([
        { id: userId, email, full_name, role: "bhw", zone, status: "active" },
      ]);

      if (userInsertError) throw userInsertError;

      alert("✅ BHW created successfully!");
      setShowModal(false);
      setNewUser({ email: "", full_name: "", role: "bhw", password: "", zone: "" });
      fetchUsersAndMothers();
    } catch (err) {
      console.error("Add user failed:", err);
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

  const toggleZone = (zone: string) => {
    setExpandedZones((prev) => ({ ...prev, [zone]: !prev[zone] }));
  };

  return (
    <AdminMainLayout>
      <IonContent
        className="ion-padding"
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "40px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
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
              Admins can assign multiple BHWs per zone.
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
            Add BHW
          </IonButton>
        </div>

        {Object.entries(zonesGrouped).map(([zone, data]) => (
          <IonCard
            key={zone}
            style={{
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 4px 25px rgba(0,0,0,0.06)",
              marginBottom: "25px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f1f5f9",
                padding: "16px 22px",
                cursor: "pointer",
              }}
              onClick={() => toggleZone(zone)}
            >
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
                  {zone}
                </h2>
                {data.bhws.length > 0 ? (
                  <p style={{ color: "#475569", marginTop: "2px" }}>
                    BHWs: {data.bhws.map((b) => b.full_name).join(", ")}
                  </p>
                ) : (
                  <p style={{ color: "#ef4444", marginTop: "2px" }}>
                    No assigned BHW
                  </p>
                )}
              </div>
              <IonIcon
                icon={expandedZones[zone] ? chevronUpOutline : chevronDownOutline}
              />
            </div>

            {expandedZones[zone] && (
              <div style={{ padding: "0 25px 20px 25px" }}>
                {data.bhws.length > 0 && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "#e0f2fe",
                      borderRadius: "10px",
                      padding: "12px 18px",
                      fontWeight: 600,
                      color: "#0369a1",
                    }}
                  >
                    {data.bhws.map((b) => (
                      <div key={b.id}>
                        BHW Account: {b.full_name} ({b.email})
                      </div>
                    ))}
                  </div>
                )}

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0 8px",
                    marginTop: "10px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      <th style={{ padding: "14px 20px" }}>Mother</th>
                      <th style={{ padding: "14px 20px" }}>Email</th>
                      <th style={{ padding: "14px 20px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mothers.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center", padding: 20 }}>
                          No mothers assigned to this zone.
                        </td>
                      </tr>
                    ) : (
                      data.mothers.map((m) => (
                        <tr key={m.id}>
                          <td style={{ padding: "14px 20px" }}>{m.full_name}</td>
                          <td style={{ padding: "14px 20px" }}>{m.email}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <IonToggle
                              checked={m.status === "active"}
                              onIonChange={() => handleToggleStatus(m.id, m.status)}
                              color="success"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </IonCard>
        ))}

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonContent style={{ padding: "25px", background: "#fff" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "20px",
                color: "#0f172a",
                textAlign: "center",
              }}
            >
              Add New BHW
            </h2>

            <IonItem>
              <IonLabel position="floating">Full Name</IonLabel>
              <IonInput
                value={newUser.full_name}
                onIonChange={(e) =>
                  setNewUser({ ...newUser, full_name: e.detail.value || "" })
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
                  setNewUser({ ...newUser, password: e.detail.value || "" })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel>Zone</IonLabel>
              <IonSelect
                placeholder="Select Zone"
                value={newUser.zone}
                onIonChange={(e) =>
                  setNewUser({ ...newUser, zone: e.detail.value })
                }
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <IonSelectOption key={i} value={`Zone ${i + 1}`}>
                    Zone {i + 1}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            {error && (
              <IonText color="danger">
                <p style={{ textAlign: "center", marginTop: "10px" }}>{error}</p>
              </IonText>
            )}

            <div style={{ marginTop: "25px" }}>
              <IonButton expand="block" color="success" onClick={handleAddUser}>
                Create BHW
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

export default AdminUserPage;
