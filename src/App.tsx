import emailjs from "@emailjs/browser";

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY!);

import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import React from "react";

/* Pages */
import Login from "./pages/Login";
import DashboardBHW from "./pages/DashboardBHW";
import DashboardMother from "./pages/DashboardMother";
import DashboardAdmin from "./pages/DashboardAdmin";
import Appointments from "./pages/Appointments";
import LandingPage from "./pages/LandingPage";
import Mothers from "./pages/Mothers";
import EducationalMaterials from "./pages/EducationalMaterials";
import AdminUserPage from "./pages/AdminUserPage";
import MothersCalendar from './pages/MothersCalendar';
import MothersProfile from './pages/MothersProfile';
import HealthRecords from './pages/HealthRecords';
import AdminMaterials from './pages/AdminMaterials';
import motherappoinments from './pages/motherappoinments';
import motherhealthrecords from './pages/motherhealthrecords';
import mothernotifications from './pages/mothernotifications';
import BhwProfile from "./pages/bhwprofile";
import VisitRecords from "./pages/VisitRecords";
import PrenatalRecords from "./pages/PrenatalRecords";
import AdminChatbotQA from "./pages/AdminChatbotQA";
import AdminRisks from "./pages/AdminRisks";
import RiskMonitoring from "./pages/RiskMonitoring";
import BhwWellnessPage from "./pages/BhwWellnessPage";
import RiskReportPage from "./pages/RiskReportPage";


/* Ionic Core CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme */
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";





setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    {/* ✅ Basename ensures correct routing on GitHub Pages */}
    <IonReactRouter basename="/eNanayCare">
      <IonRouterOutlet>
        <Route exact path="/login" component={Login} />
        <Route exact path="/dashboardbhw" component={DashboardBHW} />
        <Route exact path="/dashboardmother" component={DashboardMother} />
        <Route exact path="/dashboardadmin" component={DashboardAdmin} />
        <Route exact path="/appointments" component={Appointments} />
        <Route exact path="/mothers" component={Mothers} />
        <Route exact path="/riskreportpage" component={RiskReportPage} />
        <Route exact path="/AdminUserPage" component={AdminUserPage} />
        <Route exact path="/motherhealthrecords" component={motherhealthrecords} />
        <Route exact path="/mothernotifications" component={mothernotifications} />
        <Route exact path="/educationalmaterials" component={EducationalMaterials} />
        <Route exact path="/motherappoinments" component={motherappoinments} />
        <Route exact path="/healthrecords" component={HealthRecords} />   
        <Route exact path="/riskmonitoring" component={RiskMonitoring} />   
        <Route exact path="/visitrecords" component={VisitRecords} />  
        <Route exact path="/bhwprofile" component={BhwProfile} />
        <Route exact path="/bhwwellnesspage" component={BhwWellnessPage} />
        <Route exact path="/adminchatbotqa" component={AdminChatbotQA} />   
        <Route exact path="/prenatal-records" component={PrenatalRecords} />  
        <Route exact path="/mothersProfile" component={MothersProfile} />
        <Route exact path="/adminrisks" component={AdminRisks} />
        <Route exact path="/adminmaterials" component={AdminMaterials} />
        <Route exact path="/mothersCalendar" component={MothersCalendar} />      
        <Route exact path="/landingpage" component={LandingPage} />
        <Route exact path="/">
          <Redirect to="/landingpage" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
