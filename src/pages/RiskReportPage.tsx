import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSearchbar,
  IonModal,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonIcon,
} from "@ionic/react";
import { heart, checkmarkCircle, body, locationOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MainLayout from "../layouts/MainLayouts";

interface Mother {
  mother_id: string;
  first_name: string;
  last_name: string;
  age: number | null;
  address?: string;
}

interface HealthRecord {
  mother_id: string;
  weight: number | null;
  bp: string | null;
  temp: number | null;
  dm: boolean | null;
  hpn: boolean | null;
  created_at?: string;
}



interface RiskDetail {
  mother_id?: string;
  mother_name: string;
  risk_type: string;
  weight: number | null;
  bp: string | null;
  temp: number | null;
  dm: boolean | null;
  hpn: boolean | null;
  created_at?: string;
}

const RiskReportPage: React.FC = () => {
  const [riskMothers, setRiskMothers] = useState<RiskDetail[]>([]);
  const [totalMothers, setTotalMothers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("All");
  const [selectedMother, setSelectedMother] = useState<RiskDetail | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [zone, setZone] = useState<string>("");
  const prevRiskCount = useRef<number>(0);

  const parseBP = (bp: string | null) => {
    if (!bp) return null;
    const [sys, dia] = bp.split("/").map(Number);
    if (isNaN(sys) || isNaN(dia)) return null;
    return { systolic: sys, diastolic: dia };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1️⃣ Get current BHW user + zone
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("No user found");

      const { data: bhwData, error: bhwError } = await supabase
        .from("users")
        .select("zone, role")
        .eq("id", user.id)
        .single();

      if (bhwError) throw bhwError;
      const bhwZone = bhwData?.zone?.trim() || "";
      const role = bhwData?.role || "";
      setZone(bhwZone);

      // 2️⃣ Fetch mothers (filtered by BHW zone if not admin)
      let motherQuery = supabase
        .from("mothers")
        .select("mother_id, first_name, last_name, age, address");

      if (role !== "admin" && bhwZone) {
        motherQuery = motherQuery.ilike("address", `%${bhwZone}%`);
      }

      const { data: mothers, error: mothersError } = await motherQuery;
      if (mothersError) throw mothersError;

      // 3️⃣ Fetch health records
      const { data: records, error: recordsError } = await supabase
        .from("health_records")
        .select("mother_id, weight, bp, temp, dm, hpn, created_at");

      if (recordsError) throw recordsError;

      if (!mothers || !records) return;

      // 4️⃣ Compute risk per mother
      const risky: RiskDetail[] = [];

      for (const mom of mothers) {
        const record = records
          .filter((r: HealthRecord) => r.mother_id === mom.mother_id)
          .sort(
            (a: HealthRecord, b: HealthRecord) =>
              new Date(b.created_at || "").getTime() -
              new Date(a.created_at || "").getTime()
          )[0];

        if (!record) continue;

        const bpData = parseBP(record.bp ?? null);
        let riskType = "Stable";
        if (bpData && (bpData.systolic >= 140 || bpData.diastolic >= 90))
          riskType = "High Blood Pressure";
        else if ((record.temp ?? 0) > 38) riskType = "Fever";
        else if ((record.weight ?? 0) < 45) riskType = "Low Weight";
        else if (record.dm || record.hpn) riskType = "Chronic Condition";

        await supabase
          .from("risk_reports")
          .upsert({
            mother_id: mom.mother_id,
            status: riskType === "Stable" ? "Stable" : "At Risk",
            updated_at: new Date(),
          })
          .eq("mother_id", mom.mother_id);

        risky.push({
          mother_id: mom.mother_id,
          mother_name: `${mom.first_name} ${mom.last_name}`,
          risk_type: riskType,
          weight: record.weight,
          bp: record.bp,
          temp: record.temp,
          dm: record.dm,
          hpn: record.hpn,
          created_at: record.created_at,
        });
      }

      // 5️⃣ Notification if new risks appear
      if (prevRiskCount.current && risky.length > prevRiskCount.current) {
        const diff = risky.length - prevRiskCount.current;
        setNotification(`⚠ ${diff} new at-risk mother${diff > 1 ? "s" : ""}!`);
        setTimeout(() => setNotification(""), 6000);
      }

      prevRiskCount.current = risky.filter((r) => r.risk_type !== "Stable").length;
      setRiskMothers(risky);
      setTotalMothers(mothers.length);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

// 🔵 Pie chart data (Recharts-friendly)
const pieData: Array<Record<string, string | number>> = [
  {
    name: "At Risk",
    value: riskMothers.filter(r => r.risk_type !== "Stable").length,
  },
  {
    name: "Stable",
    value: riskMothers.filter(r => r.risk_type === "Stable").length,
  },
];

// 🎨 Pie chart colors
const pieColors: Record<string, string> = {
  "At Risk": "#ef4444",
  Stable: "#10b981",
};

  const filteredList = riskMothers.filter((m) => {
    const matchSearch = m.mother_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" ||
      (filter === "At Risk" && m.risk_type !== "Stable") ||
      (filter === "Stable" && m.risk_type === "Stable");
    return matchSearch && matchFilter;
  });

  const markAsStable = async () => {
    if (!selectedMother?.mother_id) return;
    try {
      await supabase
        .from("risk_reports")
        .update({ status: "Stable" })
        .eq("mother_id", selectedMother.mother_id);
      setModalOpen(false);
      fetchData();
      setNotification(`🟢 ${selectedMother.mother_name} marked as stable.`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <IonContent className="risk-content">
        <div className="risk-container">
          {notification && <div className="notif-banner">{notification}</div>}

          <header className="risk-header">
            <h1>Maternal Risk Monitoring</h1>
            <p>Real-time health tracking for Barangay Health Workers</p>
            {zone && (
              <p className="zone-info">
                <IonIcon icon={locationOutline} /> <strong>{zone}</strong>
              </p>
            )}
            {lastUpdated && (
              <small className="update-time">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </small>
            )}
          </header>

          {/* Summary */}
          <IonGrid className="summary-grid">
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonCard className="card red">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={heart} /> At Risk
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loading ? (
                      <IonSpinner />
                    ) : (
                      <h2>
                        {riskMothers.filter((r) => r.risk_type !== "Stable").length}
                      </h2>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="4">
                <IonCard className="card green">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={checkmarkCircle} /> Stable
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h2>
                      {riskMothers.filter((r) => r.risk_type === "Stable").length}
                    </h2>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="4">
                <IonCard className="card purple">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={body} /> Total
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h2>{totalMothers}</h2>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Chart + List */}
          <div className="chart-list-grid">
            <IonCard className="chart-card">
              <IonCardHeader>
                <IonCardTitle>Risk Overview</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                  <Pie
  data={pieData}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  innerRadius={55}
  outerRadius={85}
  label={({ name, percent }) =>
    `${name ?? "Unknown"} ${((percent ?? 0) * 100).toFixed(0)}%`
  }
>
  {pieData.map((entry, i) => (
    <Cell
      key={i}
      fill={pieColors[String(entry.name)]}
    />
  ))}
</Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </IonCardContent>
            </IonCard>

            <IonCard className="list-card">
              <IonCardHeader>
                <IonCardTitle>Mother Risk List</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="search-filter">
                  <IonSearchbar
                    value={search}
                    placeholder="Search mother name..."
                    onIonChange={(e) => setSearch(e.detail.value ?? "")}
                  />
                  <IonSelect
                    value={filter}
                    placeholder="Filter"
                    onIonChange={(e) => setFilter(e.detail.value)}
                  >
                    <IonSelectOption value="All">All</IonSelectOption>
                    <IonSelectOption value="At Risk">At Risk</IonSelectOption>
                    <IonSelectOption value="Stable">Stable</IonSelectOption>
                  </IonSelect>
                </div>

                {loading ? (
                  <IonSpinner />
                ) : filteredList.length === 0 ? (
                  <p className="stable-msg">All mothers are stable </p>
                ) : (
                  <ul className="risk-list">
                    {filteredList.map((m) => (
                      <li key={m.mother_id}>
                        <div>
                          <strong>{m.mother_name}</strong>
                          <small>
                            Risk:{" "}
                            <span
                              className={`risk-tag ${
                                m.risk_type === "Stable"
                                  ? "green"
                                  : m.risk_type === "Fever"
                                  ? "orange"
                                  : "red"
                              }`}
                            >
                              {m.risk_type}
                            </span>
                          </small>
                          <small>
                            Last Recorded:{" "}
                            {m.created_at
                              ? new Date(m.created_at).toLocaleString()
                              : "N/A"}
                          </small>
                        </div>
                        <IonButton
                          color="medium"
                          size="small"
                          onClick={() => {
                            setSelectedMother(m);
                            setModalOpen(true);
                          }}
                        >
                          View
                        </IonButton>
                      </li>
                    ))}
                  </ul>
                )}
              </IonCardContent>
            </IonCard>
          </div>
        </div>

        {/* Modal */}
        <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
          <div className="modal-container">
            <h2>{selectedMother?.mother_name}</h2>
            <p>
              Risk Type:{" "}
              <strong
                className={
                  selectedMother?.risk_type === "Stable" ? "green" : "red"
                }
              >
                {selectedMother?.risk_type}
              </strong>
            </p>

            <div className="modal-details">
              <div className="detail-item">
                <span>Blood Pressure:</span>
                <b>{selectedMother?.bp ?? "N/A"}</b>
              </div>
              <div className="detail-item">
                <span>Temperature:</span>
                <b>{selectedMother?.temp ?? "N/A"} °C</b>
              </div>
              <div className="detail-item">
                <span>Weight:</span>
                <b>{selectedMother?.weight ?? "N/A"} kg</b>
              </div>
              <div className="detail-item">
                <span>Diabetic:</span>
                <b>{selectedMother?.dm ? "Yes" : "No"}</b>
              </div>
              <div className="detail-item">
                <span>Hypertensive:</span>
                <b>{selectedMother?.hpn ? "Yes" : "No"}</b>
              </div>
              <div className="detail-item">
                <span>Last Recorded:</span>
                <b>
                  {selectedMother?.created_at
                    ? new Date(selectedMother.created_at).toLocaleString()
                    : "N/A"}
                </b>
              </div>
            </div>

            <IonButton
              expand="block"
              color="success"
              disabled={selectedMother?.risk_type === "Stable"}
              onClick={markAsStable}
            >
              {selectedMother?.risk_type === "Stable"
                ? "Stable"
                : " Mark as Stable"}
            </IonButton>

            <IonButton expand="block" onClick={() => setModalOpen(false)}>
              Close
            </IonButton>
          </div>
        </IonModal>

        <style>{`
          .risk-content { --background: #f9fafb; }
          .risk-container { padding: 20px; max-width: 1200px; margin: auto; }
          .risk-header { text-align: center; margin-bottom: 20px; }
          .update-time { color: #6b7280; display: block; margin-top: 5px; }
          .notif-banner { background: #fef3c7; color: #92400e; padding: 10px; text-align: center; border-radius: 10px; margin-bottom: 16px; }
          .summary-grid ion-card { text-align: center; border-radius: 14px; }
          .summary-grid h2 { font-size: 2.2rem; font-weight: bold; }
          .card.red { background: #fee2e2; border-top: 5px solid #ef4444; }
          .card.green { background: #dcfce7; border-top: 5px solid #10b981; }
          .card.purple { background: #ede9fe; border-top: 5px solid #7c3aed; }
          .chart-list-grid { display: grid; gap: 20px; grid-template-columns: 1fr; }
          @media (min-width: 900px) { .chart-list-grid { grid-template-columns: 1fr 1fr; } }
          .search-filter { display: flex; gap: 10px; align-items: center; }
          ion-select { max-width: 130px; }
          .risk-list li { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
          .risk-list small { display: block; color: #6b7280; font-size: 0.85rem; }
          .risk-tag { padding: 3px 8px; border-radius: 8px; font-weight: 600; font-size: 0.8rem; }
          .risk-tag.red { background: #fee2e2; color: #b91c1c; }
          .risk-tag.orange { background: #ffedd5; color: #c2410c; }
          .risk-tag.green { background: #dcfce7; color: #166534; }
          .modal-container { padding: 20px; text-align: center; }
          .modal-details { margin: 15px 0; background: #f3f4f6; border-radius: 10px; padding: 10px; }
          .detail-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-item span { color: #6b7280; }
          .detail-item b { color: #111827; }
        `}</style>
      </IonContent>
    </MainLayout>
  );
};

export default RiskReportPage;
