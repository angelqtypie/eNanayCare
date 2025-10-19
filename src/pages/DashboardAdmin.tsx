import React, { useEffect, useState } from "react";
import { IonIcon } from "@ionic/react";
import {
  peopleCircleOutline,
  bookOutline,
  documentTextOutline,
  analyticsOutline,
} from "ionicons/icons";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import AdminMainLayout from "../layouts/AdminLayout";
import "./DashboardAdmin.css";

const DashboardAdmin: React.FC = () => {
  const history = useHistory();
  const [counts, setCounts] = useState({
    total: 0,
    bhw: 0,
    mothers: 0,
    admins: 0,
    materials: 0,
    reports: 0,
  });

  const [recentReports, setRecentReports] = useState<any[]>([]);

  const fetchCounts = async () => {
    try {
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("role");

      const { count: materials, error: materialError } = await supabase
        .from("educational_materials") // ✅ Fixed table name
        .select("*", { count: "exact", head: true });

      const { count: reports, error: reportError } = await supabase
        .from("reports") // ✅ Make sure this table exists
        .select("*", { count: "exact", head: true });

      if (userError || materialError || reportError) {
        console.error("Fetch errors:", {
          userError,
          materialError,
          reportError,
        });
        return;
      }

      if (users) {
        const total = users.length;
        const bhw = users.filter((u: any) => u.role === "bhw").length;
        const mothers = users.filter((u: any) => u.role === "mother").length;
        const admins = users.filter((u: any) => u.role === "admin").length;

        setCounts({
          total,
          bhw,
          mothers,
          admins,
          materials: materials || 0,
          reports: reports || 0,
        });
      }
    } catch (err) {
      console.error("Unexpected error fetching counts:", err);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports") // ✅ Make sure this table exists
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching recent reports:", error);
        return;
      }

      if (data) setRecentReports(data);
    } catch (err) {
      console.error("Unexpected error fetching recent reports:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchRecentReports();
  }, []);

  const cards = [
    {
      title: "Users",
      subtitle: `${counts.bhw} BHWs • ${counts.mothers} Mothers • ${counts.admins} Admins`,
      value: counts.total,
      icon: peopleCircleOutline,
      gradient: "linear-gradient(135deg, #ffb6c1, #ff66a3)",
      link: "/adminuserpage",
    },
    {
      title: "Materials",
      subtitle: "Educational Uploads",
      value: counts.materials,
      icon: bookOutline,
      gradient: "linear-gradient(135deg, #9ae6b4, #38a169)",
      link: "/adminmaterials",
    },
    {
      title: "Reports",
      subtitle: "Generated Reports",
      value: counts.reports,
      icon: documentTextOutline,
      gradient: "linear-gradient(135deg, #b794f4, #553c9a)",
      link: "/adminrisks",
    },
  ];

  return (
    <AdminMainLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, Admin</h1>
          </div>
          <div className="date-box">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        <motion.div
          className="dashboard-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="dashboard-card"
              style={{ background: card.gradient }}
              whileHover={{ scale: 1.03 }}
              onClick={() => history.push(card.link)}
            >
              <div className="card-top">
                <IonIcon icon={card.icon} className="icon" />
                <h2>{card.title}</h2>
              </div>
              <p>{card.subtitle}</p>
              <span className="count">{card.value}</span>
            </motion.div>
          ))}
        </motion.div>

        <div className="recent-section">
          <h2>
            <IonIcon icon={analyticsOutline} /> Recent Reports
          </h2>

          {recentReports.length > 0 ? (
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Date Created</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, idx) => (
                  <tr key={idx}>
                    <td>{report.title || "Untitled Report"}</td>
                    <td>
                      {new Date(report.created_at).toLocaleDateString("en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No reports found.</p>
          )}
        </div>
      </div>
    </AdminMainLayout>
  );
};

export default DashboardAdmin;
