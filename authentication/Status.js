// simple file to display if we are logged in or not.

import React, { useState, useContext, useEffect } from 'react';
import AuthContext from './auth-context';
import { Button } from '@mui/material';

export default () => {

    //use useState hook to keep track of whether we are logged in or not. 
    const [status, setStatus] = useState(false);
    const { getSession, logout } = useContext(AuthContext);

    //this will be run when the component gets mount and we can use to get session
    useEffect(() => {
        getSession()
            .then(session => {
                console.log('Session: ', session);
                setStatus(true);
            })
        //note: no need to catch error here because by default, we are not logged in
    }, [status])

    return (
        // <Button variant="contained">{status ? 'Logged in' : 'Login'}</Button>
        <div>
            {status ? <Button variant="contained" onClick={logout} >Log out</Button> : <Button variant="contained">Log in</Button>}
        </div>
    );
}