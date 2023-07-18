import { useState, useContext } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Container, Typography, Box, Grid, Button, Avatar, TextField } from '@mui/material/';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AuthContext, { AuthProvider } from '../authentication/auth-context.js';
import { useNavigate } from 'react-router-dom';
import { Auth, Hub } from 'aws-amplify';
import { LoadingButton } from '@mui/lab';
import { AlertError } from '../components/AlertError';
import { AlertSuccess } from '../components/AlertSuccess';

//URL
var base_url = "https://3fckw1ryka.execute-api.us-east-1.amazonaws.com/Prod/";
var push_manager_info_url = base_url + "pushManagerInfo";
var get_store_with_manager_info_url = base_url + "getStoreWithManagerInfo";


// note in order to use the login method inside the "LoginAppBtn" component, the parent component i.e. App.js must have access to the auth-context.js component

const theme = createTheme();

export default function SignIn(props) {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, isCorporate, isManager, setIsCorporate, setIsManager } = useContext(AuthContext);

  // success, error state for user feedback

  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [success, setSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');



  //set state objects
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //this is to toggle between login to sign up function
  const [loginButton, setLogginButton] = useState(true);

  // giving feedback to user while we are logging in
  const [isLoading, setIsLoading] = useState(false);


  //handle switch between login/signup
  const handleSwitch = () => {
    setLogginButton((prevState) => !prevState);
  }

  // This triggers a submission no matter which mode we are in, whether it is "Sign In" or "Sign up"
  const handleSubmit = async (event) => {
    event.preventDefault(); //to prevent the browser's default behavior of sending the request automatically

    setIsLoading(true);
    //extract the entered data.
    const data = new FormData(event.currentTarget);
    const formEmail = data.get('email');
    const formPassword = data.get('password');
    if (loginButton) {
      //sign in
      console.log(formEmail, formPassword);
      try {
        const user = await Auth.signIn(formEmail, formPassword);
        console.log(user);
        // if the user is corporate
        if (user.attributes['custom:role'] === 'corporate') {
          console.log("Yes! The user is a corporate, then we should bring them to corporate page");
          navigate('/corporate/home', { replace: true });
          setIsCorporate(true);
        } else { //the user is a manager, then we will fetch the storeId associated with the user;
          // get the store associated with user sub
          setIsManager(true);
          const managerID = user.username;

          let data = {};
          data['userID'] = managerID;
          //building up the payload; ffirst starting from data, then build a body
          let body = {};
          body['body'] = JSON.stringify(data);
          console.log(body);
          let js = JSON.stringify(body);
          //send the data using a fetch request
          fetch(get_store_with_manager_info_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: js,
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("success: ", data);
              let storeId = data.storeID;
              data.statusCode == 200 && storeId !== undefined ? navigate(`/manager/${storeId}/home`, { replace: true }) : navigate("/manager/noStoreAssigned");
            })
            .catch((error) => {
              console.log('Error: ', error);
              setError(true);
              setErrorText(error.message);
            })

          //reset the data field values
          setEmail('');
          setPassword('');
          setLogginButton(true);
        }
      } catch (error) {
        console.log('Error: ', error);
        setError(true);
        setErrorText(error.message);
        setIsLoading(false);
        setEmail('');
        setPassword('');
        setLogginButton(true);
      }
    } else {
      //sign up
      try {
        const { user, userSub } = await Auth.signUp({
          username: formEmail,
          password: formPassword,
          attributes: {
            'custom:role': props.userRole.toLowerCase()
          }
        });
        const inputEmail = user.username;
        const inputUserID = userSub;

        // if the user is a manager, then push the inputUserID and inputEmail to the database
        if (props.userRole.toLowerCase() === 'manager') {
          console.log("Pushing manager ....")
          let data = {};
          data['userID'] = inputUserID;
          data['email'] = inputEmail;
          //building up the payload; ffirst starting from data, then build a body
          let body = {};
          body['body'] = JSON.stringify(data);
          console.log(body);
          let js = JSON.stringify(body);
          //send the data using a fetch request
          fetch(push_manager_info_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: js,
          })
            .then((response) => response.json())
            .then((data) => {
              setSuccess(true);
              setSuccessText(data.result);

              //reset success state back to false to ready for the next invocation
              setTimeout(() => {
                setSuccess(false);
              }, 2000)
            })
            .catch((error) => {
              console.log('Error: ', error);
              setError(true);
              setErrorText(error.message);
            })
        } else if (props.userRole.toLowerCase() === 'corporate') { // if the signed up user is a corporate one
          setSuccess(true);
          setSuccessText(`Successfully created a corporate user with email ${inputEmail}`);
        }

        //reset the data field values
        setEmail("");
        setPassword("");
        setLogginButton(true);
        setIsLoading(false);
      } catch (error) {
        console.log('Error: ', error);
        setError(true);
        setErrorText(error.message);
        setIsLoading(false);
        setEmail("");
        setPassword("");
        setLogginButton(true);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        {success ? <AlertSuccess showValue={success} alertTitle="Success" alertMessage={successText} /> : null}
        {error ? <AlertError alertText={errorText} alertTitle="Error" error={errorText} handleCloseError={() => setError(false)} /> : null}

        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>

          {loginButton ?
            <Typography component="h1" variant="h5">
              Sign In As {props.userRole}
            </Typography>
            :
            <Typography component="h1" variant="h5">
              Sign Up As {props.userRole}
            </Typography>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              fullWidth
              value={email}
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <LoadingButton
              loading={isLoading}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {loginButton ? "Sign In" : "Sign Up"}
            </LoadingButton>

            {/* DO NOT DELETE IN CASE WE NEED "FORGOT PASSWORD" OR "SIGN UP" FUNCTION */}
            <Grid container>
              <Grid item>
                <Button
                  variant="text"
                  style={{
                    textTransform: 'none'
                  }}
                  onClick={handleSwitch}
                >
                  {loginButton ? "Don't have an account? Sign Up" : "Sign in with an existing account"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
