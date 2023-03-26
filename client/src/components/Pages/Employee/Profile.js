import {
    Alert,
    AppBar,
    Button,
    CircularProgress,
    Toolbar,
    Tooltip,
    Typography
  } from "@mui/material";
  import { Box } from "@mui/system";
  import React, { useEffect, useState } from "react";
  import CheckIN from "./CheckIN";
  import { Link, useNavigate } from "react-router-dom";
  
  const Profile = () => {
    const [me, setMe] = useState({});
    const [error, setError] = useState(false);
    const [loading, setloading] = useState(false);
    const [access, setAccess] = useState(false);
    const navigate=useNavigate()
    
    const logout = () => {
      try {
          localStorage.removeItem("user");
          localStorage.removeItem('attendance')
         navigate("/Login")
      
      } catch (err) {
        
        console.log(err);
        setError(true);
        }
    };
    
    
    useEffect(() => {
      const getMe = async () => {
        setloading(true);
        try {
          const user=JSON.parse(localStorage.getItem("user"))
            setMe(user.user);
            setloading(false);
           if(user.user.role === 'employee'){
            setAccess(true)
            
           }
         
        } catch (err) {
          console.log(err);
          setloading(false);
          setError(true);
        }
      };
      getMe();
    }, []);
console.log(access)
    

    return (
      <>
        <AppBar position="static" style={{background: "#4F7942"}}>
          <Toolbar>
            <Button  style={{color:'white',fontWeight:'bold'}} onClick={logout}>Log Out</Button>
            <Box sx={{ flexGrow: 1 }} />
  <Tooltip title="Cant access if not admin">
  <span> <Button style={{color:'white',fontWeight:'bold'}} component={Link} disabled={access} to="/admin">
              Go to Admin
            </Button>
            </span>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <h1>Profile</h1> 
      <div style={{display:"flex",alignItems:'center', justifyContent:"space-around"}}><div><img src={`http://localhost:5000/${me.avatar}`} style={{width:250,height:250, borderRadius:50}} alt='picha' /><Button style={{
          background:"#2E8B57",
          color:'white',
          fontWeight:'bold'
        }} component={Link} to="/Profile/update">
          Change Profile
        </Button></div>
       <div><h3 style={{color:'green'}}>id: {"   "}    {me._id}</h3>
        <Typography component='h3'>name:{"   "}   {me.name}</Typography>

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
        {error && <Alert severity="error">Error finding Profile</Alert>}
       email:  {"   "}     {me.email}
       <div>password: {"   "}   {me.password}</div>
       <h5>role:  {"   "}   {me.role}</h5>
      </div> </div>  
        
        <CheckIN />
      </>
    );
  };
  
  export default Profile;
  
