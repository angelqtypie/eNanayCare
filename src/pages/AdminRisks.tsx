import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/AdminLayout";
import { supabase } from "../utils/supabaseClient";
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSpinner } from "@ionic/react";
import AdminMainLayout from "../layouts/AdminLayout";

const AdminRiskReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("risk_reports")
        .select(`id, mother_name, risk_level, report_details, date_reported`)
        .order("date_reported", { ascending: false });

      if (error) {
        console.error("Error fetching reports:", error);
        setReports([]);
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  return (
    <AdminMainLayout>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Risk Reports</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {loading ? (
            <IonSpinner name="dots" />
          ) : reports.length === 0 ? (
            <p>No risk reports found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Mother</th>
                  <th>Risk Level</th>
                  <th>Details</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.mother_name}</td>
                    <td>{r.risk_level}</td>
                    <td>{r.report_details}</td>
                    <td>{new Date(r.date_reported).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </IonCardContent>
      </IonCard>
    </AdminMainLayout>
  );
};

export default AdminRiskReports;
