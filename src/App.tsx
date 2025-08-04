import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import DashboardBHW from './pages/DashboardBHW';
import DashboardMother from './pages/DashboardMother';
import PlottedCalendar from './pages/PlottedCalendar';
import ManageCalendar from './pages/ManageCalendar';
import AddMonitoring from './pages/AddMonitoring';
import ViewMonitoring from './pages/ViewMonitoring';

import LandingPage from './pages/LandingPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';





setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/Capstone/login">
          <Login />
        </Route>
        <Route exact path="/Capstone/dashboardbhw">
          <DashboardBHW />
        </Route>
        <Route exact path="/Capstone/dashboardmother">
          <DashboardMother />
        </Route> 
        <Route exact path="/Capstone/plottedcalendar">
          <PlottedCalendar />
        </Route>
        <Route exact path="/Capstone/managecalendar">
          <ManageCalendar />
        </Route>
        <Route exact path="/Capstone/addmonitoring">
          <AddMonitoring />
        </Route>  
        <Route exact path="/Capstone/viewmonitoring">
          <ViewMonitoring />
        </Route>      
  <Route exact path="/Capstone/landingpage">
          <LandingPage />
        </Route>                                            
        <Route exact path="/Capstone/">
          <Redirect to="/Capstone/landingpage" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
