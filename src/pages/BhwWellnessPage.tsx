// File: src/pages/BhwWellnessPage.tsx
import React, { useEffect, useState } from "react";
import {
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
  IonSpinner,
} from "@ionic/react";
import { personCircleOutline, filterOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MainLayout from "../layouts/MainLayouts";

interface Mother {
  mother_id: string;
  first_name: string;
  last_name: string;
  address: string;
  user_id: string;
}

interface WellnessLog {
  mother_id: string;
  sleep_hours: string | null;
  meals: string | null;
  exercise: string | null;
  mood: string | null;
  vitamins: string | null;
  hydration: string | null;
  date_logged: string;
}

const BhwWellnessPage: React.FC = () => {
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchMothersByZone();
  }, []);

  useEffect(() => {
    if (selectedDate) fetchLogsByDate(selectedDate);
  }, [selectedDate]);

  // ✅ Fetch only mothers belonging to the same zone as the logged-in BHW
  const fetchMothersByZone = async () => {
    try {
      // 1️⃣ Get logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("User not found");

      // 2️⃣ Fetch zone from users table
      const { data: bhwData, error: bhwError } = await supabase
        .from("users")
        .select("zone, role")
        .eq("id", user.id)
        .single();
      if (bhwError) throw bhwError;

      const zone = bhwData?.zone?.trim();
      const role = bhwData?.role;

      // 3️⃣ Fetch mothers based on zone — admins see all
      let query = supabase
        .from("mothers")
        .select("mother_id, first_name, last_name, address, user_id")
        .order("last_name", { ascending: true });

      if (role !== "admin" && zone) {
        query = query.ilike("address", `%${zone}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMothers(data || []);
    } catch (error) {
      console.error("Error fetching mothers by zone:", error);
      setToast("Error loading mothers.");
    }
  };

  const fetchLogsByDate = async (date: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wellness_logs")
        .select(
          "mother_id, sleep_hours, meals, exercise, mood, vitamins, hydration, date_logged"
        )
        .eq("date_logged", date);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalMothers = mothers.length;
  const mothersWithLogs = mothers.filter((m) =>
    logs.some((log) => log.mother_id === m.mother_id)
  ).length;
  const complianceRate =
    totalMothers > 0 ? Math.round((mothersWithLogs / totalMothers) * 100) : 0;

  const getBarColor = () => {
    if (complianceRate >= 80) return "#16a34a";
    if (complianceRate >= 50) return "#eab308";
    return "#dc2626";
  };

  const filteredMothers = mothers.filter((m) =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const getMotherLog = (id: string) => logs.find((log) => log.mother_id === id);

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="font-semibold text-center text-base md:text-lg">
            Wellness Monitoring
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* 🔹 Summary Section */}
        <IonCard className="shadow-md rounded-2xl">
          <IonCardHeader>
            <IonCardTitle className="flex items-center gap-2 text-base md:text-lg">
              <IonIcon icon={personCircleOutline} />
              Daily Wellness Summary
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p className="text-gray-500 mb-2 text-sm md:text-base">
              {selectedDate || "Select a date to view summary"}
            </p>
            <IonGrid>
              <IonRow className="text-center">
                <IonCol size="4">
                  <h2 className="text-xl font-bold md:text-2xl">{totalMothers}</h2>
                  <p className="text-xs md:text-sm text-gray-500">Total Mothers</p>
                </IonCol>
                <IonCol size="4">
                  <h2 className="text-xl font-bold text-green-600 md:text-2xl">
                    {mothersWithLogs}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">With Logs</p>
                </IonCol>
                <IonCol size="4">
                  <h2
                    className="text-xl font-bold md:text-2xl"
                    style={{ color: getBarColor() }}
                  >
                    {complianceRate}%
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">Compliance</p>
                </IonCol>
              </IonRow>
            </IonGrid>

            <div className="progress-bar mt-3">
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

        {/* 🔹 Date Filter */}
        <IonItem className="ion-margin-top rounded-xl shadow-sm">
          <IonLabel position="stacked">Date</IonLabel>
          <IonInput
            type="date"
            value={selectedDate}
            onIonChange={(e) => setSelectedDate(e.detail.value!)}
          />
        </IonItem>

        <div className="flex justify-end mt-3">
          <IonButton
            expand="block"
            color="primary"
            onClick={() => selectedDate && fetchLogsByDate(selectedDate)}
            className="w-full md:w-auto"
          >
            <IonIcon icon={filterOutline} slot="start" />
            FILTER
          </IonButton>
        </div>

        {/* 🔹 Search */}
        <IonSearchbar
          placeholder="Search mother..."
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          className="ion-margin-top rounded-xl"
        />

        {/* 🔹 Scrollable Table */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="text-base font-semibold">
              Wellness Logs Overview
            </IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <IonSpinner name="crescent" />
              </div>
            ) : (
              <div className="scroll-container">
                <div className="table-wrapper">
                  <IonGrid className="table-grid">
                    <IonRow className="table-header">
                      <IonCol>Mother</IonCol>
                      <IonCol>Sleep</IonCol>
                      <IonCol>Meals</IonCol>
                      <IonCol>Exercise</IonCol>
                      <IonCol>Mood</IonCol>
                      <IonCol>Vitamins</IonCol>
                      <IonCol>Hydration</IonCol>
                      <IonCol>Status</IonCol>
                    </IonRow>

                    {filteredMothers.map((mother) => {
                      const log = getMotherLog(mother.mother_id);
                      return (
                        <IonRow
                          key={mother.mother_id}
                          className={`table-row ${log ? "logged" : "nologue"}`}
                        >
                          <IonCol className="font-medium whitespace-nowrap">
                            {mother.first_name} {mother.last_name}
                          </IonCol>
                          <IonCol>{log?.sleep_hours || "-"}</IonCol>
                          <IonCol>{log?.meals || "-"}</IonCol>
                          <IonCol>{log?.exercise || "-"}</IonCol>
                          <IonCol>{log?.mood || "-"}</IonCol>
                          <IonCol>{log?.vitamins || "-"}</IonCol>
                          <IonCol>{log?.hydration || "-"}</IonCol>
                          <IonCol>
                            <span
                              className={`status ${log ? "logged" : "nologue"}`}
                            >
                              {log ? "Logged" : "No Log"}
                            </span>
                          </IonCol>
                        </IonRow>
                      );
                    })}
                  </IonGrid>
                </div>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* 🔹 Styles */}
        <style>{`
          .progress-bar { background: #e5e7eb; height: 8px; border-radius: 6px; }
          .progress { height: 100%; transition: width 0.4s ease; }
          .table-header { font-weight: 600; background: #f8fafc; border-bottom: 2px solid #e5e7eb; }
          .table-row { font-size: 14px; border-bottom: 1px solid #f1f5f9; }
          .table-row.logged { background: #ecfdf5; }
          .table-row.nologue { background: #fef2f2; }
          .status { padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; color: white; }
          .status.logged { background: #16a34a; }
          .status.nologue { background: #dc2626; }

          /* 🔹 Scroll container for swipe left-right */
          .scroll-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 transparent;
          }
          .scroll-container::-webkit-scrollbar { height: 6px; }
          .scroll-container::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 4px;
          }

          /* Fixed table width like desktop even in mobile */
          .table-wrapper {
            min-width: 900px;
            padding: 4px;
          }

          @media (max-width: 768px) {
            .table-header, .table-row { font-size: 12px; }
            .status { font-size: 10px; padding: 2px 5px; }
          }
        `}</style>
      </IonContent>
    </MainLayout>
  );
};

export default BhwWellnessPage;
