import { FiCheckCircle, FiClock, FiCreditCard, FiDollarSign } from "react-icons/fi";
import useFetch from "../useFetch";
import { useAuth } from "../auth";
import { Empty, ErrorAlert, Loading, PageHead, Stat } from "../components/ui";
import { fmtDate, fmtHours, fmtMoney } from "../format";

export default function MyPay() {
  const { user } = useAuth();
  const { data, error, loading } = useFetch("/salary/me");

  if (loading) return <Loading />;
  const rows = data || [];
  const sum = (f) => rows.filter(f).reduce((a, r) => a + r.amount, 0);
  const hours = rows.reduce((a, r) => a + r.hours, 0);

  return (
    <>
      <PageHead title="My pay" sub={`You earn ${fmtMoney(user?.hourlyRate)} for every hour worked.`} />
      <ErrorAlert>{error}</ErrorAlert>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <Stat icon={FiClock} label="Waiting to be paid" value={fmtMoney(sum((r) => r.status === "pending"))} tone="warn" />
        <Stat icon={FiCheckCircle} label="Paid" value={fmtMoney(sum((r) => r.status === "paid"))} />
        <Stat icon={FiDollarSign} label="Hours logged" value={fmtHours(hours)} sub={`${rows.length} shifts`} tone="info" />
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Pay history</h2>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Shift date</th>
                  <th>Hours</th>
                  <th>Rate</th>
                  <th className="right">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{fmtDate(r.createdAt)}</td>
                    <td className="num">{fmtHours(r.hours)}</td>
                    <td className="num muted">{fmtMoney(r.rate)}/h</td>
                    <td className="num right" style={{ fontWeight: 700 }}>{fmtMoney(r.amount)}</td>
                    <td>
                      {r.status === "paid" ? (
                        <span className="badge badge-green">Paid {r.paidAt && fmtDate(r.paidAt)}</span>
                      ) : (
                        <span className="badge badge-amber">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={FiCreditCard} title="Nothing yet">Pay is added each time you check out.</Empty>
        )}
      </section>
    </>
  );
}
