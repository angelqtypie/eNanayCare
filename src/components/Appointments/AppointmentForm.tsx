// src/components/appointments/AppointmentForm.tsx
import {
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
  } from "@ionic/react";
import React from "react";
  
  interface FormProps {
    mothers: { id: number; name: string }[];
    form: {
      motherName: string;
      date: string;
      time: string;
      notes: string;
    };
    handleChange: (name: string, value: string) => void;
  }
  
  export default function AppointmentForm({ mothers, form, handleChange }: FormProps) {
    return (
      <IonList className="form-list">
        <IonItem>
          <IonLabel position="stacked">Select Mother</IonLabel>
          <IonSelect
            name="motherName"
            value={form.motherName}
            onIonChange={(e) => handleChange("motherName", e.detail.value!)}
          >
            {mothers.map((m) => (
              <IonSelectOption key={m.id} value={m.name}>
                {m.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
  
        <IonItem>
          <IonLabel position="stacked">Date</IonLabel>
          <IonInput
            type="date"
            value={form.date}
            onIonChange={(e) => handleChange("date", e.detail.value!)}
          />
        </IonItem>
  
        <IonItem>
          <IonLabel position="stacked">Time</IonLabel>
          <IonInput
            type="time"
            value={form.time}
            onIonChange={(e) => handleChange("time", e.detail.value!)}
          />
        </IonItem>
  
        <IonItem>
          <IonLabel position="stacked">Notes</IonLabel>
          <IonInput
            value={form.notes}
            onIonChange={(e) => handleChange("notes", e.detail.value!)}
          />
        </IonItem>
      </IonList>
    );
  }
  