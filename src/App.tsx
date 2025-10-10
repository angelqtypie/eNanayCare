// src/App.tsx
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
import Reminders from "./pages/Reminders";
import AdminFAQ from "./pages/AdminFAQ";
import AdminUserPage from "./pages/AdminUserPage";
import MothersCalendar from './pages/MothersCalendar';
import MothersProfile from './pages/MothersProfile';





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
        <Route exact path="/adminfaq" component={AdminFAQ} />
        <Route exact path="/mothers" component={Mothers} />
        <Route exact path="/AdminUserPage" component={AdminUserPage} />
        <Route exact path="/reminders" component={Reminders} />
        <Route exact path="/mothersProfile" component={MothersProfile} />
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
