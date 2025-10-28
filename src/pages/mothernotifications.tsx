// src/pages/MotherNotifications.tsx
import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonBadge,
  IonModal,
  IonButton,
  IonIcon,
  useIonViewWillLeave,
  useIonViewDidEnter,
} from "@ionic/react";
import { closeCircle } from "ionicons/icons";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router-dom";
import MotherMainLayout from "../layouts/MotherMainLayout";

interface Appointment {
  id: string;
  date: string;
  time: string | null;
  location: string | null;
  status: string;
}

interface Material {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
}

interface HealthRecord {
  id: string;
  encounter_date: string;
  notes: string | null;
}

interface BarangayUpdate {
  id: string;
  title: string;
  description: string;
  date_posted: string;
}

type NotificationType =
  | "appointment"
  | "material"
  | "health"
  | "system"
  | "barangay";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  data?: BarangayUpdate;
}

const MotherNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBarangay, setSelectedBarangay] = useState<BarangayUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useHistory();

  useIonViewDidEnter(() => {
    requestAnimationFrame(() => {
      const hiddenPages = document.querySelectorAll('[aria-hidden="true"]');
      hiddenPages.forEach((p) => {
        p.removeAttribute("aria-hidden");
        (p as HTMLElement).setAttribute("inert", "");
      });
    });
  });

  useIonViewWillLeave(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: mother } = await supabase
          .from("mothers")
          .select("mother_id")
          .eq("user_id", user.id)
          .single();
        if (!mother) return;

        const today = new Date();

        const { data: appointments } = await supabase
          .from("appointments")
          .select("id, date, time, location, status")
          .eq("mother_id", mother.mother_id)
          .gte("date", today.toISOString().split("T")[0])
          .order("date", { ascending: true });

        const { data: materials } = await supabase
          .from("educational_materials")
          .select("id, title, category, created_at")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3);

        const { data: records } = await supabase
          .from("health_records")
          .select("id, encounter_date, notes")
          .eq("mother_id", mother.mother_id)
          .order("encounter_date", { ascending: false })
          .limit(1);

        const { data: barangayUpdates } = await supabase
          .from("barangay_updates")
          .select("id, title, description, date_posted")
          .order("date_posted", { ascending: false })
          .limit(3);

        // get previously read notification ids
        const { data: readNotifs } = await supabase
          .from("mother_notifications")
          .select("notif_id")
          .eq("mother_id", mother.mother_id);
        const readIds = readNotifs?.map((n: any) => n.notif_id) || [];

        const notifList: NotificationItem[] = [];

        // Appointment reminders
        (appointments ?? []).forEach((a: Appointment) => {
          const apptDate = new Date(a.date);
          const daysLeft = Math.ceil(
            (apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if ([3, 1, 0].includes(daysLeft)) {
            let message = "";
            if (daysLeft === 3)
              message = `Your appointment is in 3 days (${a.date}) at ${a.location || "Health Center"}.`;
            else if (daysLeft === 1)
              message = `Your appointment is tomorrow (${a.date}) at ${a.location || "Health Center"}.`;
            else message = `You have an appointment today at ${a.time || "TBA"} in ${a.location || "Health Center"}.`;

            const notifId = `${a.id}-reminder-${daysLeft}`;
            if (!readIds.includes(notifId)) {
              notifList.push({
                id: notifId,
                title: "📅 Appointment Reminder",
                message,
                time: new Date().toLocaleString("en-PH"),
                type: "appointment",
              });
            }
          }
        });

        // Materials
        (materials ?? []).forEach((m: Material) => {
          if (!readIds.includes(m.id)) {
            notifList.push({
              id: m.id,
              title: "📘 New Learning Material",
              message: `“${m.title}” has been added ${m.category ? `to ${m.category}` : ""}.`,
              time: new Date(m.created_at).toLocaleString("en-PH"),
              type: "material",
            });
          }
        });

        // Barangay updates (permanent)
        (barangayUpdates ?? []).forEach((b: BarangayUpdate) => {
          notifList.push({
            id: b.id,
            title: "📢 Barangay Update",
            message: `${b.title}: ${b.description.slice(0, 70)}...`,
            time: new Date(b.date_posted).toLocaleString("en-PH"),
            type: "barangay",
            data: b,
          });
        });

        // Health record
        (records ?? []).forEach((r: HealthRecord) => {
          if (!readIds.includes(r.id)) {
            notifList.push({
              id: r.id,
              title: "❤️ Health Record Update",
              message: `Health check recorded on ${r.encounter_date}. ${r.notes || ""}`,
              time: new Date(r.encounter_date).toLocaleDateString("en-PH"),
              type: "health",
            });
          }
        });

        // System reminders
        if (!readIds.includes("sys1"))
          notifList.push({
            id: "sys1",
            title: "💧 Stay Hydrated",
            message: "Drink plenty of water throughout the day.",
            time: new Date().toLocaleDateString("en-PH"),
            type: "system",
          });
        if (!readIds.includes("sys2"))
          notifList.push({
            id: "sys2",
            title: "🧘 Relaxation Reminder",
            message: "Take a few minutes to rest. A calm mother helps a calm baby.",
            time: new Date().toLocaleDateString("en-PH"),
            type: "system",
          });

        notifList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setNotifications(notifList);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markAsRead = async (notif: NotificationItem) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: mother } = await supabase
      .from("mothers")
      .select("mother_id")
      .eq("user_id", user.id)
      .single();
    if (!mother) return;

    if (notif.type !== "barangay") {
      await supabase.from("mother_notifications").insert({
        mother_id: mother.mother_id,
        notif_id: notif.id,
        type: notif.type,
        read_at: new Date().toISOString(),
      });
    }
  };

  const badgeColor = (type: NotificationType): string => {
    const map: Record<NotificationType, string> = {
      appointment: "primary",
      material: "success",
      health: "warning",
      system: "tertiary",
      barangay: "danger",
    };
    return map[type];
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    await markAsRead(notif);
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));

    switch (notif.type) {
      case "appointment":
        history.push("/motherscalendar");
        break;
      case "material":
        history.push("/educationalmaterials");
        break;
      case "health":
        history.push("/motherhealthrecords");
        break;
      case "barangay":
        setSelectedBarangay(notif.data || null);
        setIsModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleSwipeRemove = async (notif: NotificationItem) => {
    await markAsRead(notif);
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  return (
    <MotherMainLayout>
      <IonHeader translucent>
        <IonToolbar className="notif-toolbar">
          <IonTitle>Notifications</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {loading ? (
          <div className="notif-loading">
            <IonSpinner name="crescent" color="danger" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">🎉 You’re all caught up</div>
        ) : (
          <motion.div className="notif-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 120 }}
                  transition={{ delay: i * 0.04 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 100 && n.type !== "barangay") handleSwipeRemove(n);
                  }}
                >
                  <div className={`notif-card notif-${n.type}`} onClick={() => handleNotificationClick(n)}>
                    <div className="notif-header">
                      <h2>{n.title}</h2>
                      <IonBadge color={badgeColor(n.type)}>{n.type}</IonBadge>
                    </div>
                    <p className="notif-message">{n.message}</p>
                    <p className="notif-time">{n.time}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="danger">
              <IonTitle>Barangay Update</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setIsModalOpen(false)}>
                <IonIcon icon={closeCircle} color="light" />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedBarangay && (
              <>
                <h2>{selectedBarangay.title}</h2>
                <p style={{ marginTop: "8px" }}>{selectedBarangay.description}</p>
                <p style={{ marginTop: "12px", fontSize: "0.8rem", color: "#666", textAlign: "right" }}>
                  Posted on {new Date(selectedBarangay.date_posted).toLocaleString("en-PH")}
                </p>
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>

      <style>{`
        .notif-toolbar {
          background: linear-gradient(120deg, #ffdce7, #fff1f7, #fff);
          color: #7b1a57;
          font-weight: 700;
          text-align: center;
          border-radius: 0 0 18px 18px;
        }
        .notif-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: linear-gradient(to bottom, #fff9fd, #ffffff);
        }
        .notif-card {
          background: #fff;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-left: 5px solid var(--notif-accent);
          transition: all 0.2s ease-in-out;
        }
        .notif-card:hover {
          transform: scale(1.02);
          background: #fff7fa;
        }
        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notif-header h2 {
          font-size: 1rem;
          color: #a33b77;
          font-weight: 600;
        }
        .notif-message {
          font-size: 0.92rem;
          color: #444;
          margin-top: 6px;
          line-height: 1.5;
        }
        .notif-time {
          font-size: 0.75rem;
          color: #999;
          text-align: right;
          margin-top: 6px;
        }
        .notif-loading, .notif-empty {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80vh;
          color: #d5649f;
          font-weight: 500;
          font-size: 1.1rem;
        }
        .notif-appointment { --notif-accent: #3b82f6; }
        .notif-material { --notif-accent: #16a34a; }
        .notif-health { --notif-accent: #eab308; }
        .notif-system { --notif-accent: #a855f7; }
        .notif-barangay { --notif-accent: #ef4444; }
      `}</style>
    </MotherMainLayout>
  );
};

export default MotherNotifications;
