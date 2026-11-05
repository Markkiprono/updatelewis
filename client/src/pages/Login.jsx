import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiMapPin, FiClock, FiDollarSign, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../auth";
import api, { errorMessage } from "../api";
import { ErrorAlert, Spinner } from "../components/ui";
import { Brand } from "../components/Layout";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState([]);

  useEffect(() => {
    api.get("/health").then((r) => setDemo(r.data.demoAccounts || [])).catch(() => {});
  }, []);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await login(email, password);
      const from = location.state?.from;
      navigate(from && from !== "/login" ? from : u.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-art">
        <Brand />
        <div>
          <h2>Clock in, track hours and pay your team in one place.</h2>
          <p>Staff check in from their phone. You see who's working, where they checked in, and what everyone has earned.</p>
          <div className="auth-feats">
            <div className="auth-feat"><span><FiClock /></span>One-tap check in and check out</div>
            <div className="auth-feat"><span><FiMapPin /></span>Location recorded with every shift</div>
            <div className="auth-feat"><span><FiDollarSign /></span>Pay worked out from hours automatically</div>
          </div>
        </div>
        <p className="foot" style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>© {new Date().getFullYear()} Groupwork</p>
      </section>

      <section className="auth-form">
        <div className="auth-box">
          <h1>Welcome back</h1>
          <p>Log in with the email and password your admin gave you.</p>

          <form onSubmit={submit} noValidate>
            <ErrorAlert>{error}</ErrorAlert>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  className="input"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={busy || !email || !password}>
              {busy ? <Spinner small /> : <>Log in <FiArrowRight /></>}
            </button>
          </form>

          {demo.length > 0 && (
            <div className="demo-box">
              <strong>Demo mode: try an account</strong>
              {demo.map((d) => (
                <div className="row" key={d.email}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{d.label}</div>
                    <code>{d.email} · {d.password}</code>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setEmail(d.email);
                      setPassword(d.password);
                    }}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
