import React, { useEffect, useState } from 'react';

const API = "https://localhost:7162/api/lood";

export default function Lood() {
  const [lood, setLood] = useState([]);
  const [nimi, setNimi] = useState("");


  useEffect(() => load(), []);

  function load() {
    fetch(API).then(r => r.json()).then(setLood).catch(console.error);
  }

  // Convert MIDI number to note name
  function midiToName(midi) {
    const names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "B", "H"];
    const offset = midi - 60;
    const idx = ((offset % 12) + 12) % 12;
    return names[idx];
  }

  // Get notes for a chord
  function getChordNotes(pohitoon) {
    return [pohitoon, pohitoon + 4, pohitoon + 7];
  }

  // Format notes as note names
  function formatNotes(pohitoon) {
    const notes = getChordNotes(pohitoon);
    return notes.map(n => midiToName(n)).join(", ");
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
    const tahis = prompt("Sisesta takti akordi tähtnimetus (nt C, G, F) või MIDI number:", "C");
    if (!tahis) return;

    // Check if user entered a MIDI number
    let akordTahis = tahis;
    const num = parseInt(tahis);
    if (!isNaN(num) && num >= 60 && num <= 127) {
      akordTahis = midiToName(num);
    }

    const lugu = await (await fetch(`${API}/${luguId}`)).json();
    if (!lugu.taktid) lugu.taktid = [];
    const uusTakt = { Positsioon: lugu.taktid.length + 1, Kolmkola: { Tahis: akordTahis } };
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
                        <span className="chord-notes">
                          → {t.kolmkola?.pohitoon ? formatNotes(t.kolmkola.pohitoon) : ''}
                        </span>
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
