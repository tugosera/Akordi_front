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

  // Convert MIDI number to note name
  function midiToName(midi) {
    const names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "B", "H"];
    const offset = midi - 60;
    const idx = ((offset % 12) + 12) % 12;
    return names[idx];
  }

  // Get chord notes
  function getChordNotes(pohitoon) {
    return [pohitoon, pohitoon + 4, pohitoon + 7];
  }

  // Format chord notes as letters
  function getChordNoteNames(pohitoon) {
    return getChordNotes(pohitoon).map(n => midiToName(n));
  }

  // Handle input for Tähtnimetus - convert number to letter if needed
  function handleTahisChange(value) {
    // Check if the input is a number
    const num = parseInt(value);
    if (!isNaN(num) && num >= 60 && num <= 127) {
      // Convert MIDI number to note letter
      setUueTahis(midiToName(num));
      setUuePohitoon(value);
    } else {
      setUueTahis(value);
    }
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
    const uusTahis = prompt("Sisesta uus tähtnimetus (nt C, G) või MIDI number:");
    const uusPohitoon = prompt("Sisesta uus põhitoon (MIDI number):");
    if (uusTahis == null && uusPohitoon == null) return;
    const body = {};

    // If user entered a number in Tahis field, convert it to note letter
    if (uusTahis) {
      const num = parseInt(uusTahis);
      if (!isNaN(num) && num >= 60 && num <= 127) {
        body.Tahis = midiToName(num);
        if (!uusPohitoon) body.Pohitoon = num;
      } else {
        body.Tahis = uusTahis;
      }
    }

    if (uusPohitoon) body.Pohitoon = parseInt(uusPohitoon);
    fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(() => fetchAll());
  }


  return (
    <div className="kolmkolad-section">
      <h2>Kolmkõlad</h2>

      <div className="input-group">
        <input
          placeholder="Tähtnimetus (nt C) või MIDI nr"
          value={uueTahis}
          onChange={e => handleTahisChange(e.target.value)}
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
            <th>Noodid (arvud)</th>
            <th>Noodid (nimed)</th>
            <th>Toimingud</th>
          </tr>
        </thead>
        <tbody>
          {kolmkolad.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-state">
                <span className="empty-icon">♪</span>
                <span>Kolmkõlasid pole veel lisatud</span>
              </td>
            </tr>
          ) : (
            kolmkolad.map(k => (
              <tr key={k.id}>
                <td className="text-muted">{k.id}</td>
                <td>{k.tahis}</td>
                <td>{k.pohitoon}</td>
                <td className="notes-display">
                  {JSON.stringify(getChordNotes(k.pohitoon))}
                </td>
                <td className="notes-display">
                  {getChordNoteNames(k.pohitoon).join(", ")}
                </td>
                <td className="action-buttons">
                  <button onClick={() => muuda(k.id)} className="btn-secondary">
                    Muuda
                  </button>
                  <button onClick={() => kustuta(k.id)} className="btn-danger">
                    Kustuta
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
