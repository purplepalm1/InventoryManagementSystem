import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import StoreIcon from "@mui/icons-material/Store";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams, useNavigate } from 'react-router-dom';

const Demo = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper
}));


/*
"stores": [
    {
      "SKU": "B",
      "item_name": "lorem",
      "storeID": "3efb9c40-69fe-11ed-a421-4f6a8ddc10c2",
      "store_name": "Worcester",
      "longitude": 123.4,
      "latitude": 1.2
    }
  ]
*/

export default function StoresByItem({ storeLists }) {
  // to pass down the storeId information to the CustomerStoreView component


  return (
    <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
      <Grid item xs={12} md={12}>
        <Typography sx={{ mt: 4, mb: 0 }} variant="h6" component="div">
          Stores That Have The Item
        </Typography>
        <Demo>

          <List>
            {storeLists.map((store) => (
              <ListItem
                key={store.storeID}
                secondaryAction={

                  <Link
                    to={{
                      pathname: `/all_stores/${store.storeID}`,
                      state: store
                    }
                    }
                    style={{ textDecoration: "none" }}>
                    <Button variant="contained">View Store &gt;</Button>
                  </Link>
                }
              >
                <ListItemAvatar>
                  <Avatar>  
                    <StoreIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${store.store_name}`}
                  secondary={`${store.distance.toFixed(2)} miles away`}
                />
                <ListItemText
                  primary={`SKU: ${store.SKU}`}
                  secondary={`Item Name: ${store.item_name}`}
                />
              </ListItem>

            ))}
          </List>

        </Demo>
      </Grid>
    </Box>
  );
}
