import { useEffect, useState } from 'react';
import {
  IonApp,
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane
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

  const sidebarItems = [
    'Dashboard',
    'Pregnant Women',
    'Schedule',
    "Do's & Don'ts",
    'Health Records',
    'Announcement',
    'Statistics'
  ];

  return (
    <IonApp>
      <IonSplitPane contentId="main-content">
        <IonMenu contentId="main-content">
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>BHW Panel</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {sidebarItems.map((item, index) => (
                <IonMenuToggle key={index} autoHide={false}>
                  <IonItem button routerLink={`/${item.toLowerCase().replace(/\s+/g, '-')}`}>
                    <IonLabel>{item}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              ))}
            </IonList>
          </IonContent>
        </IonMenu>

        <IonPage id="main-content">
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
            </IonList>

            <IonButton routerLink="/Capstone/managecalendar" expand="block">
              🛠 Manage Calendar
            </IonButton>
            <IonButton routerLink="/Capstone/addmonitoring">Add Monitoring</IonButton>
          </IonContent>
        </IonPage>
      </IonSplitPane>
    </IonApp>
  );
};

export default DashboardBHW;
