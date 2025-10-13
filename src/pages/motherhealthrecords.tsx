import React, { useEffect, useState } from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import "../layouts/MotherMainLayout";
import MotherMainLayout from "../layouts/MotherMainLayout";

const HealthRecord: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user ?? null;
    if (!user) return;

    const { data: mother } = await supabase.from("mothers").select("id").eq("auth_user_id", user.id).maybeSingle();
    if (!mother?.id) return;

    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("mother_id", mother.id)
      .order("encounter_date", { ascending: false });

    if (error) console.error(error);
    else setRecords(data || []);
  };

  return (
    <MotherMainLayout>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Health Record</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen scrollY={true}>
        {records.length === 0 && <div className="center small-muted">No records available</div>}
        {records.map((r) => (
          <IonCard key={r.id}>
            <IonCardHeader>
              <IonCardTitle>{r.encounter_date}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div>Weight: {r.weight ?? "-" } kg</div>
              <div>BP: {r.blood_pressure ?? "-"}</div>
              <div>Hemoglobin: {r.hemoglobin_level ?? "-"}</div>
              <div>Weeks: {r.weeks_of_gestation ?? "-"}</div>
              {r.notes && <div className="small-muted">Notes: {r.notes}</div>}
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </MotherMainLayout>
  );
};

export default HealthRecord;
