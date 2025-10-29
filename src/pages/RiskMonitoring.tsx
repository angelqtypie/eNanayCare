import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import AdminMainLayout from "../layouts/AdminLayout"; 

interface RiskReport {
  id: string;
  risk_level: string;
  status: string;
  report_details: string;
  date_reported: string;
  mother: {
    first_name: string;
    last_name: string;
    contact_number: string;
  };
  health_record: {
    bp: string;
    weight: number;
    temp: number;
    notes: string;
  };
}

const RiskMonitoring: React.FC = () => {
  const [riskReports, setRiskReports] = useState<RiskReport[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRiskReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("risk_reports")
      .select(`
        id,
        risk_level,
        status,
        report_details,
        date_reported,
        mothers (
          first_name,
          last_name,
          contact_number
        ),
        health_records (
          bp,
          weight,
          temp,
          notes
        )
      `)
      .order("date_reported", { ascending: false });

    if (error) {
      console.error("Error fetching risk reports:", error);
    } else {
      const reports = data.map((r: any) => ({
        id: r.id,
        risk_level: r.risk_level,
        status: r.status,
        report_details: r.report_details,
        date_reported: r.date_reported,
        mother: r.mothers,
        health_record: r.health_records,
      }));
      setRiskReports(reports);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRiskReports();
  }, []);

  const filteredReports = filterLevel
    ? riskReports.filter((r) => r.risk_level === filterLevel)
    : riskReports;

  return (
    <AdminMainLayout>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Risk Monitoring</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ marginBottom: "15px" }}>
          <IonSelect
            value={filterLevel}
            placeholder="Filter by Risk Level"
            onIonChange={(e) => setFilterLevel(e.detail.value)}
          >
            <IonSelectOption value="">All</IonSelectOption>
            <IonSelectOption value="Low">Low</IonSelectOption>
            <IonSelectOption value="Medium">Medium</IonSelectOption>
            <IonSelectOption value="High">High</IonSelectOption>
          </IonSelect>
        </div>

        {loading ? (
          <IonSpinner name="dots" />
        ) : (
          filteredReports.map((report) => (
            <IonCard key={report.id}>
              <IonCardHeader>
                <IonCardTitle>
                  {report.mother.first_name} {report.mother.last_name} -{" "}
                  <strong>{report.risk_level} Risk</strong>
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p><strong>Date Reported:</strong> {new Date(report.date_reported).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {report.status}</p>
                <p><strong>Contact:</strong> {report.mother.contact_number}</p>
                <p><strong>BP:</strong> {report.health_record?.bp || "N/A"}</p>
                <p><strong>Weight:</strong> {report.health_record?.weight || "N/A"} kg</p>
                <p><strong>Temp:</strong> {report.health_record?.temp || "N/A"} °C</p>
                <p><strong>Notes:</strong> {report.health_record?.notes || "N/A"}</p>
                <p><strong>Report:</strong> {report.report_details}</p>

                {/* Optional: Mark as Reviewed */}
                {report.status === "Pending" && (
                  <IonButton
                    color="success"
                    size="small"
                    onClick={async () => {
                      const { error } = await supabase
                        .from("risk_reports")
                        .update({ status: "Reviewed" })
                        .eq("id", report.id);

                      if (!error) {
                        fetchRiskReports();
                      }
                    }}
                  >
                    Mark as Reviewed
                  </IonButton>
                )}
              </IonCardContent>
            </IonCard>
          ))
        )}
      </IonContent>
    </AdminMainLayout>
  );
};

export default RiskMonitoring;
