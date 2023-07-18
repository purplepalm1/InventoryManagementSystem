import { Alert, AlertTitle } from "@mui/material";
import { useState, useEffect } from 'react';


export function AlertSuccess({ showValue, alertTitle, alertMessage }) {
    const [show, setShow] = useState(showValue);

    // On componentDidMount set the timer
    useEffect(() => {
        const timeId = setTimeout(() => {
            // After 3 seconds set the show value to false
            setShow(false)
        }, 2000)

        return () => {
            clearTimeout(timeId)
        }
    }, []);

    // If show is false the component will return null and stop here
    if (!show) {
        return null;
    }

    // If show is true this will be returned
    return (
        <div >
            <Alert severity="success" variant="outlined">
                <AlertTitle>{alertTitle}</AlertTitle>
                {alertMessage}
            </Alert>
        </div>
    )
}