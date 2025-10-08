import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";
import { addOutline, closeOutline } from "ionicons/icons";
import MainLayout from "../layouts/MainLayouts";
import "./Mother.css";
import { supabase } from "../utils/supabaseClient";

const Mothers: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [mothers, setMothers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    birthday: "",
    address: "",
    contact: "",
    email: "",
    password: "",
    status: "Pregnant",
    dueDate: "",
  });

  const fetchMothers = async () => {
    const { data, error } = await supabase
      .from("mothers")
      .select("id, name, email, contact, status, birthday, address, due_date")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching mothers:", error);
    } else {
      setMothers(data || []);
    }
  };

  useEffect(() => {
    fetchMothers();
  }, []);

  const handleInputChange = (e: CustomEvent) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    const value = (e as any).detail.value;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const registerMother = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("Please fill out all required fields (Name, Email, Password)");
      return;
    }

    try {
      // 1️⃣ Create auth user via Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) {
        console.error("Auth signUp error:", authError);
        alert("Error creating user: " + authError.message);
        return;
      }

      if (!authData.user) {
        alert("User creation failed.");
        return;
      }

      const authUserId = authData.user.id;

      // 2️⃣ Insert into mothers table
      const insertObj = {
        auth_user_id: authUserId,
        name: form.name,
        birthday: form.birthday || null,
        address: form.address || null,
        contact: form.contact || null,
        email: form.email,
        status: form.status,
        due_date: form.dueDate || null,
      };

      const { error: insertError } = await supabase.from("mothers").insert([insertObj]);
      if (insertError) {
        console.error("Insert error:", insertError);
        alert("Failed to save mother info: " + insertError.message);
        return;
      }

      alert("Mother registered successfully! Email confirmation sent.");

      // Reset form + refresh list
      setForm({
        name: "",
        birthday: "",
        address: "",
        contact: "",
        email: "",
        password: "",
        status: "Pregnant",
        dueDate: "",
      });
      await fetchMothers();
      setShowModal(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong during registration.");
    }
  };

  return (
    <MainLayout>
      <div className="mothers-page">
        <div className="header-container">
          <h1 className="page-title">Mothers Management</h1>
          <IonButton className="add-btn" onClick={() => setShowModal(true)}>
            <IonIcon icon={addOutline} slot="start" />
            Register Mother
          </IonButton>
        </div>

        <div className="mothers-layout">
          {mothers.length === 0 ? (
            <p className="empty-text">No mothers registered yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="mothers-table desktop-only">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mothers.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.email}</td>
                      <td>{m.contact || "N/A"}</td>
                      <td>{m.status}</td>
                      <td>{m.due_date ? new Date(m.due_date).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mobile-only mothers-cards">
                {mothers.map((m, i) => (
                  <div key={i} className="mother-card">
                    <p><strong>{m.name}</strong></p>
                    <p>{m.email}</p>
                    <p>{m.contact || "N/A"}</p>
                    <span className="status">{m.status}</span>
                    <p>Due: {m.due_date ? new Date(m.due_date).toLocaleDateString() : "N/A"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          className="mother-modal"
        >
          <div className="modal-container">
            <div className="modal-header">
              <h2>Register Mother</h2>
              <IonButton fill="clear" onClick={() => setShowModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            <div className="modal-body">
              <IonList className="form-list">
                <IonItem>
                  <IonLabel position="stacked">Full Name</IonLabel>
                  <IonInput name="name" value={form.name} onIonChange={handleInputChange} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Birthday</IonLabel>
                  <IonInput type="date" name="birthday" value={form.birthday} onIonChange={handleInputChange} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Address</IonLabel>
                  <IonInput name="address" value={form.address} onIonChange={handleInputChange} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Contact Number</IonLabel>
                  <IonInput type="tel" name="contact" value={form.contact} onIonChange={handleInputChange} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput type="email" name="email" value={form.email} onIonChange={handleInputChange} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput type="password" name="password" value={form.password} onIonChange={handleInputChange} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Expected Due Date</IonLabel>
                  <IonInput type="date" name="dueDate" value={form.dueDate} onIonChange={handleInputChange} />
                </IonItem>
              </IonList>
            </div>

            <div className="modal-footer">
              <IonButton expand="block" onClick={registerMother}>
                Save
              </IonButton>
            </div>
          </div>
        </IonModal>
      </div>
    </MainLayout>
  );
};

export default Mothers;
