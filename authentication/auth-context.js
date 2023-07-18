import { useState, createContext, useContext, useEffect } from 'react';
import { Auth } from 'aws-amplify';


const AuthContext = createContext({}); //empty object


export const AuthProvider = ({ children }) => { //children represents the component inside AuthProvider
    const [auth, setAuth] = useState({});
    // this initializes isAuthenticated variable to false, as in the user is not logged in.
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [isCorporate, setIsCorporate] = useState(false);


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
    }

    return (
        <AuthContext.Provider value={{
            auth, setAuth, isAuthenticated,
            setIsAuthenticated, isManager, setIsManager,
            isCorporate, setIsCorporate
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;