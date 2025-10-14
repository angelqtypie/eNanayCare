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
  IonButton,
  IonIcon,
  IonText,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { motion } from "framer-motion";
import {
  arrowBackOutline,
  heartOutline,
  pulseOutline,
  calendarOutline,
  bodyOutline,
  waterOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MotherMainLayout from "../layouts/MotherMainLayout";
import { useHistory } from "react-router-dom";

const HealthRecord: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    handleFilterChange(filter);
  }, [records, filter]);

  const fetchRecords = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;
      if (!user) return;

      const { data: mother } = await supabase
        .from("mothers")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!mother?.id) return;

      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("mother_id", mother.id)
        .order("encounter_date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load health records.");
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    if (value === "all") {
      setFilteredRecords(records);
    } else if (value === "latest") {
      setFilteredRecords(records.slice(0, 1));
    } else if (value === "3months") {
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <IonToolbar
            style={{
              "--background":
              " linear-gradient(120deg, #f9e0eb, #fbeaf1, #faf2f7)",
            "--color": "#6a3a55",
            }}
          >
            <IonButton
              fill="clear"
              slot="start"
              onClick={() => history.push("/dashboardmother")}
              style={{
                color: "#fff",
                borderRadius: "50%",
                marginLeft: "6px",
              }}
            >
              <IonIcon icon={arrowBackOutline} style={{ fontSize: "22px" }} />
            </IonButton>
            <IonTitle style={{ fontWeight: "bold" }}>Health Record</IonTitle>
          </IonToolbar>
        </motion.div>
      </IonHeader>

      {/* CONTENT */}
      <IonContent fullscreen scrollY={true} className="health-container">
        {error && <IonText color="danger">{error}</IonText>}

        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h2 className="header-title">Your Health Journey</h2>
          <p className="header-subtitle">
            Track your vital signs and progress throughout pregnancy
          </p>
        </motion.div>

        {/* FILTER DROPDOWN */}
        <div className="filter-wrapper">
          <IonSelect
            interface="popover"
            value={filter}
            onIonChange={(e) => handleFilterChange(e.detail.value!)}
            placeholder="Filter"
            className="filter-select"
          >
            <IonSelectOption value="all">All Records</IonSelectOption>
            <IonSelectOption value="latest">Latest Record</IonSelectOption>
            <IonSelectOption value="3months">Last 3 Months</IonSelectOption>
          </IonSelect>
        </div>

        {/* RECORDS LIST */}
        {filteredRecords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="empty-state"
          >
            <IonIcon icon={heartOutline} style={{ fontSize: "38px", color: "#f47ba7" }} />
            <p>No health records found.</p>
          </motion.div>
        ) : (
          filteredRecords.map((r, index) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <IonCard className="record-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={calendarOutline} style={{ marginRight: "6px", color: "#f47ba7" }} />
                    {new Date(r.encounter_date).toDateString()}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="record-row">
                    <IonIcon icon={bodyOutline} />
                    <span><b>Weight:</b> {r.weight ?? "-"} kg</span>
                  </div>
                  <div className="record-row">
                    <IonIcon icon={pulseOutline} />
                    <span><b>Blood Pressure:</b> {r.blood_pressure ?? "-"}</span>
                  </div>
                  <div className="record-row">
                    <IonIcon icon={waterOutline} />
                    <span><b>Hemoglobin:</b> {r.hemoglobin_level ?? "-"}</span>
                  </div>
                  <div className="record-row">
                    <IonIcon icon={heartOutline} />
                    <span><b>Weeks of Gestation:</b> {r.weeks_of_gestation ?? "-"}</span>
                  </div>
                  {r.notes && (
                    <div className="notes-box">
                      <p><b>Notes:</b> {r.notes}</p>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            </motion.div>
          ))
        )}

        {/* INLINE STYLES */}
        <style>{`
          .health-container {
            background: #fff8fb;
            font-family: "Poppins", sans-serif;
            padding-bottom: 70px;
          }

          .page-header {
            text-align: center;
            margin-top: 20px;
            margin-bottom: 10px;
          }

          .header-title {
            color: #e76fae;
            font-weight: 700;
            font-size: 1.4rem;
          }

          .header-subtitle {
            color: #999;
            font-size: 0.9rem;
          }

          .filter-wrapper {
            text-align: center;
            margin: 15px 0;
          }

          .filter-select {
            width: 60%;
            max-width: 240px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(244, 123, 167, 0.25);
            padding: 4px 8px;
            font-size: 0.9rem;
          }

          .empty-state {
            text-align: center;
            margin-top: 70px;
            color: #999;
            font-size: 0.95rem;
          }

          .record-card {
            background: rgba(255, 255, 255, 0.92);
            border-radius: 20px;
            margin: 14px 18px;
            box-shadow: 0 4px 14px rgba(241, 167, 194, 0.25);
            transition: all 0.3s ease;
          }

          .record-card:hover {
            transform: scale(1.02);
            box-shadow: 0 6px 18px rgba(241, 167, 194, 0.35);
          }

          .record-card ion-card-title {
            color: #d764a0;
            font-weight: 600;
            font-size: 1rem;
          }

          .record-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            font-size: 0.95rem;
          }

          .record-row ion-icon {
            color: #f47ba7;
          }

          .notes-box {
            background: #fff2f7;
            border-left: 4px solid #f47ba7;
            padding: 8px 10px;
            border-radius: 10px;
            margin-top: 8px;
            font-size: 0.9rem;
            color: #555;
          }
        `}</style>
      </IonContent>
    </MotherMainLayout>
  );
};

export default HealthRecord;
