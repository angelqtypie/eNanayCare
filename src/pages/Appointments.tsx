import React, { useEffect, useState } from "react";
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
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { addOutline, closeOutline, calendarOutline, closeOutline as close } from "ionicons/icons";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";
import "./adminappointments.css";

const Appointments: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [mothers, setMothers] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | null>(new Date());

  const [form, setForm] = useState({
    motherId: "",
    date: "",
    time: "",
    notes: "",
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Local date formatter (fixes 1-day offset issue)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ Fetch mothers
  const fetchMothers = async () => {
    const { data, error } = await supabase
      .from("mothers")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching mothers:", error);
    } else {
      setMothers(data || []);
    }
  };

  // ✅ Fetch appointments
  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        notes,
        mother:mothers ( id, name )
      `)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
    } else {
      setAppointments(data || []);
    }
  };

  // ✅ Add appointment
  const addAppointment = async () => {
    if (!form.motherId || !form.date || !form.time) return;

    const { error } = await supabase.from("appointments").insert([
      {
        mother_id: form.motherId,
        date: form.date,
        time: form.time,
        notes: form.notes,
      },
    ]);

    if (error) {
      console.error("Error adding appointment:", error);
    } else {
      setForm({ motherId: "", date: "", time: "", notes: "" });
      setShowModal(false);
      fetchAppointments(); // refresh list
    }
  };

  useEffect(() => {
    fetchMothers();
    fetchAppointments();
  }, []);

  // ✅ Filter appointments by selected calendar date
  const filteredAppointments = calendarDate
    ? appointments.filter(
        (a) =>
          new Date(a.date).toDateString() ===
          (calendarDate as Date).toDateString()
      )
    : appointments;

  return (
    <MainLayout>
        {/* HEADER */}
        <IonHeader className="appointments-header">
          <IonToolbar>
          </IonToolbar>
        </IonHeader>

        {/* CONTENT */}
        <IonContent className="appointments-content">
          <div className="appointments-layout">
            {/* Calendar */}
            <div className="calendar-section">
              <Calendar
                value={calendarDate}
                onClickDay={(date) => {
                  setCalendarDate(date);
                  setForm((prev) => ({
                    ...prev,
                    date: formatDate(date), // ✅ FIXED: no more UTC shift
                  }));
                  setShowModal(true);
                }}
                tileContent={({ date }) => {
                  const hasAppointment = appointments.some(
                    (a) => new Date(a.date).toDateString() === date.toDateString()
                  );
                  return hasAppointment ? <div className="dot"></div> : null;
                }}
                tileClassName={({ date }) => {
                  const hasAppointment = appointments.some(
                    (a) => new Date(a.date).toDateString() === date.toDateString()
                  );
                  return hasAppointment ? "has-appointment" : "";
                }}
              />
            </div>

            {/* Appointment List */}
            {filteredAppointments.length === 0 ? (
              <p className="empty-text">No appointments scheduled for this day.</p>
            ) : (
              <div className="table-wrapper">
                {/* Desktop Table */}
                <table className="appointments-table desktop-only">
                  <thead>
                    <tr>
                      <th>Mother</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((a) => (
                      <tr key={a.id}>
                        <td>{a.mother?.name}</td>
                        <td>{a.date}</td>
                        <td>{a.time}</td>
                        <td>{a.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="mobile-only appointments-cards">
                  {filteredAppointments.map((a) => (
                    <div key={a.id} className="appointment-card">
                      <p>
                        <strong>{a.mother?.name}</strong>
                      </p>
                      <p>
                        {a.date} at {a.time}
                      </p>
                      <p>{a.notes}</p>
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
          className="appointment-modal"
        >
          <div className="modal-container">
            {/* HEADER */}
            <div className="modal-header">
              <h2>New Appointment</h2>
              <IonButton
                fill="clear"
                color="medium"
                onClick={() => setShowModal(false)}
              >
                <IonIcon icon={close} />
              </IonButton>
            </div>

            {/* BODY */}
            <div className="modal-body">
              <IonList className="form-list">
                <IonItem>
                  <IonLabel position="stacked">Select Mother</IonLabel>
                  <IonSelect
                    name="motherId"
                    value={form.motherId}
                    placeholder="Choose a mother"
                    onIonChange={(e) => handleChange("motherId", e.detail.value)}
                  >
                    {mothers.map((m) => (
                      <IonSelectOption key={m.id} value={m.id}>
                        {m.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
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
                    placeholder="Optional"
                    value={form.notes}
                    onIonChange={(e) => handleChange("notes", e.detail.value!)}
                  />
                </IonItem>
              </IonList>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <IonButton expand="block" onClick={addAppointment}>
                Save Appointment
              </IonButton>
            </div>
          </div>
        </IonModal>
    </MainLayout>
  );
};

export default Appointments;
