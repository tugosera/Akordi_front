import React, { useEffect, useState } from 'react';

const API = "https://localhost:7162/api/lood";

export default function Lood() {
  const [lood, setLood] = useState([]);
  const [nimi, setNimi] = useState("");

  useEffect(() => load(), []);

  function load() {
    fetch(API).then(r => r.json()).then(setLood).catch(console.error);
  }

  async function lisaLugu() {
    const lugu = { Nimetus: nimi, Taktid: [] };
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lugu)
    });
    setNimi("");
    load();
  }

  async function lisaTakt(luguId) {
    const tahis = prompt("Sisesta takti akordi tähtnimetus (nt C, G, F):", "C");
    if (!tahis) return;
    const lugu = await (await fetch(`${API}/${luguId}`)).json();
    if (!lugu.taktid) lugu.taktid = [];
    const uusTakt = { Positsioon: lugu.taktid.length + 1, Kolmkola: { Tahis: tahis } };
    lugu.taktid.push(uusTakt);
    await fetch(`${API}/${luguId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lugu)
    });
    load();
  }

  function kustutaLugu(id) {
    if (!window.confirm("Kas kustutada lugu?")) return;
    fetch(`${API}/${id}`, { method: 'DELETE' }).then(() => load());
  }

  function näitaNoodid(id, formaad) {
    fetch(`${API}/${id}/noodid?formaat=${formaad}`).then(r => r.json()).then(d => {
      alert(JSON.stringify(d));
    });
  }

  return (
    <div className="lood-section">
      <h2>Laulud</h2>

      <div className="input-group">
        <input
          placeholder="Loo nimetus"
          value={nimi}
          onChange={e => setNimi(e.target.value)}
        />
        <button onClick={lisaLugu} className="btn-primary">
          ✦ Lisa lugu
        </button>
      </div>

      <ul className="songs-list">
        {lood.length === 0 ? (
          <li className="empty-state">
            <span className="empty-icon">♫</span>
            <span>Lugusid pole veel lisatud</span>
          </li>
        ) : (
          lood.map(l => (
            <li key={l.id} className="song-item">
              <div className="song-header">
                <div className="song-title">
                  <strong>{l.nimetus}</strong>
                  <span className="song-id">Id: {l.id}</span>
                </div>
                <div className="song-actions">
                  <button onClick={() => lisaTakt(l.id)} className="btn-secondary">
                    + Takt
                  </button>
                  <button onClick={() => näitaNoodid(l.id, 'arv')} className="btn-secondary">
                    Arv
                  </button>
                  <button onClick={() => näitaNoodid(l.id, 'nimed')} className="btn-secondary">
                    Nimed
                  </button>
                  <button onClick={() => kustutaLugu(l.id)} className="btn-danger">
                    Kustuta
                  </button>
                </div>
              </div>

              {(l.taktid && l.taktid.length > 0) && (
                <div className="taktid-section">
                  <em className="taktid-label">Taktid:</em>
                  <ol className="taktid-list">
                    {l.taktid.map(t => (
                      <li key={t.id || Math.random()} className="takt-item">
                        <span className="chord-name">{t.kolmkola?.tahis}</span>
                        <span className="chord-tone">({t.kolmkola?.pohitoon})</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
