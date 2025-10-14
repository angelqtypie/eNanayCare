import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonBadge,
  useIonViewWillLeave,
  useIonViewDidEnter,
} from "@ionic/react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../utils/supabaseClient";
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

type NotificationType = "appointment" | "material" | "health" | "system";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
}

const MotherNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: mother } = await supabase
          .from("mothers")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();
        if (!mother) return;

        const today = new Date();
        const next3Days = new Date(today);
        next3Days.setDate(today.getDate() + 3);

        const { data: appointments } = await supabase
          .from("appointments")
          .select("id, date, time, location, status")
          .eq("mother_id", mother.id)
          .gte("date", today.toISOString().split("T")[0])
          .lte("date", next3Days.toISOString().split("T")[0])
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
          .eq("mother_id", mother.id)
          .order("encounter_date", { ascending: false })
          .limit(1);

        const notifList: NotificationItem[] = [];

        (appointments ?? []).forEach((a: Appointment) => {
          const daysLeft = Math.ceil(
            (new Date(a.date).getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          notifList.push({
            id: a.id,
            title: "Upcoming Appointment",
            message:
              daysLeft === 0
                ? `You have an appointment today at ${a.time || "TBA"}.`
                : `Your appointment is in ${daysLeft} day${
                    daysLeft > 1 ? "s" : ""
                  } (${a.date}) at ${a.location || "Health Center"}.`,
            time: new Date(a.date).toLocaleDateString("en-PH"),
            type: "appointment",
          });
        });

        (materials ?? []).forEach((m: Material) => {
          notifList.push({
            id: m.id,
            title: "New Learning Material",
            message: `“${m.title}” has been added ${
              m.category ? `to ${m.category}` : ""
            }. Learn something new today!`,
            time: new Date(m.created_at).toLocaleString("en-PH"),
            type: "material",
          });
        });

        (records ?? []).forEach((r: HealthRecord) => {
          notifList.push({
            id: r.id,
            title: "Health Record Update",
            message: `Last health check recorded on ${r.encounter_date}. ${
              r.notes ? r.notes : ""
            }`,
            time: new Date(r.encounter_date).toLocaleDateString("en-PH"),
            type: "health",
          });
        });

        notifList.push(
          {
            id: "sys1",
            title: "💧 Stay Hydrated",
            message:
              "Drink plenty of water throughout the day to stay healthy and support your baby’s development.",
            time: new Date().toLocaleDateString("en-PH"),
            type: "system",
          },
          {
            id: "sys2",
            title: "🧘 Relaxation Reminder",
            message:
              "Take a few minutes to breathe deeply and rest. A calm mother helps a calm baby!",
            time: new Date().toLocaleDateString("en-PH"),
            type: "system",
          }
        );

        notifList.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );
        setNotifications(notifList);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const badgeColor = (type: NotificationType): string => {
    const map: Record<NotificationType, string> = {
      appointment: "primary",
      material: "success",
      health: "warning",
      system: "tertiary",
    };
    return map[type];
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
          <div className="notif-empty">You’re all caught up 💖</div>
        ) : (
          <motion.div
            className="notif-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <IonCard className={`notif-card notif-${n.type}`}>
                    <IonCardContent>
                      <div className="notif-header">
                        <h2>{n.title}</h2>
                        <IonBadge color={badgeColor(n.type)}>{n.type}</IonBadge>
                      </div>
                      <p className="notif-message">{n.message}</p>
                      <p className="notif-time">{n.time}</p>
                    </IonCardContent>
                  </IonCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </IonContent>

      <style>{`
        .notif-toolbar {
          linear-gradient(120deg, #f9e0eb, #fbeaf1, #faf2f7);
          color: #6b0f47;
          text-align: center;
          font-weight: 700;
          border-radius: 0 0 18px 18px;
        }

        .notif-loading, .notif-empty {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80vh;
          color: #d5649f;
          font-size: 1rem;
          font-weight: 500;
        }

        .notif-container {
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: linear-gradient(to bottom, #fff6fb, #fff);
          min-height: 100%;
        }

        .notif-card {
          border-radius: 18px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.06);
          border: 1px solid #fbe2ec;
          transition: all 0.25s ease;
          background: #fff;
        }
        .notif-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 18px rgba(213,100,159,0.15);
        }

        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .notif-header h2 {
          font-size: 1rem;
          color: #a33b77;
          font-weight: 600;
        }
        .notif-message {
          font-size: 0.9rem;
          color: #444;
          line-height: 1.5;
          margin-bottom: 5px;
        }
        .notif-time {
          font-size: 0.75rem;
          color: #999;
          text-align: right;
        }

        .notif-appointment { border-left: 4px solid #3b82f6; }
        .notif-material { border-left: 4px solid #16a34a; }
        .notif-health { border-left: 4px solid #eab308; }
        .notif-system { border-left: 4px solid #a855f7; }

        @media (max-width: 460px) {
          .notif-header h2 { font-size: 0.95rem; }
          .notif-message { font-size: 0.85rem; }
        }
      `}</style>
    </MotherMainLayout>
  );
};

export default MotherNotifications;
