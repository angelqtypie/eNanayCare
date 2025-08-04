import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonContent, IonItem, IonLabel, IonList
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface Monitoring {
  id: string;
  temperature: number;
  blood_pressure: string;
  notes: string;
  created_at: string;
}

const ViewMonitoring = ({ userId }: { userId: string }) => {
  const [entries, setEntries] = useState<Monitoring[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('health_monitoring')
      .select('*')
      .eq('mother_id', userId)
      .order('created_at', { ascending: false });
    if (data) setEntries(data);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Your Health Logs</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {entries.length ? (
          <IonList>
            {entries.map(entry => (
              <IonItem key={entry.id}>
                <IonLabel>
                  <h2>{new Date(entry.created_at).toLocaleDateString()}</h2>
                  <p>🌡 Temp: {entry.temperature}°C</p>
                  <p>🩺 BP: {entry.blood_pressure}</p>
                  <p>📝 {entry.notes}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        ) : (
          <p>No logs found.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ViewMonitoring;
