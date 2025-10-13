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
} from "@ionic/react";
import { motion } from "framer-motion";
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

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "appointment" | "material" | "health" | "system";
}

const MotherNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch mother info
        const { data: mother } = await supabase
          .from("mothers")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (!mother) return;

        const today = new Date();
        const next3Days = new Date();
        next3Days.setDate(today.getDate() + 3);

        // Appointments
        const { data: appointments } = await supabase
          .from("appointments")
          .select("id, date, time, location, status")
          .eq("mother_id", mother.id)
          .gte("date", today.toISOString().split("T")[0])
          .lte("date", next3Days.toISOString().split("T")[0])
          .order("date", { ascending: true });

        // Materials
        const { data: materials } = await supabase
          .from("educational_materials")
          .select("id, title, category, created_at")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3);

        // Health records
        const { data: records } = await supabase
          .from("health_records")
          .select("id, encounter_date, notes")
          .eq("mother_id", mother.id)
          .order("encounter_date", { ascending: false })
          .limit(1);

        const notifList: NotificationItem[] = [];

        // Appointments Notifications
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

        // Educational Materials Notifications
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

        // Health Record Notifications
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

        // Built-in Permanent System Notifications
        notifList.push(
          {
            id: "sys1",
            title: "💡 Stay Hydrated",
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const badgeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "primary";
      case "material":
        return "success";
      case "health":
        return "warning";
      default:
        return "tertiary";
    }
  };

  return (
    <MotherMainLayout>
      <IonHeader translucent>
        <IonToolbar color="light">
          <IonTitle className="text-center font-bold text-pink-600">
            Notifications
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding bg-gradient-to-b from-pink-50 to-white">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <IonSpinner name="crescent" color="danger" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            You’re all caught up 💖
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n: NotificationItem, i: number) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <IonCard className="rounded-2xl shadow-sm hover:shadow-md border border-pink-100 bg-white transition-all duration-300">
                  <IonCardContent>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="font-semibold text-gray-800 text-base">
                        {n.title}
                      </h2>
                      <IonBadge color={badgeColor(n.type)}>{n.type}</IonBadge>
                    </div>
                    <p className="text-sm text-gray-700 leading-snug mb-1">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400">{n.time}</p>
                  </IonCardContent>
                </IonCard>
              </motion.div>
            ))}
          </div>
        )}
      </IonContent>
    </MotherMainLayout>
  );
};

export default MotherNotifications;
