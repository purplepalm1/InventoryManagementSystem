import './App.css';
import { useEffect, useContext, useState } from 'react';
import Manager from './manager/Login';
import Corporate from './corporate/Login';
import Customer from './customer/Landing';
import CustomerStoreView from './customer/Store';
import CorporateStores from './corporate/Stores';
import CorporateStore from './corporate/Store';
import ManagerMissing from './manager/Missing';
import ManagerHome from './manager/Home';
import ManagerInventory from './manager/ShelfInventory';
import CorporateCreateItem from './corporate/CreateItem';
import PageNotFound from './components/PageNotFound';
import ManagerOverStock from './manager/OverStockInventory';
//router
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import AuthContext from './authentication/auth-context';
import CorporateAssignItemLocation from './corporate/AssignItemLocation';
import CorporateCreateStoreAlternative from './corporate/storeCreateAlternative';
import CorporateTotalInventory from './corporate/TotalInventory';
import CorporateHome from './corporate/Home';
import CorporateExpensive from './corporate/mostExpensive';
import { Typography } from '@mui/material';
import UnauthorizedPage from './components/UnauthorizedPage';
import NoStoreAssignedPage from './components/NoStoreAssigned';
import { Auth } from 'aws-amplify';

function App() {

  const { isAuthenticated, isManager, isCorporate, setIsAuthenticated, setIsManager, setIsCorporate } = useContext(AuthContext);

  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      const user = await Auth.currentSession();
      // once Auth.currentSession() runs successfully, we call userHasAuthenticated(true)
      setIsAuthenticated(true);
      //logic to set role here; is custom:role is manager then set isManager to true otherwise isCorporate to true.

      if (user.idToken.payload['custom:role'] === 'manager') {
        setIsManager(true);
      } else if (user.idToken.payload['custom:role'] === 'corporate') {
        setIsCorporate(true);
      } else {
        //the user doesn't have a recognizable role. so will set both roles to false
        setIsManager(false);
        setIsCorporate(false);
      }
    } catch (e) {
      if (e !== "No current user") {
        alert(e);
      }
    }
  }
  return (
    <div>
      <Router>
        <Routes>
          {<Route exact path="/corporate/home" element={(isAuthenticated && isCorporate) ? <CorporateHome /> : <UnauthorizedPage />} />}
          <Route path="/corporate/login" element={<Corporate />} />
          {<Route path="/corporate/all_stores" element={(isAuthenticated && isCorporate) ? <CorporateStores /> : <UnauthorizedPage />} />}
          {<Route path="/corporate/all_stores/:storeId" element={(isAuthenticated && isCorporate) ? <CorporateStore /> : <UnauthorizedPage />} />}
          {<Route path="/corporate/createItem" element={(isAuthenticated && isCorporate) ? <CorporateCreateItem /> : <UnauthorizedPage />} />}
          {<Route path="/corporate/assignItemLocation" element={(isAuthenticated && isCorporate) ? <CorporateAssignItemLocation /> : <UnauthorizedPage />} />}
          {<Route path="/corporate/createStoreAlternative" element={(isAuthenticated && isCorporate) ? <CorporateCreateStoreAlternative /> : <UnauthorizedPage />} />}
          {<Route path="/corporate/totalInventory" element={(isAuthenticated && isCorporate) ? <CorporateTotalInventory /> : <UnauthorizedPage />} />}
          {<Route path="/corporate/mostExpensive" element={(isAuthenticated && isCorporate) ? <CorporateExpensive /> : <UnauthorizedPage />} />}
        </Routes>
        <Routes>
          <Route exact path="/manager/login" element={<Manager />} />
          {<Route exact path="/manager/noStoreAssigned" element={(isAuthenticated && isManager) ? <NoStoreAssignedPage /> : <UnauthorizedPage />} />}
          {<Route path="/manager/:storeId/home" element={(isAuthenticated && isManager) ? <ManagerHome /> : <UnauthorizedPage />} />}
          {<Route path="/manager/:storeId/inventory" element={(isAuthenticated && isManager) ? <ManagerInventory /> : <UnauthorizedPage />} />}
          {<Route path="/manager/:storeId/overstock" element={(isAuthenticated && isManager) ? <ManagerOverStock /> : <UnauthorizedPage />} />}
          {<Route path="/manager/:storeId/missing" element={(isAuthenticated && isManager) ? <ManagerMissing /> : <UnauthorizedPage />} />}
        </Routes>

        <Routes>
          <Route path="/" element={<Customer />} />
          <Route path="/all_stores/:storeId" element={<CustomerStoreView />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;
