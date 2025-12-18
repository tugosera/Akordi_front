import React, { useEffect, useState } from 'react';

const API = "https://localhost:7162/api/kolmkolad";

export default function Kolmkolad() {
  const [kolmkolad, setKolmkolad] = useState([]);
  const [uueTahis, setUueTahis] = useState("");
  const [uuePohitoon, setUuePohitoon] = useState("");

  useEffect(() => fetchAll(), []);

  function fetchAll() {
    fetch(API).then(r => r.json()).then(setKolmkolad).catch(console.error);
  }

  function lisa() {
    const body = {};
    if (uueTahis) body.Tahis = uueTahis;
    if (uuePohitoon) body.Pohitoon = parseInt(uuePohitoon);
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(() => { setUueTahis(""); setUuePohitoon(""); fetchAll(); });
  }

  function kustuta(id) {
    if (!window.confirm("Kas kustutada see kolmkõla?")) return;
    fetch(`${API}/${id}`, { method: 'DELETE' }).then(() => fetchAll());
  }

  function muuda(id) {
    const uusTahis = prompt("Sisesta uus tähtnimetus (nt C, G):");
    const uusPohitoon = prompt("Sisesta uus põhitoon (MIDI number):");
    if (uusTahis == null && uusPohitoon == null) return;
    const body = {};
    if (uusTahis) body.Tahis = uusTahis;
    if (uusPohitoon) body.Pohitoon = parseInt(uusPohitoon);
    fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(() => fetchAll());
  }

  function showNoodid(id, formaad) {
    fetch(`${API}/${id}/noodid?formaat=${formaad}`).then(r => r.json()).then(d => {
      alert("Noodid:\n" + JSON.stringify(d));
    });
  }

  return (
    <div className="kolmkolad-section">
      <h2>Kolmkõlad</h2>

      <div className="input-group">
        <input
          placeholder="Tähtnimetus (nt C)"
          value={uueTahis}
          onChange={e => setUueTahis(e.target.value)}
        />
        <input
          placeholder="Põhitoon (MIDI nr)"
          value={uuePohitoon}
          onChange={e => setUuePohitoon(e.target.value)}
        />
        <button onClick={lisa} className="btn-primary">
          ✦ Lisa
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Täht</th>
            <th>Põhitoon</th>
            <th>Noodid</th>
            <th>Toimingud</th>
          </tr>
        </thead>
        <tbody>
          {kolmkolad.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-state">
                <span className="empty-icon">♪</span>
                <span>Kolmkõlasid pole veel lisatud</span>
              </td>
            </tr>
          ) : (
            kolmkolad.map(k => (
              <tr key={k.id}>
                <td className="text-muted">{k.id}</td>
                <td className="text-gold">{k.tahis}</td>
                <td>{k.pohitoon}</td>
                <td className="notes-display">
                  {JSON.stringify([k.pohitoon, k.pohitoon + 4, k.pohitoon + 7])}
                </td>
                <td className="action-buttons">
                  <button onClick={() => muuda(k.id)} className="btn-secondary">
                    Muuda
                  </button>
                  <button onClick={() => kustuta(k.id)} className="btn-danger">
                    Kustuta
                  </button>
                  <button onClick={() => showNoodid(k.id, 'nimed')} className="btn-secondary">
                    Näita
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
