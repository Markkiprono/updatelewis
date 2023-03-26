import { Alert, Card, CardMedia, CircularProgress, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import axios from '../../../api/axios';

const ViewUserImage = () => {
    const [users, setUsers] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      try {
        await axios.get("/api/users/all").then((res) => {
          setUsers(res.data);
          setloading(false);
        });
      } catch (err) {
        console.log(err);
        setloading(false);
        setError(true);
      }
    };
    getUsers();
  }, []);
  return (
    <div style={{height:"100vh",overflow:'auto'}}>
         {loading && (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <CircularProgress style={{ color: "black", marginTop: 10 }} />
        </div>
      )}
     {error && <Alert style={{marginLeft:100}} severity="error">Error finding user Profile</Alert>}
     <Grid container spacing={1}>
   
      {users.map((user) => (  <Grid xs={4} >
<Card style={{margin:10, width:200,height:300}}>
    <CardMedia>
    
    <img  style={{objectFit:"cover",width:"100%",maxHeight:"70%" }}  src={`http://localhost:5000/${user.avatar}`} alt=''/>
    
     </CardMedia>
     <Typography>{user.email}</Typography>
     </Card></Grid>
      ))}</Grid>
      </div>
  )
}

export default ViewUserImage