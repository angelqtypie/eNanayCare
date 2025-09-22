import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenu,
  IonList,
  IonItem,
  IonLabel,
  IonMenuToggle,
  IonMenuButton,
} from "@ionic/react";
import { menuOutline, logOutOutline, callOutline } from "ionicons/icons";
import "../pages/MamaDashboard.css";
import { useHistory } from "react-router-dom";

interface MotherMainLayoutProps {
  title: string;
  children: React.ReactNode;
}



const MotherMainLayout: React.FC<MotherMainLayoutProps> = ({ title, children }) => {
    const history = useHistory();
  return (
    <>
      {/* Side Menu */}
      <IonMenu side="end" menuId="mainMenu" contentId="mainContent" type="push">
        <IonContent>
          <IonList>
            <IonMenuToggle autoHide={false}>
              <IonItem routerLink="/faq-chatbot">
                <IonLabel>FAQs / Chatbot</IonLabel>
              </IonItem>
            </IonMenuToggle>

            <IonMenuToggle autoHide={false}>
              <IonItem routerLink="/doh-info">
                <IonLabel>DOH Health Info</IonLabel>
              </IonItem>
            </IonMenuToggle>

            <IonMenuToggle autoHide={false}>
              <IonItem routerLink="/profile">
                <IonLabel>Profile</IonLabel>
              </IonItem>
            </IonMenuToggle>

            <IonMenuToggle autoHide={false}>
              <IonItem routerLink="/emergency" className="emergency-link">
                <IonIcon slot="start" icon={callOutline} color="danger" />
                <IonLabel>Emergency</IonLabel>
              </IonItem>
            </IonMenuToggle>

            <IonMenuToggle autoHide={false}>
      <IonItem
        button
        detail={false}
        onClick={() => history.push("/Capstone/landingpage")}
      >
        <IonIcon slot="start" icon={logOutOutline} />
        <IonLabel>Logout</IonLabel>
      </IonItem>
    </IonMenuToggle>          </IonList>
        </IonContent>
      </IonMenu>

      {/* Main Page */}
      <IonPage id="mainContent">
        <IonHeader>
          <IonToolbar className="toolbar-health-ui">
            <IonTitle>{title}</IonTitle>

            {/* Right side nav */}
            <IonButtons slot="end">
              {/* Desktop Nav */}
              <div className="desktop-nav">
                <IonButton fill="clear" routerLink="/faq-chatbot">FAQs</IonButton>
                <IonButton fill="clear" routerLink="/doh-info">DOH Info</IonButton>
                <IonButton fill="clear" routerLink="/profile">Profile</IonButton>
                <IonButton fill="clear" color="danger" routerLink="/emergency">
                  Emergency
                </IonButton>
           <IonButton
                className="logout-btn"
                color="medium"
                fill="clear"
                onClick={() => history.push("/Capstone/landingpage")}
              >
                <IonIcon icon={logOutOutline} slot="end" />
                Logout
              </IonButton>
              </div>

              {/* Mobile Menu Button */}
              <IonButtons slot="end" className="mobile-nav">
  <IonMenuButton autoHide={false} />
</IonButtons>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="content-health-ui">{children}</IonContent>
      </IonPage>
    </>
  );
};

export default MotherMainLayout;
