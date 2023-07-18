import * as React from 'react';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { ButtonGroup, Button } from '@mui/material'


export default function NavTabs() {
    return (
        <Box sx={{ width: '100%' }}>
            <ButtonGroup variant="contained">


                {/* <Link to={"/corporate/store"} style={{ textDecoration: "none", color: "black" }}>
                    <Button>
                        Create store
                    </Button>
                </Link> */}

                <Link to={"/manager/login"} style={{ textDecoration: "none", color: "black" }}>
                    <Button>
                        Manager Login
                    </Button>
                </Link>

                <Link to={"/corporate/login"} style={{ textDecoration: "none", color: "black" }}>
                    <Button>
                        Corporate Login
                    </Button>
                </Link>

                <Link to={"/corporate/createStoreAlternative"} style={{ textDecoration: "none", color: "black" }}>
                    <Button>
                        Create Store
                    </Button>
                </Link>

                <Link to={"/corporate/createItem"} style={{ textDecoration: "none", color: "black" }}>
                    <Button>
                        Create Item
                    </Button>
                </Link>

                <Link to={"/corporate/assignItemLocation"} style={{ textDecoration: "none", color: "black" }}>
                    <Button >
                        Assign Item Location
                    </Button>
                </Link>
                <Link to={"/manager/:storeId/home"} style={{ textDecoration: "none", color: "black" }}>
                    <Button disabled>
                        Process Shipment
                    </Button>
                </Link>
                <Link to={"/manager/:storeId/inventory"} style={{ textDecoration: "none", color: "black" }}>
                    <Button disabled>
                        Generate Inventory for Store
                    </Button>
                </Link>



            </ButtonGroup>
        </Box>
    );
}