import { useEffect, useMemo, useState } from "react";
import { FiExternalLink, FiMapPin } from "react-icons/fi";
import useFetch from "../../useFetch";
import { Empty, ErrorAlert, Loading, PageHead, Person } from "../../components/ui";
import { fmtDateTime, mapsLink } from "../../format";

const embedUrl = ({ lat, lng }) => {
  const d = 0.006;
  const bbox = [lng - d, lat - d, lng + d, lat + d].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
};

export default function Locations() {
  const { data, error, loading } = useFetch("/attendance");
  const [selected, setSelected] = useState(null);

  // Each person's latest check-in that has a GPS position, plus all with positions
  const points = useMemo(
    () => (data || []).filter((r) => r.checkInLocation?.lat != null).slice(0, 100),
    [data]
  );

  useEffect(() => {
    if (!selected && points.length) setSelected(points[0]);
  }, [points, selected]);

  if (loading) return <Loading />;

  return (
    <>
      <PageHead title="Locations" sub="Where people were when they checked in." />
      <ErrorAlert>{error}</ErrorAlert>

      {points.length ? (
        <div className="split" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.3fr)" }}>
          <section className="card">
            <div className="card-head">
              <h2>Check-ins</h2>
              <span className="muted" style={{ fontSize: 13 }}>{points.length} with GPS</span>
            </div>
            <ul className="rows" style={{ maxHeight: 520, overflowY: "auto" }}>
              {points.map((r) => (
                <li
                  key={r._id}
                  onClick={() => setSelected(r)}
                  style={{ cursor: "pointer", background: selected?._id === r._id ? "var(--accent-soft)" : undefined }}
                >
                  <Person user={r.user} sub={fmtDateTime(r.checkIn)} />
                  {!r.checkOut && <span className="badge badge-green">Now</span>}
                </li>
              ))}
            </ul>
          </section>

          {selected && (
            <section className="card" style={{ position: "sticky", top: 20 }}>
              <div className="card-head">
                <div>
                  <h2>{selected.user.name}</h2>
                  <span className="muted num" style={{ fontSize: 13 }}>
                    {selected.checkInLocation.lat.toFixed(5)}, {selected.checkInLocation.lng.toFixed(5)}
                    {selected.checkInLocation.accuracy ? ` · ±${selected.checkInLocation.accuracy} m` : ""}
                  </span>
                </div>
                <a className="btn btn-ghost btn-sm" href={mapsLink(selected.checkInLocation)} target="_blank" rel="noreferrer">
                  Open in Maps <FiExternalLink />
                </a>
              </div>
              <iframe key={selected._id} className="map" title={`Map of ${selected.user.name}'s check-in`} src={embedUrl(selected.checkInLocation)} loading="lazy" />
            </section>
          )}
        </div>
      ) : (
        <section className="card">
          <Empty icon={FiMapPin} title="No locations yet">
            When employees allow location access while checking in, their position shows up here.
          </Empty>
        </section>
      )}
    </>
  );
}
