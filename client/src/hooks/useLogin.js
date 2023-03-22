import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const login = async (email, password) => {
    setLoading(true);
    try {
      await axios.post("/api/users/login", { email, password }).then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data));
        setLoading(false);
        setOpen(true);
        dispatch({ type: "LOGIN", payload: res });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      });
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setErrorMessage(err.message);
      }
      console.log(err);
      setError(true);
      setLoading(false);
      setErrorMessage(err.response.data);
    }
  };
  return { login, loading, error, errorMessage, open, setOpen };
};
