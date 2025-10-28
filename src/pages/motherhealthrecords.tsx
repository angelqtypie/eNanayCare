// src/pages/HealthRecord.tsx
import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonSelect,
  IonSelectOption,
  IonIcon,
} from "@ionic/react";
import { motion } from "framer-motion";
import {
  heartOutline,
  pulseOutline,
  calendarOutline,
  bodyOutline,
  waterOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MotherMainLayout from "../layouts/MotherMainLayout";

const HealthRecord: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    handleFilterChange(filter);
  }, [records, filter]);

  const fetchRecords = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: mother } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mother?.mother_id) {
        setError("Mother profile not found.");
        return;
      }

      const { data: recordsData, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("mother_id", mother.mother_id)
        .order("encounter_date", { ascending: false });

      if (error) throw error;

      setRecords(recordsData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load health records.");
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    if (value === "all") setFilteredRecords(records);
    else if (value === "latest") setFilteredRecords(records.slice(0, 1));
    else if (value === "3months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      setFilteredRecords(
        records.filter((r) => new Date(r.encounter_date) >= threeMonthsAgo)
      );
    }
  };

  return (
    <MotherMainLayout>
      {/* HEADER */}
      <IonHeader>
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <IonToolbar
            style={{
              "--background": "linear-gradient(135deg, #fbd5e7, #fde6f2, #fff)",
              "--color": "#6a3a55",
            }}
          >
            <IonTitle
              style={{
                fontWeight: "700",
                fontSize: "1.1rem",
                textAlign: "center",
                color: "#7c3a67",
              }}
            >
              Health Record
            </IonTitle>
          </IonToolbar>
        </motion.div>
      </IonHeader>

      {/* CONTENT */}
      <IonContent fullscreen className="health-container">
        {error && <IonText color="danger">{error}</IonText>}

        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="header-title">Your Health Journey</h2>
          <p className="header-subtitle">
            Track your vital signs and progress throughout pregnancy
          </p>
        </motion.div>

        {/* FILTER */}
        <div className="filter-wrapper">
          <IonSelect
            interface="popover"
            value={filter}
            onIonChange={(e) => handleFilterChange(e.detail.value!)}
            className="filter-select"
          >
            <IonSelectOption value="all">All Records</IonSelectOption>
            <IonSelectOption value="latest">Latest Record</IonSelectOption>
            <IonSelectOption value="3months">Last 3 Months</IonSelectOption>
          </IonSelect>
        </div>

        {/* RECORDS */}
        {filteredRecords.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <IonIcon
              icon={heartOutline}
              style={{ fontSize: "42px", color: "#f47ba7" }}
            />
            <p>No health records found yet.</p>
          </motion.div>
        ) : (
          filteredRecords.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <IonCard className="record-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon
                      icon={calendarOutline}
                      style={{ marginRight: "6px", color: "#e85d9b" }}
                    />
                    {new Date(r.encounter_date).toLocaleDateString("en-PH", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <div className="record-grid">
                    <div className="record-item">
                      <IonIcon icon={bodyOutline} />
                      <span>
                        <b>Weight:</b> {r.weight ?? "-"} kg
                      </span>
                    </div>
                    <div className="record-item">
                      <IonIcon icon={pulseOutline} />
                      <span>
                        <b>Blood Pressure:</b> {r.bp ?? "-"}
                      </span>
                    </div>
                    <div className="record-item">
                      <IonIcon icon={waterOutline} />
                      <span>
                        <b>Temperature:</b> {r.temp ?? "-"} °C
                      </span>
                    </div>
                    <div className="record-item">
                      <IonIcon icon={heartOutline} />
                      <span>
                        <b>Heart Rate:</b> {r.hr ?? "-"} bpm
                      </span>
                    </div>
                  </div>

                  {r.notes && (
                    <div className="notes-box">
                      <p>
                        <b>Notes:</b> {r.notes}
                      </p>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            </motion.div>
          ))
        )}

        <style>{`
          .health-container {
            background: #fff9fc;
            font-family: "Poppins", sans-serif;
            padding-bottom: 70px;
          }

          .page-header {
            text-align: center;
            margin: 25px 0 10px;
          }
          .header-title {
            color: #e85d9b;
            font-weight: 700;
            font-size: 1.4rem;
          }
          .header-subtitle {
            color: #777;
            font-size: 0.9rem;
          }

          .filter-wrapper {
            text-align: center;
            margin: 12px 0 20px;
          }
          .filter-select {
            width: 70%;
            max-width: 260px;
            border-radius: 16px;
            box-shadow: 0 3px 10px rgba(232, 93, 155, 0.25);
            padding: 5px 8px;
            background: #fff;
            font-size: 0.9rem;
          }

          .record-card {
            background: #fff;
            border-radius: 20px;
            margin: 14px 18px;
            box-shadow: 0 4px 14px rgba(241, 167, 194, 0.2);
            transition: all 0.3s ease;
          }
          .record-card:hover {
            transform: scale(1.02);
            box-shadow: 0 6px 20px rgba(241, 167, 194, 0.35);
          }

          .record-card ion-card-title {
            color: #c94b88;
            font-weight: 600;
            font-size: 1rem;
          }

          .record-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 10px;
            margin-top: 4px;
          }

          .record-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            color: #444;
          }

          .record-item ion-icon {
            color: #e85d9b;
          }

          .notes-box {
            background: #fff2f7;
            border-left: 4px solid #f47ba7;
            padding: 10px;
            border-radius: 12px;
            margin-top: 10px;
            font-size: 0.9rem;
            color: #555;
            line-height: 1.4;
          }

          .empty-state {
            text-align: center;
            margin-top: 80px;
            color: #999;
            font-size: 0.95rem;
          }
        `}</style>
      </IonContent>
    </MotherMainLayout>
  );
};

export default HealthRecord;
