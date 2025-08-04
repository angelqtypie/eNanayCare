import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonContent, IonInput, IonButton, IonItem, IonLabel,
  IonSelect, IonSelectOption, IonTextarea
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const AddMonitoring = () => {
  const [mothers, setMothers] = useState<any[]>([]);
  const [motherId, setMotherId] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserAndMothers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'mother');
      if (!error && data) setMothers(data);
    };

    fetchUserAndMothers();
  }, []);

  const handleSubmit = async () => {
    const { error } = await supabase.from('health_monitoring').insert({
      mother_id: motherId,
      bhw_id: userId,
      temperature: parseFloat(temperature),
      blood_pressure: bloodPressure,
      notes,
    });
    if (!error) {
      setSuccess('Saved!');
      setMotherId('');
      setTemperature('');
      setBloodPressure('');
      setNotes('');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Monitoring</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel>Mother</IonLabel>
          <IonSelect value={motherId} onIonChange={(e) => setMotherId(e.detail.value)}>
            {mothers.map(m => (
              <IonSelectOption key={m.id} value={m.id}>
                {m.full_name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        <IonInput
          label="Temperature"
          type="number"
          value={temperature}
          onIonChange={(e) => setTemperature(e.detail.value ?? '')}
        />
        <IonInput
          label="Blood Pressure"
          value={bloodPressure}
          onIonChange={(e) => setBloodPressure(e.detail.value ?? '')}
        />
        <IonTextarea
          label="Notes"
          value={notes}
          onIonChange={(e) => setNotes(e.detail.value ?? '')}
        />
        <IonButton expand="block" onClick={handleSubmit}>Submit</IonButton>
        {success && <p>{success}</p>}
      </IonContent>
    </IonPage>
  );
};

export default AddMonitoring;
