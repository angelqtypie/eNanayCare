import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonSpinner,
} from "@ionic/react";
import { closeOutline, trashOutline } from "ionicons/icons";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";

interface Mother {
  mother_id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

interface Appointment {
  id: number;
  mother_id: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  status: string;
  mother?: Mother;
}

const Appointments: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    motherIds: [] as string[],
    date: "",
    time: "",
    location: "",
    notes: "",
  });

  const handleChange = (name: string, value: any) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatTimeTo12Hour = (time: string) => {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  // ✅ Fetch mothers (joined with user email)
  const fetchMothers = async () => {
    const { data, error } = await supabase
      .from("mothers")
      .select("mother_id, first_name, last_name, user:users(email)")
      .order("last_name", { ascending: true });

    if (error) {
      console.error("Error fetching mothers:", error);
      return;
    }

    const formatted = (data || []).map((m: any) => ({
      mother_id: m.mother_id,
      first_name: m.first_name,
      last_name: m.last_name,
      email: m.user?.email,
    }));

    setMothers(formatted);
  };

  // ✅ Fetch appointments with related mother info
  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `id, date, time, location, notes, status, mother_id,
        mothers(mother_id, first_name, last_name)`
      )
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
      return;
    }

    const formatted = (data || []).map((a: any) => ({
      ...a,
      mother: a.mothers ? a.mothers : undefined,
    }));

    setAppointments(formatted);
    setLoading(false);
  };

  // ✅ Send email notification via Supabase Function
  const sendEmailNotification = async (
    mother: Mother,
    date: string,
    time: string,
    location: string
  ) => {
    try {
      if (!mother.email) return;

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: mother.email,
          subject: "Prenatal Check-up Reminder",
          type: "reminder",
          data: {
            name: `${mother.first_name} ${mother.last_name}`,
            date,
            time,
            location,
          },
        },
      });

      if (error) console.error("❌ Email send error:", error);
      else console.log("✅ Email sent:", data);
    } catch (err) {
      console.error("⚠️ Function call failed:", err);
    }
  };

  const addAppointment = async () => {
    if (
      form.motherIds.length === 0 ||
      !form.date ||
      !form.time ||
      !form.location
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const { error } = await supabase.from("appointments").insert(
      form.motherIds.map((motherId) => ({
        mother_id: motherId,
        date: form.date,
        time: form.time,
        location: form.location,
        notes: form.notes,
        status: "Scheduled",
      }))
    );

    if (error) {
      console.error("Insert error:", error);
      return;
    }

    // ✅ Send email to each selected mother
    form.motherIds.forEach((mid) => {
      const mother = mothers.find((m) => m.mother_id === mid);
      if (mother)
        sendEmailNotification(mother, form.date, form.time, form.location);
    });

    setShowModal(false);
    setForm({ motherIds: [], date: "", time: "", location: "", notes: "" });
    fetchAppointments();
  };

  const deleteAppointment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) console.error(error);
    else fetchAppointments();
  };

  useEffect(() => {
    fetchMothers();
    fetchAppointments();
  }, []);

  const filtered = appointments.filter(
    (a) =>
      new Date(a.date).toDateString() ===
      (calendarDate as Date).toDateString()
  );

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar>
          <h2 className="page-title">Appointments</h2>
        </IonToolbar>
      </IonHeader>

      <IonContent className="appointments-content">
        <div className="appointments-container">
          {/* Calendar */}
          <div className="calendar-section">
            <Calendar
              value={calendarDate}
              onClickDay={(date) => {
                setCalendarDate(date);
                setForm((prev) => ({ ...prev, date: formatDate(date) }));
              }}
              tileContent={({ date }) => {
                const has = appointments.some(
                  (a) => new Date(a.date).toDateString() === date.toDateString()
                );
                return has ? <div className="dot"></div> : null;
              }}
              tileClassName={({ date }) => {
                const isToday =
                  date.toDateString() === new Date().toDateString();
                return isToday ? "today-highlight" : null;
              }}
            />
            <IonButton
              expand="block"
              className="add-btn"
              onClick={() => setShowModal(true)}
            >
              + New Appointment
            </IonButton>
          </div>

          {/* Appointments Table */}
          <div className="table-wrapper">
            {loading ? (
              <div className="loading">
                <IonSpinner name="dots" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="empty-text">No appointments today.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Mother</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>
                        {a.mother
                          ? `${a.mother.first_name} ${a.mother.last_name}`
                          : "N/A"}
                      </td>
                      <td>{a.date}</td>
                      <td>{formatTimeTo12Hour(a.time)}</td>
                      <td>{a.location}</td>
                      <td className={`status ${a.status.toLowerCase()}`}>
                        {a.status}
                      </td>
                      <td>
                        <IonButton
                          color="danger"
                          size="small"
                          onClick={() => deleteAppointment(a.id)}
                        >
                          <IonIcon icon={trashOutline} />
                          &nbsp;Delete
                        </IonButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </IonContent>

      {/* Modal */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <div className="modal-container">
          <div className="modal-header">
            <h2>New Appointment</h2>
            <IonButton
              fill="clear"
              color="medium"
              onClick={() => setShowModal(false)}
            >
              <IonIcon icon={closeOutline} />
            </IonButton>
          </div>

          <IonList className="form-scroll">
            <IonItem>
              <IonLabel position="stacked">Select Mother(s)</IonLabel>
              <IonSelect
                multiple
                value={form.motherIds}
                placeholder="Select mothers"
                onIonChange={(e) => handleChange("motherIds", e.detail.value!)}
              >
                {mothers.map((m) => (
                  <IonSelectOption key={m.mother_id} value={m.mother_id}>
                    {m.first_name} {m.last_name}
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
              <IonLabel position="stacked">Location</IonLabel>
              <IonInput
                placeholder="Enter location"
                value={form.location}
                onIonChange={(e) => handleChange("location", e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Notes</IonLabel>
              <IonInput
                placeholder="Optional notes"
                value={form.notes}
                onIonChange={(e) => handleChange("notes", e.detail.value!)}
              />
            </IonItem>
          </IonList>

          <IonButton expand="block" onClick={addAppointment}>
            Save Appointment
          </IonButton>
        </div>
      </IonModal>

      <style>
        {`
          .page-title { font-weight: 600; padding: 10px 20px; }
          .appointments-container { display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; }
          .calendar-section { width: 340px; background: #fff; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); padding: 15px; }
          .table-wrapper { flex: 1; background: #fff; border-radius: 12px; padding: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); overflow-x: auto; }
          .appointments-table { width: 100%; border-collapse: collapse; }
          .appointments-table th, .appointments-table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
          .appointments-table tr:hover { background: #f8faff; }
          .status.scheduled { color: #2563eb; font-weight: 600; }
          .status.completed { color: #16a34a; font-weight: 600; }
          .status.missed { color: #dc2626; font-weight: 600; }
          .add-btn { margin-top: 10px; font-weight: 600; }
          .dot { background-color: #2563eb; width: 6px; height: 6px; border-radius: 50%; margin: auto; margin-top: 2px; }
          .today-highlight { background: #ffe599 !important; border-radius: 50%; }
          .empty-text, .loading { text-align: center; padding: 30px; color: #888; }
          .modal-container { background: #fefefe; padding: 20px; height: 100%; display: flex; flex-direction: column; }
          .modal-header { display: flex; justify-content: space-between; align-items: center; }
          .form-scroll { max-height: 65vh; overflow-y: auto; padding-right: 10px; }
        `}
      </style>
    </MainLayout>
  );
};

export default Appointments;
