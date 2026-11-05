import { useState } from "react";
import { FiCamera, FiLock } from "react-icons/fi";
import api, { errorMessage } from "../api";
import { useAuth } from "../auth";
import { Avatar, ErrorAlert, PageHead, Spinner, useToast } from "../components/ui";
import { fmtJoined, fmtMoney } from "../format";

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState("");

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.put("/auth/avatar", form);
      setUser(data.user);
      toast("Photo updated");
    } catch (err) {
      setUploadError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pw.newPassword !== pw.confirm) return setPwError("The new passwords don't match");
    setPwBusy(true);
    try {
      await api.put("/auth/password", { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      toast("Password changed");
    } catch (err) {
      setPwError(errorMessage(err));
    } finally {
      setPwBusy(false);
    }
  };

  const set = (k) => (e) => setPw({ ...pw, [k]: e.target.value });

  return (
    <>
      <PageHead title="Profile" sub="Your photo, details and password." />
      <div className="grid grid-2">
        <section className="card card-pad">
          <div className="profile-hero" style={{ marginBottom: 24 }}>
            <div className="avatar-edit">
              <Avatar user={user} size={96} />
              <label title="Change photo">
                {uploading ? <Spinner small /> : <FiCamera />}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={upload} className="sr-only" disabled={uploading} />
              </label>
            </div>
            <div>
              <h2>{user?.name}</h2>
              <p className="muted">{user?.email}</p>
              <span className={`badge ${user?.role === "admin" ? "badge-blue" : "badge-green"}`} style={{ marginTop: 8, textTransform: "capitalize" }}>
                {user?.role}
              </span>
            </div>
          </div>
          <ErrorAlert>{uploadError}</ErrorAlert>
          <dl className="kv">
            <dt>Hourly rate</dt>
            <dd>{fmtMoney(user?.hourlyRate)}</dd>
            <dt>Member since</dt>
            <dd>{fmtJoined(user?.createdAt)}</dd>
            <dt>Employee ID</dt>
            <dd className="muted" style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 13 }}>{user?._id}</dd>
          </dl>
        </section>

        <section className="card card-pad">
          <h2 style={{ fontSize: 16, fontWeight: 700, display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <FiLock /> Change password
          </h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 18 }}>
            If your admin gave you a temporary password, change it here.
          </p>
          <form onSubmit={changePassword}>
            <ErrorAlert>{pwError}</ErrorAlert>
            <div className="field">
              <label htmlFor="cur">Current password</label>
              <input id="cur" className="input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={set("currentPassword")} required />
            </div>
            <div className="field">
              <label htmlFor="new">New password</label>
              <input id="new" className="input" type="password" autoComplete="new-password" minLength={6} value={pw.newPassword} onChange={set("newPassword")} required />
              <span className="hint">At least 6 characters</span>
            </div>
            <div className="field">
              <label htmlFor="conf">Confirm new password</label>
              <input id="conf" className="input" type="password" autoComplete="new-password" value={pw.confirm} onChange={set("confirm")} required />
            </div>
            <button className="btn btn-primary" disabled={pwBusy || !pw.currentPassword || pw.newPassword.length < 6}>
              {pwBusy && <Spinner small />} Update password
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
