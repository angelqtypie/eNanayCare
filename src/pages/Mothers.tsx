import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonAlert,
} from "@ionic/react";
import { addOutline, closeOutline, createOutline, trashOutline } from "ionicons/icons";
import MainLayout from "../layouts/MainLayouts";
import "./Mother.css";
import { supabase } from "../utils/supabaseClient";

const Mothers: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
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
    lmp_date: "",
  });

  // 🧠 Fetch all mothers
  const fetchMothers = async () => {
    const { data, error } = await supabase
      .from("mothers")
      .select("id, name, email, contact, status, birthday, address, due_date, lmp_date")
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

  // 📝 Handle input changes + auto-calculate due date
  const handleInputChange = (e: CustomEvent) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    const value = (e as any).detail.value;

    if (name === "lmp_date" && value) {
      const lmpDate = new Date(value);
      const dueDate = new Date(lmpDate);
      dueDate.setDate(lmpDate.getDate() + 280); // +40 weeks
      setForm((prev) => ({
        ...prev,
        lmp_date: value,
        dueDate: dueDate.toISOString().split("T")[0],
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🧩 Register or Update Mother
  const saveMother = async () => {
    if (!form.name || !form.email || (!editId && !form.password)) {
      alert("Please fill out all required fields (Name, Email, Password)");
      return;
    }

    try {
      let authUserId = null;

      // 🆕 New Mother Registration
      if (!editId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (authError) {
          console.error("Auth error:", authError);
          if (authError.message.includes("already registered")) {
            alert("This email is already registered.");
          } else {
            alert("Auth sign-up failed: " + authError.message);
          }
          return;
        }

        authUserId = authData?.user?.id || null;

        // 🧠 UPSERT user (avoids duplicate email errors)
        const { error: userUpsertError } = await supabase.from("users").upsert([
          {
            id: authUserId,
            email: form.email,
            full_name: form.name,
            role: "mother",
            created_at: new Date().toISOString(),
            password: null,
          },
        ]);

        if (userUpsertError) {
          console.error("Error upserting into users:", userUpsertError);
          alert("User insert/upsert failed: " + userUpsertError.message);
          return;
        }
      }

      // 🧾 Insert or Update mother record
      if (editId) {
        const { error } = await supabase
          .from("mothers")
          .update({
            name: form.name,
            birthday: form.birthday || null,
            address: form.address || null,
            contact: form.contact || null,
            email: form.email,
            status: form.status,
            due_date: form.dueDate || null,
            lmp_date: form.lmp_date || null,
          })
          .eq("id", editId);

        if (error) throw error;
        alert("Mother updated successfully!");
      } else {
        const { error } = await supabase.from("mothers").insert([
          {
            auth_user_id: authUserId,
            name: form.name,
            birthday: form.birthday || null,
            address: form.address || null,
            contact: form.contact || null,
            email: form.email,
            status: form.status,
            due_date: form.dueDate || null,
            lmp_date: form.lmp_date || null,
          },
        ]);

        if (error) throw error;
        alert("Mother registered successfully!");
      }

      resetForm();
      await fetchMothers();
      setShowModal(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Unexpected error occurred.");
    }
  };

  // 🗑️ Delete mother
  const deleteMother = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("mothers").delete().eq("id", deleteId);
    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete record.");
    } else {
      alert("Mother deleted successfully!");
      fetchMothers();
    }
    setShowDeleteAlert(false);
    setDeleteId(null);
  };

  // 🧼 Reset form
  const resetForm = () => {
    setForm({
      name: "",
      birthday: "",
      address: "",
      contact: "",
      email: "",
      password: "",
      status: "Pregnant",
      dueDate: "",
      lmp_date: "",
    });
    setEditId(null);
  };

  // ✏️ Edit
  const handleEdit = (mother: any) => {
    setEditId(mother.id);
    setForm({
      name: mother.name,
      birthday: mother.birthday || "",
      address: mother.address || "",
      contact: mother.contact || "",
      email: mother.email,
      password: "",
      status: mother.status,
      dueDate: mother.due_date || "",
      lmp_date: mother.lmp_date || "",
    });
    setShowModal(true);
  };

  return (
    <MainLayout>
      <div className="mothers-page">
        <div className="header-container">
          <h1 className="page-title">Mothers Management</h1>
          <IonButton className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
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
                    <th>LMP Date</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mothers.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.email}</td>
                      <td>{m.contact || "N/A"}</td>
                      <td>{m.status}</td>
                      <td>{m.lmp_date ? new Date(m.lmp_date).toLocaleDateString() : "N/A"}</td>
                      <td>{m.due_date ? new Date(m.due_date).toLocaleDateString() : "N/A"}</td>
                      <td>
                        <IonButton fill="clear" onClick={() => handleEdit(m)}>
                          <IonIcon icon={createOutline} />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          color="danger"
                          onClick={() => {
                            setDeleteId(m.id);
                            setShowDeleteAlert(true);
                          }}
                        >
                          <IonIcon icon={trashOutline} />
                        </IonButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for add/edit */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="mother-modal">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editId ? "Edit Mother" : "Register Mother"}</h2>
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

                {!editId && (
                  <IonItem>
                    <IonLabel position="stacked">Password</IonLabel>
                    <IonInput type="password" name="password" value={form.password} onIonChange={handleInputChange} />
                  </IonItem>
                )}

                {/* ✅ LMP first */}
                <IonItem>
                  <IonLabel position="stacked">Last Menstrual Period (LMP Date)</IonLabel>
                  <IonInput type="date" name="lmp_date" value={form.lmp_date} onIonChange={handleInputChange} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Expected Due Date</IonLabel>
                  <IonInput type="date" name="dueDate" value={form.dueDate} onIonChange={handleInputChange} />
                </IonItem>
              </IonList>
            </div>

            <div className="modal-footer">
              <IonButton expand="block" onClick={saveMother}>
                {editId ? "Update" : "Save"}
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Delete Confirmation */}
        <IonAlert
          isOpen={showDeleteAlert}
          header="Confirm Delete"
          message="Are you sure you want to delete this mother?"
          buttons={[
            { text: "Cancel", role: "cancel", handler: () => setShowDeleteAlert(false) },
            { text: "Delete", role: "confirm", handler: deleteMother },
          ]}
        />
      </div>
    </MainLayout>
  );
};

export default Mothers;
