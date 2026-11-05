import { useEffect, useState } from "react";
import { FiClock, FiLogIn, FiLogOut, FiMapPin, FiCalendar, FiTrendingUp, FiCreditCard } from "react-icons/fi";
import api, { errorMessage } from "../api";
import { useAuth } from "../auth";
import useFetch from "../useFetch";
import { Empty, ErrorAlert, Loading, Spinner, Stat, useToast } from "../components/ui";
import { fmtDate, fmtElapsed, fmtHours, fmtMoney, fmtTime, greeting, mapsLink } from "../format";

// Ask the browser for a position; resolves to null if denied or slow
const getPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });

export default function MyDay() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, error, loading, reload } = useFetch("/attendance/me");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [now, setNow] = useState(Date.now());

  const open = data?.open;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const act = async (kind) => {
    setBusy(true);
    setActionError("");
    try {
      const pos = await getPosition();
      const res = await api.post(`/attendance/${kind}`, pos || {});
      if (kind === "check-out") {
        toast(`Checked out · ${fmtHours(res.data.attendance.hours)} · ${fmtMoney(res.data.salary.amount)} earned`);
      } else {
        toast(pos ? "Checked in · location saved" : "Checked in (location not shared)");
      }
      await reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading />;

  const elapsed = open ? now - new Date(open.checkIn).getTime() : 0;
  const liveEarned = (elapsed / 36e5) * (data?.stats.hourlyRate || 0);
  const stats = data?.stats;

  return (
    <>
      <ErrorAlert>{error}</ErrorAlert>

      <section className={`clock${open ? " on" : ""}`}>
        <div className="clock-top">
          <div className="clock-greet">
            {greeting()},
            <strong>{user?.name?.split(" ")[0]}</strong>
          </div>
          {open ? (
            <span className="pill live">
              <span className="dot pulse" /> On shift since {fmtTime(open.checkIn)}
            </span>
          ) : (
            <span className="pill">
              <FiCalendar />
              {new Date(now).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
            </span>
          )}
        </div>

        <div className="clock-time" aria-live="off">
          {open ? fmtElapsed(elapsed) : new Date(now).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="clock-sub">
          {open
            ? `About ${fmtMoney(liveEarned)} earned this shift at ${fmtMoney(stats?.hourlyRate)}/hour`
            : "You're not checked in. Tap below when you start work."}
        </div>

        <div className="clock-actions">
          {open ? (
            <button className="btn btn-clock out" onClick={() => act("check-out")} disabled={busy}>
              {busy ? <Spinner small /> : <FiLogOut />} Check out
            </button>
          ) : (
            <button className="btn btn-clock" onClick={() => act("check-in")} disabled={busy}>
              {busy ? <Spinner small /> : <FiLogIn />} Check in
            </button>
          )}
          <span className="pill">
            <FiMapPin /> Your location is saved when you check in and out
          </span>
        </div>
      </section>

      {actionError && (
        <div style={{ marginTop: 16 }}>
          <ErrorAlert>{actionError}</ErrorAlert>
        </div>
      )}

      <div className="grid grid-3" style={{ margin: "18px 0" }}>
        <Stat icon={FiClock} label="Today" value={fmtHours(stats?.hoursToday)} sub="Completed shifts" />
        <Stat icon={FiTrendingUp} label="This week" value={fmtHours(stats?.hoursThisWeek)} sub="Since Monday" tone="info" />
        <Stat icon={FiCreditCard} label="Waiting to be paid" value={fmtMoney(stats?.pending)} sub={`${fmtMoney(stats?.paid)} paid so far`} tone="warn" />
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Recent shifts</h2>
          <span className="muted" style={{ fontSize: 13 }}>Last 30</span>
        </div>
        {data?.records?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Hours</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{fmtDate(r.checkIn)}</td>
                    <td className="num">{fmtTime(r.checkIn)}</td>
                    <td className="num">
                      {r.checkOut ? fmtTime(r.checkOut) : <span className="badge badge-green"><span className="dot pulse" />Now</span>}
                    </td>
                    <td className="num">{r.checkOut ? fmtHours(r.hours) : "—"}</td>
                    <td>
                      {mapsLink(r.checkInLocation) ? (
                        <a className="badge badge-blue" href={mapsLink(r.checkInLocation)} target="_blank" rel="noreferrer">
                          <FiMapPin /> View map
                        </a>
                      ) : (
                        <span className="muted">Not shared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={FiClock} title="No shifts yet">Your check-ins will show up here.</Empty>
        )}
      </section>
    </>
  );
}
