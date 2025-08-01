
import { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { supabase } from '../utils/supabaseClient';

const DashboardBHW = () => {
  const [mothers, setMothers] = useState<any[]>([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/Capstone/';
  };

  useEffect(() => {
    const fetchMothers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'mother');

      if (error) console.error('Fetch error:', error);
      else setMothers(data);
    };

    fetchMothers();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>BHW Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Welcome, Barangay Health Worker!</p>
        <IonButton onClick={handleLogout}>Logout</IonButton>

        <h2 style={{ marginTop: '1rem' }}>Registered Mothers</h2>
        <IonList>
          {mothers.map((mother) => (
            <IonItem key={mother.id}>
              <IonLabel>{mother.full_name}</IonLabel>
            </IonItem>
          ))}
          <IonButton routerLink="/Capstone/managecalendar" expand="block">
  🛠 Manage Calendar
</IonButton>

        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default DashboardBHW;
