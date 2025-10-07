import React, { useEffect, useState } from "react";
import {
  IonPage,
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
} from "@ionic/react";
import { logOutOutline, addOutline, trashOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

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
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "mother",
  });

  // Helper to safely parse JSON
  const safeParseJSON = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(text || "Invalid server response");
    }
  };

  // Fetch users
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

  // Logout
  const handleLogout = () => {
    history.push("/eNanayCare/landingpage");
  };

  // Add user (calls your Edge Function)
  const handleAddUser = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(newUser),
      });

      const result = await safeParseJSON(res);
      if (!res.ok) throw new Error(result?.error || "Request failed");

      alert("✅ Invitation sent! User can check their email to set a password.");
      setShowModal(false);
      setNewUser({ email: "", full_name: "", role: "mother" });
      fetchUsers();
    } catch (err) {
      alert("❌ Failed: " + (err as Error).message);
    }
  };

  // Delete user (calls delete-user function)
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(import.meta.env.VITE_SUPABASE_DELETE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Manage Users</IonTitle>
          <IonButton slot="end" color="light" fill="clear" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} slot="start" />
            Logout
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonButton color="primary" onClick={() => setShowModal(true)}>
          <IonIcon icon={addOutline} slot="start" />
          Add User
        </IonButton>

        <IonCard>
          <IonGrid>
            <IonRow className="font-bold border-b border-gray-300 p-2 bg-gray-100">
              <IonCol>Name</IonCol>
              <IonCol>Email</IonCol>
              <IonCol>Role</IonCol>
              <IonCol>Created</IonCol>
              <IonCol>Actions</IonCol>
            </IonRow>
            {users.map((u) => (
              <IonRow key={u.id} className="p-2 border-b border-gray-200">
                <IonCol>{u.full_name}</IonCol>
                <IonCol>{u.email}</IonCol>
                <IonCol className="capitalize">{u.role}</IonCol>
                <IonCol>{new Date(u.created_at).toLocaleDateString()}</IonCol>
                <IonCol>
                  <IonButton
                    color="danger"
                    size="small"
                    onClick={() => handleDelete(u.id)}
                  >
                    <IonIcon icon={trashOutline} slot="start" />
                    Delete
                  </IonButton>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </IonCard>

        {/* Add User Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonContent className="ion-padding">
            <h2 className="text-xl font-bold mb-4">Invite New User</h2>

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

            <IonButton
              expand="block"
              color="success"
              className="mt-4"
              onClick={handleAddUser}
            >
              Send Invite
            </IonButton>

            <IonButton
              expand="block"
              color="medium"
              className="mt-2"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ManageUsers;
