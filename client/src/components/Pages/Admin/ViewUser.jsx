import { Alert, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axios";
const ViewUser = () => {
  const [user, setUser] = useState({});
  const { id } = useParams();
  const [error, setError] = useState(false);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        await axios.get(`/api/users/${id}`).then((res) => {
          setUser(res.data);
          setloading(false);
        });
      } catch (err) {
        console.log(err);
        setloading(false);
        setError(true);
      }
    };
    getUser();
  }, [id]);

  return (
    <>
      <div>ViewUser</div>
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
      {error && <Alert severity="error">Error finding Profile</Alert>}\
      <h1>{user.name}</h1>
      <h1>{user._id}</h1>
    </>
  );
};

export default ViewUser;
