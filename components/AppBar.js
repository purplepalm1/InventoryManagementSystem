import { useState, useContext, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuListComposition from './MenuList.js';
import AuthContext from '../authentication/auth-context.js';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

function CustomAppBar() {
  const { isAuthenticated, setIsAuthenticated, isManager, setIsManager, isCorporate, setIsCorporate } = useContext(AuthContext);
  //to aid with loading user session. to load whenever the app loads. Since Auth.currentSession() returns a promise, we need to ensure that the rest of our app is only ready to
  // go after this as been loaded. // initializes to true since when we first load our app, it'll start by checking the current authentication state.
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await Auth.signOut();
    setIsAuthenticated(false);
    setIsCorporate(false);
    setIsManager(false);
    // //redirect to Customer Landing page
    navigate('/', { replace: true });
  }

  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      await Auth.currentSession();
      // once Auth.currentSession() runs successfully, we call userHasAuthenticated(true)
      setIsAuthenticated(true);
      //logic to set role here; is custom:role is manager then set isManager to true otherwise isCorporate to true.
    } catch (e) {
      if (e !== "No current user") {
        alert(e);
      }
    }

    setIsAuthenticating(false);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="relative">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuListComposition />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Switch User Role
          </Typography>

          { /* TODO: the login button must changed to "logged in once an user has logged in" */}
          {isAuthenticated ? <Button color="inherit" onClick={handleLogout}>Logout</Button> : <Button color="inherit">Login</Button>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default CustomAppBar;