import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
} from "@ionic/react";
import { personCircleOutline, filterOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient"; // ✅ central Supabase client
import MainLayout from "../layouts/MainLayouts";


interface User {
  id: string;
  full_name: string;
  role: string;
}

interface Mother {
  mother_id: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

interface WellnessLog {
  mother_id: string;
  sleep_hours: string | null;
  meals: string | null;
  exercise: string | null;
  mood: string | null;
  vitamins: string | null;
  date_logged: string;
}

const BhwWellnessPage: React.FC = () => {
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetchMothers();
  }, []);

  useEffect(() => {
    if (selectedDate) fetchLogsByDate(selectedDate);
  }, [selectedDate]);

  const fetchMothers = async () => {
    try {
      // ✅ Step 1: Get all users with role 'mother'
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id, full_name, role")
        .eq("role", "mother");

      if (userError) throw userError;
      if (!users) return;

      const userIds = users.map((u: User) => u.id);

      // ✅ Step 2: Fetch mothers linked to these user_ids
      const { data: mothersData, error: motherError } = await supabase
        .from("mothers")
        .select("mother_id, first_name, last_name, user_id")
        .in("user_id", userIds);

      if (motherError) throw motherError;

      setMothers(mothersData || []);
    } catch (error) {
      console.error("Error fetching mothers:", error);
    }
  };

  const fetchLogsByDate = async (date: string) => {
    try {
      const { data, error } = await supabase
        .from("wellness_logs")
        .select(
          "mother_id, sleep_hours, meals, exercise, mood, vitamins, date_logged"
        )
        .eq("date_logged", date);

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  // 🧮 Summary Calculations
  const totalMothers = mothers.length;
  const mothersWithLogs = mothers.filter((mother) =>
    logs.some((log) => log.mother_id === mother.mother_id)
  ).length;
  const complianceRate =
    totalMothers > 0 ? Math.round((mothersWithLogs / totalMothers) * 100) : 0;

  // 🎨 Progress Bar Color Logic
  const getBarColor = () => {
    if (complianceRate >= 80) return "#16a34a"; // green
    if (complianceRate >= 50) return "#eab308"; // yellow
    return "#dc2626"; // red
  };

  // 🔍 Search Filter
  const filteredMothers = mothers.filter((m) =>
    `${m.first_name} ${m.last_name}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const getMotherLog = (mother_id: string) =>
    logs.find((log) => log.mother_id === mother_id);

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>BHW Wellness Monitoring</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* 🔹 Summary Section */}
        <IonCard className="summary-card">
          <IonCardHeader>
            <IonCardTitle className="flex items-center gap-2">
              <IonIcon icon={personCircleOutline} />
              Daily Wellness Summary
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p className="text-gray-600 mb-3">
              {selectedDate ? selectedDate : "Select a date to view summary"}
            </p>
            <IonGrid>
              <IonRow className="text-center">
                <IonCol>
                  <h2 className="text-2xl font-bold text-primary">
                    {totalMothers}
                  </h2>
                  <p className="text-sm text-gray-500">Total Mothers</p>
                </IonCol>
                <IonCol>
                  <h2 className="text-2xl font-bold text-green-600">
                    {mothersWithLogs}
                  </h2>
                  <p className="text-sm text-gray-500">With Logs</p>
                </IonCol>
                <IonCol>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: getBarColor() }}
                  >
                    {complianceRate}%
                  </h2>
                  <p className="text-sm text-gray-500">Compliance Rate</p>
                </IonCol>
              </IonRow>
            </IonGrid>

            <div className="progress-bar">
              <div
                className="progress"
                style={{
                  width: `${complianceRate}%`,
                  background: getBarColor(),
                }}
              ></div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* 🔹 Filter Section */}
        <IonItem className="ion-margin-top">
          <IonLabel position="stacked">Date</IonLabel>
          <IonInput
            type="date"
            value={selectedDate}
            onIonChange={(e) => setSelectedDate(e.detail.value!)}
          />
        </IonItem>

        <div className="flex justify-end mt-3">
          <IonButton
            color="primary"
            onClick={() => {
              if (selectedDate) fetchLogsByDate(selectedDate);
            }}
          >
            <IonIcon icon={filterOutline} slot="start" />
            FILTER
          </IonButton>
        </div>

        {/* 🔹 Searchbar */}
        <IonSearchbar
          placeholder="Search mother..."
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          className="ion-margin-top"
        ></IonSearchbar>

        {/* 🔹 Data Table */}
        <IonCard>
          <IonCardContent>
            <IonGrid>
              <IonRow className="table-header">
                <IonCol>Mother</IonCol>
                <IonCol>Sleep</IonCol>
                <IonCol>Meals</IonCol>
                <IonCol>Exercise</IonCol>
                <IonCol>Mood</IonCol>
                <IonCol>Vitamins</IonCol>
                <IonCol>Status</IonCol>
              </IonRow>

              {filteredMothers.length > 0 ? (
                filteredMothers.map((mother) => {
                  const log = getMotherLog(mother.mother_id);
                  return (
                    <IonRow
                      key={mother.mother_id}
                      className={`table-row ${
                        log ? "logged" : "nologue"
                      } hover:shadow-md transition-all duration-200`}
                    >
                      <IonCol className="font-medium">
                        {mother.first_name} {mother.last_name}
                      </IonCol>
                      <IonCol>{log?.sleep_hours || "-"}</IonCol>
                      <IonCol>{log?.meals || "-"}</IonCol>
                      <IonCol>{log?.exercise || "-"}</IonCol>
                      <IonCol>{log?.mood || "-"}</IonCol>
                      <IonCol>{log?.vitamins || "-"}</IonCol>
                      <IonCol>
                        {log ? (
                          <span className="status logged">Logged</span>
                        ) : (
                          <span className="status nologue">No Log</span>
                        )}
                      </IonCol>
                    </IonRow>
                  );
                })
              ) : (
                <IonRow>
                  <IonCol className="text-center text-gray-500">
                    No mothers found.
                  </IonCol>
                </IonRow>
              )}
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* 🌈 Inline Styling */}
        <style>{`
      .compact {
        margin-bottom: 0.5rem;
      }
      .progress-bar {
        background: #e5e7eb;
        height: 6px;
        border-radius: 5px;
      }
      .progress {
        height: 100%;
        transition: width 0.3s ease;
      }
      .table-header {
        font-weight: 600;
        background: #f8fafc;
        border-bottom: 2px solid #e5e7eb;
      }
      .table-row {
        font-size: 14px;
        border-bottom: 1px solid #f1f5f9;
      }
      .table-row.logged { background: #ecfdf5; }
      .table-row.nologue { background: #fff1f2; }
      .status {
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        color: white;
      }
      .status.logged { background: #16a34a; }
      .status.nologue { background: #dc2626; }
    `}</style>
      </IonContent>
    </MainLayout>
  );
};

export default BhwWellnessPage;
