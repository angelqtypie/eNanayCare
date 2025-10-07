import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { logOutOutline, peopleCircleOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

// Types
interface UserCounts {
  total: number;
  bhw: number;
  mothers: number;
  admins: number;
}

const DashboardAdmin: React.FC = () => {
  const history = useHistory();
  const [counts, setCounts] = useState<UserCounts>({
    total: 0,
    bhw: 0,
    mothers: 0,
    admins: 0,
  });
  const [materials, setMaterials] = useState<number>(0);
  const [reports, setReports] = useState<number>(0);

  const handleLogout = () => {
    history.push("/eNanayCare/landingpage");
  };

  const fetchCounts = async () => {
    const { data: users } = await supabase.from("users").select("role");

    if (users) {
      const total = users.length;
      const bhw = users.filter((u: any) => u.role === "bhw").length;
      const mothers = users.filter((u: any) => u.role === "mother").length;
      const admins = users.filter((u: any) => u.role === "admin").length;
      setCounts({ total, bhw, mothers, admins });
    }

    const { count: matCount } = await supabase
      .from("materials")
      .select("*", { count: "exact", head: true });
    setMaterials(matCount || 0);

    const { count: repCount } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true });
    setReports(repCount || 0);
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Admin Dashboard</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} slot="start" />
            Logout
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding bg-gray-100">
        <h2 className="text-2xl font-bold mb-1">Welcome, Admin</h2>
        <p className="text-gray-600 mb-6">
          Overview of system status and quick actions.
        </p>

        {/* Stats Row */}
        <IonGrid>
          <IonRow>
            <IonCol size="4">
              <IonCard className="shadow-lg rounded-xl">
                <IonCardHeader>
                  <IonCardTitle>Users</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="text-2xl font-bold">{counts.total}</p>
                  <p className="text-gray-500 text-sm">
                    {counts.bhw} BHWs / {counts.mothers} Mothers / {counts.admins} Admins
                  </p>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="4">
              <IonCard className="shadow-lg rounded-xl">
                <IonCardHeader>
                  <IonCardTitle>Materials</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="text-2xl font-bold">{materials}</p>
                  <p className="text-gray-500 text-sm">Uploaded</p>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="4">
              <IonCard className="shadow-lg rounded-xl">
                <IonCardHeader>
                  <IonCardTitle>Reports</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="text-2xl font-bold">{reports}</p>
                  <p className="text-gray-500 text-sm">Generated</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Actions */}
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonCard className="hover:shadow-xl transition rounded-xl">
                <IonCardHeader>
                  <IonCardTitle>Manage Users</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Add, edit, or remove users.
                  <IonButton
                    expand="block"
                    color="primary"
                    className="mt-3"
                    onClick={() => history.push("/eNanayCare/adminuserpage")}
                  >
                    <IonIcon icon={peopleCircleOutline} slot="start" />
                    Go to Users
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6">
              <IonCard className="hover:shadow-xl transition rounded-xl">
                <IonCardHeader>
                  <IonCardTitle>Upload Materials</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Share health education with mothers.
                  <IonButton expand="block" color="success" className="mt-3">
                    GO
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonCard className="hover:shadow-xl transition rounded-xl">
                <IonCardHeader>
                  <IonCardTitle>Reports</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Generate and download reports.
                  <IonButton expand="block" color="tertiary" className="mt-3">
                    GO
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default DashboardAdmin;
