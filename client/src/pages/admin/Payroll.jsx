import { useState } from "react";
import { FiCheck, FiDollarSign } from "react-icons/fi";
import api, { errorMessage } from "../../api";
import useFetch from "../../useFetch";
import { Confirm, Empty, ErrorAlert, Loading, PageHead, Person, Spinner, Stat, useToast } from "../../components/ui";
import { fmtDate, fmtHours, fmtMoney } from "../../format";

export default function Payroll() {
  const toast = useToast();
  const summary = useFetch("/salary/summary");
  const [status, setStatus] = useState("pending");
  const entries = useFetch(`/salary${status === "all" ? "" : `?status=${status}`}`);
  const [payTarget, setPayTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(null);

  const reloadAll = () => {
    summary.reload();
    entries.reload();
  };

  const payUser = async () => {
    setBusy(true);
    try {
      await api.post(`/salary/pay-user/${payTarget.user._id}`);
      toast(`${fmtMoney(payTarget.pending)} marked as paid to ${payTarget.user.name}`);
      setPayTarget(null);
      reloadAll();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const payOne = async (id) => {
    setPaying(id);
    try {
      await api.put(`/salary/${id}/pay`);
      toast("Marked as paid");
      reloadAll();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setPaying(null);
    }
  };

  if (summary.loading) return <Loading />;
  const rows = summary.data || [];
  const totalPending = rows.reduce((a, r) => a + r.pending, 0);
  const totalPaid = rows.reduce((a, r) => a + r.paid, 0);
  const totalHours = rows.reduce((a, r) => a + r.hours, 0);

  return (
    <>
      <PageHead title="Payroll" sub="Pay is worked out from hours × each person's hourly rate." />
      <ErrorAlert>{summary.error}</ErrorAlert>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <Stat icon={FiDollarSign} label="Due now" value={fmtMoney(totalPending)} tone="warn" />
        <Stat icon={FiCheck} label="Paid out" value={fmtMoney(totalPaid)} />
        <Stat icon={FiDollarSign} label="Hours paid for" value={fmtHours(totalHours)} tone="info" />
      </div>

      <section className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <h2>By employee</h2>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Shifts</th>
                  <th>Hours</th>
                  <th>Paid</th>
                  <th className="right">Due</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td><Person user={r.user} sub={`${fmtMoney(r.user.hourlyRate)}/h`} /></td>
                    <td className="num">{r.shifts}</td>
                    <td className="num">{fmtHours(r.hours)}</td>
                    <td className="num muted">{fmtMoney(r.paid)}</td>
                    <td className="num right" style={{ fontWeight: 800 }}>{fmtMoney(r.pending)}</td>
                    <td className="right">
                      <button className="btn btn-primary btn-sm" disabled={r.pending <= 0} onClick={() => setPayTarget(r)}>
                        <FiCheck /> Pay all
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={FiDollarSign} title="No pay yet">Pay entries are created when employees check out.</Empty>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Pay entries</h2>
          <div className="segmented" role="tablist">
            {[["pending", "Pending"], ["paid", "Paid"], ["all", "All"]].map(([v, l]) => (
              <button key={v} role="tab" aria-selected={status === v} className={status === v ? "on" : ""} onClick={() => setStatus(v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {entries.loading ? (
          <Loading />
        ) : entries.data?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Shift</th>
                  <th>Hours</th>
                  <th className="right">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.data.map((s) => (
                  <tr key={s._id}>
                    <td><Person user={s.user} /></td>
                    <td>{fmtDate(s.createdAt)}</td>
                    <td className="num">{fmtHours(s.hours)} × {fmtMoney(s.rate)}</td>
                    <td className="num right" style={{ fontWeight: 700 }}>{fmtMoney(s.amount)}</td>
                    <td>
                      {s.status === "paid" ? (
                        <span className="badge badge-green">Paid</span>
                      ) : (
                        <button className="btn btn-ghost btn-sm" onClick={() => payOne(s._id)} disabled={paying === s._id}>
                          {paying === s._id ? <Spinner small /> : <FiCheck />} Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={status === "pending" ? "Everyone is paid up" : "Nothing here"} />
        )}
      </section>

      {payTarget && (
        <Confirm
          title={`Pay ${payTarget.user.name}?`}
          message={`This marks ${fmtMoney(payTarget.pending)} as paid. Do it after you've sent the money (e.g. by M-Pesa).`}
          confirmLabel="Mark as paid"
          busy={busy}
          onConfirm={payUser}
          onClose={() => setPayTarget(null)}
        />
      )}
    </>
  );
}
