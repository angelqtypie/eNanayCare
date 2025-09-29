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
      .select("id, name, email, contact, status, birthday, address, due_date");
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
      // 1. Sign up user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
  
      if (authError) {
        console.error("Auth signUp error:", authError);
        alert("Error creating auth user: " + authError.message);
        return;
      }
  
      if (!authData.user) {
        console.error("No user object after signUp:", authData);
        alert("User creation failed.");
        return;
      }
  
      const userId = authData.user.id;
  
      // 2. Prepare data for insertion into mothers
      const insertObj: any = {
        user_id: userId,
        name: form.name,
        address: form.address || null,
        contact: form.contact || null,
        email: form.email,
        status: form.status,
      };
  
      if (form.birthday) {
        insertObj.birthday = form.birthday;
      }
      if (form.dueDate) {
        insertObj.due_date = form.dueDate;
      }
  
      // 3. Insert into mothers table
      const { error: insertError } = await supabase
        .from("mothers")
        .insert([insertObj]);
  
      if (insertError) {
        console.error("Insert error:", insertError);
        alert("Failed to save mother data: " + insertError.message);
        return;
      }
  
      // 4. Done! No login. Show success, reset form, close modal, refresh list
      alert("Mother registered successfully!");
  
      // Reset form
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
  
      // Refresh mother list
      await fetchMothers();
  
      // Close modal
      setShowModal(false);
  
    } catch (err) {
      console.error("Unexpected error in registerMother:", err);
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
                      <td>{m.contact}</td>
                      <td>{m.status}</td>
                      <td>{m.due_date || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mobile-only mothers-cards">
                {mothers.map((m, i) => (
                  <div key={i} className="mother-card">
                    <p>
                      <strong>{m.name}</strong>
                    </p>
                    <p>{m.email}</p>
                    <p>{m.contact}</p>
                    <span className="status">{m.status}</span>
                    <p>Due: {m.due_date || "N/A"}</p>
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
                  <IonInput
                    name="name"
                    value={form.name}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Birthday</IonLabel>
                  <IonInput
                    type="date"
                    name="birthday"
                    value={form.birthday}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Address</IonLabel>
                  <IonInput
                    name="address"
                    value={form.address}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Contact Number</IonLabel>
                  <IonInput
                    type="tel"
                    name="contact"
                    value={form.contact}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    type="email"
                    name="email"
                    value={form.email}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput
                    type="password"
                    name="password"
                    value={form.password}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Expected Due Date</IonLabel>
                  <IonInput
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onIonChange={handleInputChange}
                  />
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


