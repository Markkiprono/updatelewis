import { Link } from "react-router-dom";
import { FiUsers, FiActivity, FiClock, FiDollarSign, FiArrowRight, FiCoffee } from "react-icons/fi";
import useFetch from "../../useFetch";
import { Empty, ErrorAlert, Loading, PageHead, Person, Stat } from "../../components/ui";
import { fmtHours, fmtMoney, fmtTime, timeAgo } from "../../format";

function HoursChart({ perDay }) {
  const max = Math.max(1, ...perDay.map((d) => d.hours));
  const last = perDay.length - 1;
  return (
    <>
      <div className="bars" role="img" aria-label="Hours worked per day for the last 7 days">
        {perDay.map((d, i) => (
          <div className="bar-col" key={d.date}>
            <span className="bar-val">{d.hours ? Math.round(d.hours) : ""}</span>
            <div className={`bar${i === last ? " today" : ""}`} style={{ height: `${(d.hours / max) * 100}%` }} title={`${fmtHours(d.hours)}`} />
          </div>
        ))}
      </div>
      <div className="bar-labels">
        {perDay.map((d, i) => (
          <span key={d.date}>{i === last ? "Today" : new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</span>
        ))}
      </div>
    </>
  );
}

export default function Overview() {
  const { data, error, loading } = useFetch("/attendance/overview");
  if (loading) return <Loading />;
  if (!data) return <ErrorAlert>{error}</ErrorAlert>;

  return (
    <>
      <PageHead
        title="Overview"
        sub={new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      >
        <Link to="/admin/employees" className="btn btn-primary">
          <FiUsers /> Manage employees
        </Link>
      </PageHead>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <Stat icon={FiUsers} label="People" value={data.employees} sub="Accounts in total" />
        <Stat icon={FiActivity} label="On shift now" value={data.onShift.length} sub="Checked in right now" tone="info" />
        <Stat icon={FiClock} label="Hours this week" value={fmtHours(data.hoursThisWeek)} sub="Since Monday" />
        <Stat icon={FiDollarSign} label="Payroll due" value={fmtMoney(data.pendingPayroll)} sub="Not yet paid" tone="warn" />
      </div>

      <div className="split">
        <div className="stack">
          <section className="card">
            <div className="card-head">
              <h2>Hours worked, last 7 days</h2>
            </div>
            <HoursChart perDay={data.perDay} />
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Recent activity</h2>
              <Link to="/admin/attendance" className="btn btn-ghost btn-sm">
                All attendance <FiArrowRight />
              </Link>
            </div>
            {data.recent.length ? (
              <ul className="rows">
                {data.recent.map((r) => (
                  <li key={r._id}>
                    <Person user={r.user} sub={r.checkOut ? `Checked out · worked ${fmtHours(r.hours)}` : `Checked in at ${fmtTime(r.checkIn)}`} />
                    <span className="meta">{timeAgo(r.checkOut || r.checkIn)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="No activity yet">Check-ins will appear here.</Empty>
            )}
          </section>
        </div>

        <section className="card">
          <div className="card-head">
            <h2>Working now</h2>
            <span className="badge badge-green">
              <span className="dot pulse" /> {data.onShift.length} live
            </span>
          </div>
          {data.onShift.length ? (
            <ul className="rows">
              {data.onShift.map((r) => (
                <li key={r._id}>
                  <Person user={r.user} sub={`Since ${fmtTime(r.checkIn)}`} />
                  <span className="badge num">{fmtHours((Date.now() - new Date(r.checkIn)) / 36e5)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={FiCoffee} title="Nobody is on shift">People who check in will appear here.</Empty>
          )}
        </section>
      </div>
    </>
  );
}
