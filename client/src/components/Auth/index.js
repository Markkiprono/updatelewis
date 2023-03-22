import React, { useEffect} from "react";
import Login from "./Login";
import "./auth.css";
import { useNavigate } from "react-router-dom";
const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <>
      <div className="Wrapper">
        <div className="cardWrapper">
          <h1 className="headWrapper">Authentication</h1>

          <div className="formWrapper">
            <Login />
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
