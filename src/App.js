import React from 'react';
import './App.css';
import Kolmkolad from './components/Kolmkolad';
import Lood from './components/Lood';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Akordide Haldus</h1>
        <p className="app-subtitle">
          See rakendus võimaldab lisada, muuta ja kustutada kolmkõlasid ning luua lugusid.
        </p>
      </header>
      
      <main className="app-content">
        <section className="panel">
          <Kolmkolad />
        </section>
        <section className="panel">
          <Lood />
        </section>
      </main>
      
      <footer className="app-footer">
        <span className="footer-ornament">☽</span>
        <span>Muusika Haldussüsteem</span>
        <span className="footer-ornament">☾</span>
      </footer>
    </div>
  );
}

export default App;
