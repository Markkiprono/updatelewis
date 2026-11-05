import { useMemo, useState } from "react";
import { FiCalendar, FiMapPin, FiSearch } from "react-icons/fi";
import useFetch from "../../useFetch";
import { Empty, ErrorAlert, Loading, PageHead, Person } from "../../components/ui";
import { fmtDate, fmtHours, fmtTime, mapsLink } from "../../format";

const FILTERS = [
  ["all", "All"],
  ["open", "On shift"],
  ["closed", "Completed"],
];

export default function Attendance() {
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const { data, error, loading } = useFetch(`/attendance${status === "all" ? "" : `?status=${status}`}`);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data || []).filter((r) => !s || r.user.name.toLowerCase().includes(s) || r.user.email.toLowerCase().includes(s));
  }, [data, q]);

  const total = rows.reduce((a, r) => a + (r.hours || 0), 0);

  return (
    <>
      <PageHead title="Attendance" sub="Every check-in and check-out, newest first.">
        <div className="search">
          <FiSearch />
          <input className="input" placeholder="Search employee" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search employee" />
        </div>
      </PageHead>

      <section className="card">
        <div className="card-head">
          <div className="segmented" role="tablist">
            {FILTERS.map(([v, label]) => (
              <button key={v} role="tab" aria-selected={status === v} className={status === v ? "on" : ""} onClick={() => setStatus(v)}>
                {label}
              </button>
            ))}
          </div>
          <span className="muted num" style={{ fontSize: 13 }}>
            {rows.length} shifts · {fmtHours(total)}
          </span>
        </div>
        <ErrorAlert>{error}</ErrorAlert>
        {loading ? (
          <Loading />
        ) : rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Checked in</th>
                  <th>Checked out</th>
                  <th>Hours</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td><Person user={r.user} /></td>
                    <td style={{ fontWeight: 600 }}>{fmtDate(r.checkIn)}</td>
                    <td className="num">{fmtTime(r.checkIn)}</td>
                    <td className="num">
                      {r.checkOut ? fmtTime(r.checkOut) : <span className="badge badge-green"><span className="dot pulse" />On shift</span>}
                    </td>
                    <td className="num" style={{ fontWeight: 700 }}>{r.checkOut ? fmtHours(r.hours) : "—"}</td>
                    <td>
                      {mapsLink(r.checkInLocation) ? (
                        <a className="badge badge-blue" href={mapsLink(r.checkInLocation)} target="_blank" rel="noreferrer">
                          <FiMapPin /> Map
                        </a>
                      ) : (
                        <span className="muted" style={{ fontSize: 13 }}>{r.checkInLocation?.ip || r.location || "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={FiCalendar} title="No shifts found" />
        )}
      </section>
    </>
  );
}
