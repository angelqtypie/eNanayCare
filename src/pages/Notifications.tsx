import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonBadge,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonList,
  IonToast,
  IonText,
  IonLoading,
  IonCheckbox,
} from "@ionic/react";
import { add, checkmarkDone } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MainLayout from "../layouts/MainLayouts";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "reminder" | "alert" | "info";
  created_at: string;
  is_read: boolean;
  mother_id?: string;
}

interface Mother {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  date: string;
  location?: string;
  status: string;
  mother_id: string;
  mothers?: { name: string }[]; // ✅ Fix: Supabase returns array
}

const NotificationPage: React.FC = () => {
  const [notificationsData, setNotificationsData] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "reminder" | "alert" | "info">("all");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; color?: string }>({
    show: false,
    message: "",
    color: "primary",
  });
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "reminder",
  });
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [selectedMothers, setSelectedMothers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // ✅ Toast
  const showToast = (message: string, color: string = "primary") => {
    setToast({ show: true, message, color });
  };

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setNotificationsData(data || []);
    } catch (err) {
      console.error("fetchNotifications error", err);
      showToast("Failed to load notifications.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch mothers
  const fetchMothers = async () => {
    try {
      const { data, error } = await supabase
        .from("mothers")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) throw error;
      setMothers(data || []);
    } catch (err) {
      console.error("fetchMothers error", err);
    }
  };

  // ✅ Mark single as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
      setNotificationsData((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("markAsRead error", err);
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
      if (error) throw error;
      setNotificationsData((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast("All notifications marked as read.", "success");
    } catch (err) {
      console.error("markAllAsRead error", err);
      showToast("Failed to mark all as read.", "danger");
    }
  };

  // ✅ Add notification manually
  const addNotification = async () => {
    if (!formData.title || !formData.message) {
      showToast("Please fill in all fields.", "warning");
      return;
    }

    if (selectedMothers.length === 0 && !selectAll) {
      showToast("Select at least one mother or choose All.", "warning");
      return;
    }

    setLoading(true);
    try {
      const targetMotherIds = selectAll ? mothers.map((m) => m.id) : selectedMothers;

      const payloads = targetMotherIds.map((mother_id) => ({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        is_read: false,
        mother_id,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("notifications").insert(payloads);
      if (error) throw error;

      showToast("Notification sent successfully!", "success");
      setShowModal(false);
      setFormData({ title: "", message: "", type: "reminder" });
      setSelectedMothers([]);
      setSelectAll(false);
      await fetchNotifications();
    } catch (err) {
      console.error("addNotification error", err);
      showToast("Failed to add notification.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-generate reminders for upcoming appointments
  const checkUpcomingAppointments = async () => {
    try {
      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("id, date, location, status, mother_id, mothers(name)")
        .gte("date", today.toISOString().split("T")[0])
        .lte("date", threeDaysLater.toISOString().split("T")[0])
        .eq("status", "Scheduled");

      if (error) throw error;

      for (const appt of (appointments as Appointment[]) || []) {
        const name = appt.mothers && appt.mothers.length > 0 ? appt.mothers[0].name : "Mother";
        const apptDate = new Date(appt.date).toLocaleDateString();
        const message = `Reminder: ${name} has a prenatal check-up on ${apptDate}${
          appt.location ? " at " + appt.location : ""
        }.`; 

        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("mother_id", appt.mother_id)
          .eq("title", "Upcoming Prenatal Checkup");

        if (!existing || existing.length === 0) {
          await supabase.from("notifications").insert([
            {
              title: "Upcoming Prenatal Checkup",
              message,
              type: "reminder",
              is_read: false,
              mother_id: appt.mother_id,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (err) {
      console.error("checkUpcomingAppointments error", err);
    }
  };

  // ✅ Load everything
  useEffect(() => {
    fetchNotifications();
    fetchMothers();
    checkUpcomingAppointments();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => fetchNotifications()
      )
      .subscribe();

    const interval = setInterval(() => {
      checkUpcomingAppointments();
    }, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // ✅ Helpers
  const filteredNotifications =
    filter === "all" ? notificationsData : notificationsData.filter((n) => n.type === filter);

  const unreadCount = notificationsData.filter((n) => !n.is_read).length;

  const typeColor = (type: string) => {
    switch (type) {
      case "alert":
        return "#e74c3c";
      case "reminder":
        return "#f1c40f";
      default:
        return "#3498db";
    }
  };

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Notifications</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY={true}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
          <IonText color="medium">
            <div style={{ textAlign: "center", marginBottom: 12, fontSize: 13 }}>
              🔔 View and send reminders to mothers.
            </div>
          </IonText>

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            {["all", "reminder", "alert", "info"].map((f) => (
              <IonButton
                key={f}
                size="small"
                fill={filter === f ? "solid" : "outline"}
                color="primary"
                onClick={() => setFilter(f as any)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </IonButton>
            ))}
          </div>

          {filteredNotifications.length === 0 ? (
            <div style={{ textAlign: "center", color: "#666", marginTop: 24 }}>
              No notifications found.
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <IonCard
                key={n.id}
                style={{
                  borderRadius: 14,
                  opacity: n.is_read ? 0.6 : 1,
                  borderLeft: `6px solid ${typeColor(n.type)}`,
                }}
                onClick={() => !n.is_read && markAsRead(n.id)}
              >
                <IonCardHeader>
                  <IonCardTitle>{n.title}</IonCardTitle>
                  <div style={{ fontSize: 12, color: "#777" }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </IonCardHeader>
                <IonCardContent>{n.message}</IonCardContent>
              </IonCard>
            ))
          )}

          {notificationsData.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <IonButton size="small" fill="outline" color="medium" onClick={markAllAsRead}>
                <IonIcon icon={checkmarkDone} slot="start" />
                Mark All as Read
              </IonButton>
            </div>
          )}
        </div>

        {/* Floating FAB */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary" onClick={() => setShowModal(true)}>
            <IonIcon icon={add} />
            {unreadCount > 0 && (
              <IonBadge color="danger" style={{ position: "absolute", top: -2, right: -2 }}>
                {unreadCount}
              </IonBadge>
            )}
          </IonFabButton>
        </IonFab>

        {/* Add Notification Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
            <h3>Add Notification</h3>

            <IonList lines="full">
              <IonItem>
                <IonLabel position="stacked">Title</IonLabel>
                <IonInput
                  value={formData.title}
                  onIonChange={(e) => setFormData({ ...formData, title: (e.target as any).value })}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Message</IonLabel>
                <IonInput
                  value={formData.message}
                  onIonChange={(e) =>
                    setFormData({ ...formData, message: (e.target as any).value })
                  }
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Type</IonLabel>
                <IonSelect
                  value={formData.type}
                  onIonChange={(e) => setFormData({ ...formData, type: e.detail.value })}
                >
                  <IonSelectOption value="reminder">Reminder</IonSelectOption>
                  <IonSelectOption value="alert">Alert</IonSelectOption>
                  <IonSelectOption value="info">Info</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel>Send to All Mothers</IonLabel>
                <IonCheckbox
                  checked={selectAll}
                  onIonChange={(e) => {
                    setSelectAll(e.detail.checked);
                    if (e.detail.checked) setSelectedMothers([]);
                  }}
                />
              </IonItem>

              {!selectAll && (
                <IonItem>
                  <IonLabel position="stacked">Select Mothers</IonLabel>
                  <IonSelect
                    multiple
                    value={selectedMothers}
                    onIonChange={(e) => setSelectedMothers(e.detail.value)}
                  >
                    {mothers.map((m) => (
                      <IonSelectOption key={m.id} value={m.id}>
                        {m.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              )}
            </IonList>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <IonButton expand="block" onClick={addNotification}>
                Send
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={() => setShowModal(false)}>
                Cancel
              </IonButton>
            </div>
          </div>
        </IonModal>

        <IonToast
          isOpen={toast.show}
          message={toast.message}
          color={toast.color}
          duration={2000}
          onDidDismiss={() => setToast({ ...toast, show: false })}
        />
        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </MainLayout>
  );
};

export default NotificationPage;
