import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function Welcome() {
    return (
        <Typography variant="subtitle1" align="center" >
            <p>
                Welcome to our Inventory Management System Homepage!
            </p>
            <p>
                Please use the top menu bar to change user role (Authentication may be required)
            </p>
        </Typography >
    )
}