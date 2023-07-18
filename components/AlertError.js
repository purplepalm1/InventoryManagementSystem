import { Alert, AlertTitle, Box, Collapse, IconButton } from "@mui/material";
import { useState, useContext, useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';

export const AlertError = ({ alertTitle, alertText, error, handleCloseError }) => {

    // const [open, setOpen] = useState(true);

    return (

        <Box sx={{ width: '100%' }}>
            <Collapse in={error}>
                <Alert
                    severity="error"
                    variant="outlined"
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={handleCloseError}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    <AlertTitle>{alertTitle}</AlertTitle>
                    {alertText}
                </Alert>
            </Collapse>

        </Box>
    )
}
