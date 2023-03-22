import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import { Button, CircularProgress } from "@mui/material";

const Alert1 = React.forwardRef(function Alert1(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CheckIN = () => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeout,setEmployeeout]=useState([])
const [user,setUser]=useState([])
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const CheckInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/api/attendance/${user._id}`).then((res) => {
        setLoading(false);
        setOpen(true);
        localStorage.setItem("attendance", JSON.stringify(res.data));
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError(true);
    }
  };


  useEffect(()=>{
    const user=JSON.parse(localStorage.getItem('user'))
    const attendance=JSON.parse(localStorage.getItem('attendance'))
 
    setEmployeeout(attendance)
    setUser(user.user)
  },[])

const createSalary=async(e)=>{
  
  try{
    await axios.post(`/api/salary/${user._id}`)
  }
  catch(err){
console.log(err)
  }
}
console.log(employeeout)
  const checkOutSubmit = async (e) => {
   
    setLoading(true);
    try {
      await axios.put(`/api/attendance/${employeeout._id}`).then((res) => {
        setLoading(false);
        setOpen(true);
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError(true);
    }
  };
  return (
    <>
      {error && <Alert severity="error">Error</Alert>}
<div style={{display:'flex',alignItems:"center",justifyContent:"space-around"}}>
      <Button
        style={{
          background: "#2E8B57",
          color: "white",
          position: "relative",
          top: 20,
          borderRadius: 7
        }}
        onClick={CheckInSubmit}
      >
        Check In
      </Button>
      <Button
        style={{
          background: "#2E8B57",
          color: "white",
          position: "relative",
          top: 20,
          borderRadius: 7
        }}
        onClick={()=>{checkOutSubmit()  
        createSalary()}
      }
      >
        Check Out
      </Button></div>
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
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert1 onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Success
        </Alert1>
      </Snackbar>
    </>
  );
};

export default CheckIN;
