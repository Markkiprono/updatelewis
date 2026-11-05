import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiKey, FiTrash2, FiMapPin, FiSave, FiClock } from "react-icons/fi";
import api, { errorMessage } from "../../api";
import useFetch from "../../useFetch";
import { useAuth } from "../../auth";
import { Avatar, Confirm, Empty, ErrorAlert, Loading, Spinner, useToast } from "../../components/ui";
import { TempPassword } from "./Employees";
import { fmtDate, fmtHours, fmtJoined, fmtMoney, fmtTime, mapsLink } from "../../format";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user: me } = useAuth();
  const { data, error, loading, reload } = useFetch(`/users/${id}`);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirm, setConfirm] = useState(null); // "delete" | "reset"
  const [busy, setBusy] = useState(false);
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    if (data?.user) setForm({ name: data.user.name, hourlyRate: data.user.hourlyRate, role: data.user.role });
  }, [data]);

  if (loading) return <Loading />;
  if (!data) return <ErrorAlert>{error}</ErrorAlert>;

  const { user, attendance, salaries } = data;
  const isMe = user._id === me?._id;
  const pending = salaries.filter((s) => s.status === "pending").reduce((a, s) => a + s.amount, 0);
  const totalHours = attendance.reduce((a, r) => a + (r.hours || 0), 0);
  const dirty = form && (form.name !== user.name || Number(form.hourlyRate) !== user.hourlyRate || form.role !== user.role);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await api.put(`/users/${id}`, form);
      toast("Changes saved");
      reload();
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const doConfirm = async () => {
    setBusy(true);
    try {
      if (confirm === "delete") {
        await api.delete(`/users/${id}`);
        toast(`${user.name} was removed`);
        navigate("/admin/employees");
        return;
      }
      const { data: d } = await api.post(`/users/${id}/reset-password`);
      setTemp(d.tempPassword);
      setConfirm(null);
    } catch (err) {
      toast(errorMessage(err), "error");
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link to="/admin/employees" className="btn btn-ghost btn-sm" style={{ marginBottom: 18 }}>
        <FiArrowLeft /> Employees
      </Link>

      <section className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="profile-hero" style={{ justifyContent: "space-between" }}>
          <div className="profile-hero">
            <Avatar user={user} size={80} />
            <div>
              <h2>{user.name}</h2>
              <p className="muted">{user.email}</p>
              <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Joined {fmtJoined(user.createdAt)}</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-ghost" onClick={() => setConfirm("reset")}>
              <FiKey /> Reset password
            </button>
            {!isMe && (
              <button className="btn btn-danger-ghost" onClick={() => setConfirm("delete")}>
                <FiTrash2 /> Delete
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="split">
        <section className="card">
          <div className="card-head">
            <h2>Shifts</h2>
            <span className="muted" style={{ fontSize: 13 }}>{fmtHours(totalHours)} in last {attendance.length}</span>
          </div>
          {attendance.length ? (
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
                  {attendance.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600 }}>{fmtDate(r.checkIn)}</td>
                      <td className="num">{fmtTime(r.checkIn)}</td>
                      <td className="num">{r.checkOut ? fmtTime(r.checkOut) : <span className="badge badge-green">Now</span>}</td>
                      <td className="num">{r.checkOut ? fmtHours(r.hours) : "—"}</td>
                      <td>
                        {mapsLink(r.checkInLocation) ? (
                          <a className="badge badge-blue" href={mapsLink(r.checkInLocation)} target="_blank" rel="noreferrer">
                            <FiMapPin /> Map
                          </a>
                        ) : (
                          <span className="muted" style={{ fontSize: 13 }}>{r.checkInLocation?.ip || "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty icon={FiClock} title="No shifts yet" />
          )}
        </section>

        <div className="stack">
          <section className="card card-pad">
            <div className="stat-label">Waiting to be paid</div>
            <div className="stat-value">{fmtMoney(pending)}</div>
            <Link to="/admin/payroll" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>Go to payroll</Link>
          </section>

          {form && (
            <form className="card card-pad" onSubmit={save}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Details</h2>
              <ErrorAlert>{saveError}</ErrorAlert>
              <div className="field">
                <label htmlFor="nm">Name</label>
                <input id="nm" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label htmlFor="hr">Hourly rate (KES)</label>
                <input id="hr" className="input" type="number" min="0" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} required />
                <span className="hint">Applies to shifts finished from now on</span>
              </div>
              <div className="field">
                <label htmlFor="rl">Role</label>
                <select id="rl" className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={isMe}>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="btn btn-primary" disabled={!dirty || saving}>
                {saving ? <Spinner small /> : <FiSave />} Save changes
              </button>
            </form>
          )}
        </div>
      </div>

      {confirm === "delete" && (
        <Confirm
          title={`Delete ${user.name}?`}
          message="Their account, shifts and pay history will be removed for good. This can't be undone."
          confirmLabel="Delete employee"
          danger
          busy={busy}
          onConfirm={doConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === "reset" && (
        <Confirm
          title="Reset password?"
          message={`${user.name}'s current password will stop working. You'll get a new temporary password to give them.`}
          confirmLabel="Reset password"
          busy={busy}
          onConfirm={doConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
      {temp && <TempPassword email={user.email} password={temp} onClose={() => setTemp(null)} />}
    </>
  );
}
