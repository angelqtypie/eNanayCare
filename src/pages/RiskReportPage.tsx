import React, { useEffect, useState } from "react";
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
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
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

// ===== Types =====
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
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface CustomPieLabelProps {
  name?: string;
  value?: number;
  percent?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  innerRadius?: number;
}

// ===== Constants =====
const COLORS = ["#ef4444", "#10b981"]; // Red, Green

const RiskReportPage: React.FC = () => {
  const [riskMothers, setRiskMothers] = useState<Mother[]>([]);
  const [totalMothers, setTotalMothers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  // ===== Helper: Parse BP =====
  const parseBP = (bp: string | null) => {
    if (!bp) return null;
    const [sysStr, diaStr] = bp.split("/");
    const systolic = Number(sysStr);
    const diastolic = Number(diaStr);
    if (isNaN(systolic) || isNaN(diastolic)) return null;
    return { systolic, diastolic };
  };

  // ===== Fetch Mothers & Records =====
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: mothers } = await supabase
        .from("mothers")
        .select("mother_id, first_name, last_name, age, address")
        .returns<Mother[]>();
  
      const { data: records } = await supabase
        .from("health_records")
        .select("mother_id, weight, bp, temp, dm, hpn")
        .returns<HealthRecord[]>();
  
      if (!mothers || !records) return;
  
      const risky = mothers.filter((mom: Mother) => {
        const record = records.find(
          (r: HealthRecord) => r.mother_id === mom.mother_id
        );
        if (!record) return false;
  
        const bp = parseBP(record.bp);
        const highBP = bp ? bp.systolic >= 140 || bp.diastolic >= 90 : false;
        const fever = record.temp !== null && record.temp > 38;
        const lowWeight = record.weight !== null && record.weight < 45;
        const chronic = record.dm || record.hpn;
  
        // If any of the conditions are true, the mother is considered at risk
        if (highBP || fever || lowWeight || chronic) {
          // Automatically insert a new risk report for this mother
          const riskType = highBP
            ? "High Blood Pressure"
            : fever
            ? "Fever"
            : lowWeight
            ? "Low Weight"
            : "Chronic Condition";  // If none of the above, it's considered chronic
  
          // Insert the risk report into the database
          supabase
            .from("risk_reports")
            .insert([
              {
                mother_id: mom.mother_id,
                mother_name: `${mom.first_name} ${mom.last_name}`,
                risk_type: riskType,
                description: `Risk detected due to ${riskType}`,
                status: "Pending",
              },
            ])
            .catch((err: Error) => console.error("Error inserting risk report:", err)); // Error type specified
  
          return true; // Mark the mother as at risk
        }
  
        return false;
      });
  
      setTotalMothers(mothers.length);
      setRiskMothers(risky);
    } catch (error) {
      console.error("Error fetching data:", error); // Error handling for the entire fetch process
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const chartData: ChartDataItem[] = [
    { name: "At Risk", value: riskMothers.length, color: "#ef4444" },
    {
      name: "Stable",
      value: Math.max(0, totalMothers - riskMothers.length),
      color: "#10b981",
    },
  ];

  // ===== Filters =====
  const filteredMothers = riskMothers.filter((mom: Mother) => {
    const matchSearch =
      mom.first_name.toLowerCase().includes(search.toLowerCase()) ||
      mom.last_name.toLowerCase().includes(search.toLowerCase());
    const matchZone =
      filter === "All" ||
      (mom.address &&
        mom.address.toLowerCase().includes(filter.toLowerCase()));
    return matchSearch && matchZone;
  });

  // ===== Custom Label (Donut with Percentages) =====
  const renderCustomLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
    name = "",
  }: CustomPieLabelProps) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // ===== JSX =====
  return (
    <MainLayout>
      <IonContent className="risk-content">
        <div className="risk-container">
          <header className="risk-header">
            <h1>Mother Risk Monitoring</h1>
            <p>Tracks and visualizes mothers’ health risk levels in real time.</p>
          </header>

          {/* Summary Cards */}
          <IonGrid className="summary-grid">
            <IonRow>
              <IonCol sizeXs="12" sizeMd="4">
                <IonCard className="card red">
                  <IonCardHeader>
                    <IonCardTitle>At-Risk Mothers</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loading ? <IonSpinner /> : <h2>{riskMothers.length}</h2>}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol sizeXs="12" sizeMd="4">
                <IonCard className="card green">
                  <IonCardHeader>
                    <IonCardTitle>Stable Mothers</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loading ? (
                      <IonSpinner />
                    ) : (
                      <h2>{totalMothers - riskMothers.length}</h2>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol sizeXs="12" sizeMd="4">
                <IonCard className="card purple">
                  <IonCardHeader>
                    <IonCardTitle>Total Mothers</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loading ? <IonSpinner /> : <h2>{totalMothers}</h2>}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Chart + List */}
          <div className="chart-list-grid">
            <IonCard className="chart-card">
              <IonCardHeader>
                <IonCardTitle>Risk Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {loading ? (
                  <div className="center">
                    <IonSpinner />
                  </div>
                ) : (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          labelLine={false}
                          label={renderCustomLabel}
                          isAnimationActive={true}
                          animationDuration={900}
                        >
                          {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </IonCardContent>
            </IonCard>

            <IonCard className="list-card">
              <IonCardHeader>
                <IonCardTitle>At-Risk Mothers List</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {loading ? (
                  <div className="center">
                    <IonSpinner />
                  </div>
                ) : filteredMothers.length === 0 ? (
                  <p className="stable-msg">All mothers are stable!</p>
                ) : (
                  <ul className="risk-list">
                    {filteredMothers.map((m: Mother) => (
                      <li key={m.mother_id}>
                        <div>
                          <strong>
                            {m.first_name} {m.last_name}
                          </strong>
                          <small>{m.address || "No address"}</small>
                        </div>
                        <span className="badge risk">At Risk</span>
                      </li>
                    ))}
                  </ul>
                )}
              </IonCardContent>
            </IonCard>
          </div>
        </div>

        {/* ===== Styling ===== */}
        <style>{`
          .risk-content { --background: #f9fafb; }
          .risk-container { padding: 20px; max-width: 1300px; margin: auto; font-family: 'Inter', sans-serif; }
          .risk-header { text-align: center; margin-bottom: 20px; }
          .filters { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap; }
          ion-searchbar { flex: 1; --border-radius: 10px; }
          ion-select { min-width: 130px; border-radius: 10px; background: #fff; }

          .summary-grid ion-card { border-radius: 14px; text-align: center; }
          .summary-grid h2 { font-size: 2.3rem; font-weight: 700; }
          .card.red { background: #fee2e2; border-top: 6px solid #ef4444; }
          .card.green { background: #dcfce7; border-top: 6px solid #10b981; }
          .card.purple { background: #ede9fe; border-top: 6px solid #7c3aed; }

          .chart-list-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
          @media (min-width: 900px) { .chart-list-grid { grid-template-columns: 1fr 1fr; } }

          .chart-card, .list-card { border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: 0.3s; }
          .chart-card:hover, .list-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }

          .chart-wrapper { position: relative; height: 320px; }
          .risk-list { list-style: none; margin: 0; padding: 0; }
          .risk-list li { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
          .badge { background: #ef4444; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; }
          .stable-msg { text-align: center; background: #dcfce7; padding: 12px; border-radius: 8px; color: #065f46; font-weight: 500; }
          .center { display: flex; justify-content: center; align-items: center; height: 100%; }
        `}</style>
      </IonContent>
    </MainLayout>
  );
};

export default RiskReportPage;
