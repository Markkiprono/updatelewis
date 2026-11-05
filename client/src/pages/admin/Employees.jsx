import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUserPlus, FiUsers, FiCopy, FiChevronRight } from "react-icons/fi";
import api, { errorMessage } from "../../api";
import useFetch from "../../useFetch";
import { Empty, ErrorAlert, Loading, Modal, PageHead, Person, Spinner, useToast } from "../../components/ui";
import { fmtHours, fmtJoined, fmtMoney } from "../../format";

export function TempPassword({ email, password, onClose }) {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast("Password copied");
    } catch {
      toast("Couldn't copy. Select it and copy manually", "error");
    }
  };
  return (
    <Modal title="Share these login details" onClose={onClose}>
      <p className="muted" style={{ marginBottom: 16 }}>
        Give this temporary password to the employee. It's shown only once. They can change it on their Profile page.
      </p>
      <div className="field">
        <label>Email</label>
        <div className="secret" style={{ fontSize: 15 }}>{email}</div>
      </div>
      <div className="field">
        <label>Temporary password</label>
        <div className="secret">
          <span>{password}</span>
          <button className="btn btn-ghost btn-sm" onClick={copy}>
            <FiCopy /> Copy
          </button>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-primary" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}

function AddEmployee({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", hourlyRate: 100, role: "employee" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/users", form);
      onCreated(data);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title="Add employee" onClose={onClose}>
      <form onSubmit={submit}>
        <ErrorAlert>{error}</ErrorAlert>
        <div className="field">
          <label htmlFor="n">Full name</label>
          <input id="n" className="input" value={form.name} onChange={set("name")} required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="e">Email</label>
          <input id="e" className="input" type="email" value={form.email} onChange={set("email")} required />
        </div>
        <div className="grid grid-2" style={{ gap: 12 }}>
          <div className="field">
            <label htmlFor="r">Hourly rate (KES)</label>
            <input id="r" className="input" type="number" min="0" step="1" value={form.hourlyRate} onChange={set("hourlyRate")} required />
          </div>
          <div className="field">
            <label htmlFor="ro">Role</label>
            <select id="ro" className="select" value={form.role} onChange={set("role")}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 13 }}>A temporary password is created for them automatically.</p>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>
            {busy && <Spinner small />} Create account
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Employees() {
  const navigate = useNavigate();
  const { data, error, loading, reload } = useFetch("/users");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [created, setCreated] = useState(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data || []).filter((u) => !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }, [data, q]);

  if (loading) return <Loading />;

  return (
    <>
      <PageHead title="Employees" sub={`${data?.length || 0} people have access`}>
        <div className="search">
          <FiSearch />
          <input className="input" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search employees" />
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <FiUserPlus /> Add employee
        </button>
      </PageHead>
      <ErrorAlert>{error}</ErrorAlert>

      <section className="card">
        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Rate</th>
                  <th>Hours logged</th>
                  <th>Earned</th>
                  <th>Joined</th>
                  <th aria-label="Open" />
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u._id} className="clickable" onClick={() => navigate(`/admin/employees/${u._id}`)}>
                    <td>
                      <Person user={u} />
                    </td>
                    <td>
                      {u.onShiftSince ? (
                        <span className="badge badge-green"><span className="dot pulse" /> On shift</span>
                      ) : (
                        <span className="badge">Off</span>
                      )}
                      {u.role === "admin" && <span className="badge badge-blue" style={{ marginLeft: 6 }}>Admin</span>}
                    </td>
                    <td className="num">{fmtMoney(u.hourlyRate)}/h</td>
                    <td className="num">{fmtHours(u.totalHours)}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmtMoney(u.totalEarned)}</td>
                    <td className="muted">{fmtJoined(u.createdAt)}</td>
                    <td className="right muted"><FiChevronRight /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={FiUsers} title={q ? "No matches" : "No employees yet"}>
            {q ? "Try a different name or email." : "Add your first employee to get started."}
          </Empty>
        )}
      </section>

      {adding && (
        <AddEmployee
          onClose={() => setAdding(false)}
          onCreated={(d) => {
            setAdding(false);
            setCreated(d);
            reload();
          }}
        />
      )}
      {created && <TempPassword email={created.user.email} password={created.tempPassword} onClose={() => setCreated(null)} />}
    </>
  );
}
