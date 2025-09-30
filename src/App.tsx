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
        <Route exact path="/eNanayCare/login" component={Login} />
        <Route exact path="/eNanayCare/dashboardbhw" component={DashboardBHW} />
        <Route exact path="/eNanayCare/dashboardmother" component={DashboardMother} />
        <Route exact path="/eNanayCare/appointments" component={Appointments} />
        <Route exact path="/eNanayCare/adminfaq" component={AdminFAQ} />
        <Route exact path="/eNanayCare/adminlogin" component={AdminLogin} />
        <Route exact path="/eNanayCare/mothers" component={Mothers} />
        <Route exact path="/eNanayCare/reminders" component={Reminders} />
        <Route exact path="/eNanayCare/landingpage" component={LandingPage} />
        <Route exact path="/eNanayCare/">
          <Redirect to="/eNanayCare/landingpage" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
