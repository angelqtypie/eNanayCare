import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonSpinner,
  IonInput,
} from "@ionic/react";
import { medkitOutline, searchOutline } from "ionicons/icons";
import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";
import { motion } from "framer-motion";

const VisitRecords: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch visits with filter (Week / Month / Year / All)
  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      const today = new Date();
      let startDate: string | null = null;

      if (filter === "Week") {
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay());
        startDate = firstDay.toISOString().split("T")[0];
      } else if (filter === "Month") {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = firstDay.toISOString().split("T")[0];
      } else if (filter === "Year") {
        const firstDay = new Date(today.getFullYear(), 0, 1);
        startDate = firstDay.toISOString().split("T")[0];
      }

      let query = supabase
        .from("health_records")
        .select(`id, mother_id, encounter_date, notes, mothers(name)`)
        .order("encounter_date", { ascending: false });

      if (startDate) query = query.gte("encounter_date", startDate);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching visit records:", error);
        setRecords([]);
      } else {
        setRecords(data ?? []);
      }

      setLoading(false);
    };

    fetchVisits();
  }, [filter]);

  // Search filter
  const filteredRecords = records.filter(
    (r) =>
      r.mothers?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.notes?.toLowerCase().includes(search.toLowerCase())
  );

  // Count total visits
  const totalVisits = filteredRecords.length;

  return (
    <MainLayout>
      <motion.div
        className="visit-records-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* HEADER */}
        <div className="visit-header">
          <h1>
            Health Visit Records <IonIcon icon={medkitOutline} className="icon" />
          </h1>

          <div className="filter-container">
            <span>Filter by:</span>
            <IonSelect
              value={filter}
              onIonChange={(e) => setFilter(e.detail.value)}
              interface="popover"
              className="filter-select"
            >
              <IonSelectOption value="All">All</IonSelectOption>
              <IonSelectOption value="Week">This Week</IonSelectOption>
              <IonSelectOption value="Month">This Month</IonSelectOption>
              <IonSelectOption value="Year">This Year</IonSelectOption>
            </IonSelect>
          </div>
        </div>

        {/* VISIT LOGBOOK CARD */}
        <IonCard className="records-card">
          <IonCardHeader>
            <IonCardTitle>
              Visit Logbook
              <div className="search-bar">
                <IonIcon icon={searchOutline} className="search-icon" />
                <IonInput
                  placeholder="Search by name, purpose or notes..."
                  value={search}
                  onIonChange={(e) => setSearch(e.detail.value!)}
                  className="search-input"
                />
              </div>
            </IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            {loading ? (
              <div className="loading-container">
                <IonSpinner name="dots" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <p className="empty-text">No visit records found.</p>
            ) : (
              <>
                <p className="visit-count">
                  Total Visits: <strong>{totalVisits}</strong>
                </p>
                <table className="visit-table">
                  <thead>
                    <tr>
                      <th>Mother</th>
                      <th>Encounter Date</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((rec) => (
                      <tr key={rec.id}>
                        <td>{rec.mothers?.name || "Unknown"}</td>
                        <td>{rec.encounter_date}</td>
                        <td>{rec.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </IonCardContent>
        </IonCard>

        {/* STYLES */}
        <style>{`
          .visit-records-container {
            padding: 1.5rem;
          }
          .visit-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.2rem;
          }
          .visit-header h1 {
            font-size: 1.4rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }
          .filter-container {
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }
          .filter-select {
            min-width: 130px;
          }
          .records-card {
            border-radius: 16px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }
          .search-bar {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            margin-top: 0.5rem;
          }
          .search-input {
            flex: 1;
            font-size: 0.9rem;
          }
          .search-icon {
            color: #007aff;
          }
          .visit-count {
            font-size: 0.95rem;
            font-weight: 500;
            color: #007aff;
            margin-bottom: 0.8rem;
          }
          .visit-table {
            width: 100%;
            border-collapse: collapse;
          }
          .visit-table th, .visit-table td {
            text-align: left;
            padding: 0.6rem;
          }
          .visit-table th {
            border-bottom: 2px solid #007aff;
            font-weight: bold;
          }
          .visit-table tr:nth-child(even) {
            background-color: #fafafa;
          }
          .loading-container {
            display: flex;
            justify-content: center;
            padding: 1rem;
          }
          .empty-text {
            text-align: center;
            color: gray;
            padding: 1rem;
          }
        `}</style>
      </motion.div>
    </MainLayout>
  );
};

export default VisitRecords;
