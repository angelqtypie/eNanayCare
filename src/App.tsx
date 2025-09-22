import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React from 'react';

/* Pages */
import Login from './pages/Login';
import DashboardBHW from './pages/DashboardBHW';
import DashboardMother from './pages/DashboardMother';
import Appointments from './pages/Appointments';
import LandingPage from './pages/LandingPage';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme */
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';
import Mothers from './pages/Mothers';
import Reminders from './pages/Reminders';
import AdminFAQ from './pages/AdminFAQ';
import AdminLogin from './pages/AdminLogin';



setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/Capstone/login" component={Login} />
        <Route exact path="/Capstone/dashboardbhw" component={DashboardBHW} />
        <Route exact path="/Capstone/dashboardmother" component={DashboardMother} />
        <Route exact path="/Capstone/appointments" component={Appointments} />
        <Route exact path="/Capstone/adminfaq" component={AdminFAQ} />
        <Route exact path="/Capstone/adminlogin" component={AdminLogin} />
        <Route exact path="/Capstone/mothers" component={Mothers} />
        <Route exact path="/Capstone/reminders" component={Reminders} />
        <Route exact path="/Capstone/landingpage" component={LandingPage} />
        <Route exact path="/Capstone/">
          <Redirect to="/Capstone/landingpage" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
