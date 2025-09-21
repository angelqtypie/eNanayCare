// src/pages/Reminders.tsx
import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";
import {
  addOutline,
  closeOutline,
  notificationsOutline,
  createOutline,
  trashOutline,
} from "ionicons/icons";
import MainLayout from "../layouts/MainLayouts";
import "./AdminReminders.css";

const Reminders: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    notes: "",
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openNewModal = () => {
    setEditingIndex(null);
    setForm({ title: "", date: "", time: "", notes: "" });
    setShowModal(true);
  };

  const openEditModal = (index: number) => {
    setEditingIndex(index);
    setForm(reminders[index]);
    setShowModal(true);
  };

  const deleteReminder = (index: number) => {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const saveReminder = () => {
    if (!form.title || !form.date || !form.time) return;

    if (editingIndex !== null) {
      setReminders((prev) =>
        prev.map((r, i) => (i === editingIndex ? form : r))
      );
    } else {
      setReminders((prev) => [...prev, form]);
    }

    setForm({ title: "", date: "", time: "", notes: "" });
    setEditingIndex(null);
    setShowModal(false);
  };

  return (
    <MainLayout>
      <IonPage className="reminders-page">
        {/* HEADER */}
        <IonHeader className="reminders-header">
          <IonToolbar>
            <div className="header-container">
              <h1 className="page-title">
                <IonIcon icon={notificationsOutline} /> Reminders
              </h1>
              <IonButton className="add-btn" onClick={openNewModal}>
                <IonIcon icon={addOutline} slot="start" />
                New Reminder
              </IonButton>
            </div>
          </IonToolbar>
        </IonHeader>

        {/* CONTENT */}
        <IonContent className="reminders-content">
          <div className="reminders-layout">
            {reminders.length === 0 ? (
              <p className="empty-text">No reminders set yet.</p>
            ) : (
              <div className="table-wrapper">
                {/* Desktop Table */}
                <table className="reminders-table desktop-only">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reminders.map((r, i) => (
                      <tr key={i}>
                        <td>{r.title}</td>
                        <td>{r.date}</td>
                        <td>{r.time}</td>
                        <td>{r.notes}</td>
                        <td>
                          <IonButton
                            size="small"
                            onClick={() => openEditModal(i)}
                          >
                            <IonIcon icon={createOutline} />
                          </IonButton>
                          <IonButton
                            size="small"
                            color="danger"
                            onClick={() => deleteReminder(i)}
                          >
                            <IonIcon icon={trashOutline} />
                          </IonButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="mobile-only reminders-cards">
                  {reminders.map((r, i) => (
                    <div key={i} className="reminder-card">
                      <p>
                        <strong>{r.title}</strong>
                      </p>
                      <p>
                        {r.date} at {r.time}
                      </p>
                      <p>{r.notes}</p>
                      <div className="card-actions">
                        <IonButton size="small" onClick={() => openEditModal(i)}>
                          <IonIcon icon={createOutline} />
                        </IonButton>
                        <IonButton
                          size="small"
                          color="danger"
                          onClick={() => deleteReminder(i)}
                        >
                          <IonIcon icon={trashOutline} />
                        </IonButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </IonContent>

        {/* MODAL FORM */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          className="reminder-modal"
        >
          <div className="modal-container">
            {/* HEADER */}
            <div className="modal-header">
              <h2>{editingIndex !== null ? "Edit Reminder" : "New Reminder"}</h2>
              <IonButton
                fill="clear"
                color="medium"
                onClick={() => setShowModal(false)}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            {/* BODY */}
            <div className="modal-body">
              <IonList className="form-list">
                <IonItem>
                  <IonLabel position="stacked">Title</IonLabel>
                  <IonInput
                    value={form.title}
                    onIonChange={(e) => handleChange("title", e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Date</IonLabel>
                  <IonInput
                    type="date"
                    value={form.date}
                    onIonChange={(e) => handleChange("date", e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Time</IonLabel>
                  <IonInput
                    type="time"
                    value={form.time}
                    onIonChange={(e) => handleChange("time", e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Notes</IonLabel>
                  <IonInput
                    value={form.notes}
                    onIonChange={(e) => handleChange("notes", e.detail.value!)}
                  />
                </IonItem>
              </IonList>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <IonButton expand="block" onClick={saveReminder}>
                {editingIndex !== null ? "Update" : "Save"}
              </IonButton>
            </div>
          </div>
        </IonModal>
      </IonPage>
    </MainLayout>
  );
};

export default Reminders;
