import React, { useState } from "react";

const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const blackNumbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];

const sectors = {
  "Vicini dello Zero": [22,18,29,7,28,12,35,3,26,0,32,15,19,4,21,2,25],
  "Tier": [27,13,36,11,30,8,23,10,5,24,16,33],
  "Orfanelli": [17,34,6,1,20,14,31,9],
  "Zero Spiel": [12,35,3,26,0,32,15]
};

export default function Home() {
  const [numberString, setNumberString] = useState("");
  const [numbers, setNumbers] = useState([]);
  const [suggestion, setSuggestion] = useState({});
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    color: { win: 0, loss: 0 },
    parity: { win: 0, loss: 0 },
    range: { win: 0, loss: 0 },
    sector: { win: 0, loss: 0 }
  });
  const [initialized, setInitialized] = useState(false);

  const resetAll = () => {
    setNumberString("");
    setNumbers([]);
    setSuggestion({});
    setHistory([]);
    setStats({
      color: { win: 0, loss: 0 },
      parity: { win: 0, loss: 0 },
      range: { win: 0, loss: 0 },
      sector: { win: 0, loss: 0 }
    });
    setInitialized(false);
  };

  const parseInputNumbers = () => {
    const clean = numberString.replace(/[^0-9, ]/g, "");
    const numList = clean.split(/[ ,]+/).map(n => parseInt(n)).filter(n => !isNaN(n) && n >= 0 && n <= 36);
    const trimmed = numList.slice(0, 40);
    setNumbers(trimmed);
    setInitialized(true);
    if (trimmed.length >= 5) generateSuggestion(trimmed);
  };

  const getSector = (num) => {
    for (const [name, list] of Object.entries(sectors)) {
      if (list.includes(num)) return name;
    }
    return "Altro";
  };

  const generateSuggestion = (numList) => {
    const counts = {};
    const delays = {};
    const seen = new Set();
    let colorCount = { Rosso: 0, Nero: 0, Verde: 0 };
    let parityCount = { Pari: 0, Dispari: 0 };
    let rangeCount = { Basso: 0, Alto: 0 };
    let sectorCount = { "Vicini dello Zero": 0, "Tier": 0, "Orfanelli": 0, "Zero Spiel": 0 };

    numList.forEach((num, index) => {
      counts[num] = (counts[num] || 0) + 1;
      if (!seen.has(num)) delays[num] = index;
      seen.add(num);

      if (redNumbers.includes(num)) colorCount.Rosso++;
      else if (blackNumbers.includes(num)) colorCount.Nero++;
      else colorCount.Verde++;

      if (num !== 0) {
        if (num % 2 === 0) parityCount.Pari++; else parityCount.Dispari++;
        if (num <= 18) rangeCount.Basso++; else rangeCount.Alto++;
      }

      const sector = getSector(num);
      if (sector in sectorCount) sectorCount[sector]++;
    });

    const hottest = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const coldest = Object.entries(delays).sort((a, b) => b[1] - a[1])[0][0];

    const color = colorCount.Rosso < colorCount.Nero ? "Rosso" : "Nero";
    const parity = parityCount.Pari < parityCount.Dispari ? "Pari" : "Dispari";
    const range = rangeCount.Basso < rangeCount.Alto ? "1-18" : "19-36";
    const sector = Object.entries(sectorCount).sort((a, b) => a[1] - b[1])[0][0];

    setSuggestion({ color, parity, range, hottest, coldest, sector });
  };

  const handleNewNumber = () => {
    const newNumber = parseInt(prompt("Inserisci il nuovo numero:"));
    if (isNaN(newNumber) || newNumber < 0 || newNumber > 36) return;

    const updatedNumbers = [newNumber, ...numbers].slice(0, 40);

    const check = {
      color: redNumbers.includes(newNumber) ? "Rosso" : blackNumbers.includes(newNumber) ? "Nero" : "Verde",
      parity: newNumber === 0 ? "Neutro" : newNumber % 2 === 0 ? "Pari" : "Dispari",
      range: newNumber === 0 ? "Neutro" : newNumber <= 18 ? "1-18" : "19-36",
      sector: getSector(newNumber)
    };

    const res = { ...stats };
    if (check.color === suggestion.color) res.color.win++; else res.color.loss++;
    if (check.parity === suggestion.parity) res.parity.win++; else res.parity.loss++;
    if (check.range === suggestion.range) res.range.win++; else res.range.loss++;
    if (check.sector === suggestion.sector) res.sector.win++; else res.sector.loss++;

    setStats(res);
    setNumbers(updatedNumbers);
    setHistory([{ num: newNumber, ...check }, ...history]);
    generateSuggestion(updatedNumbers);
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h2>🎯 Previsione Roulette Intelligente</h2>
      {!initialized && (
        <>
          <textarea
            rows={3}
            placeholder="Inserisci 40 numeri separati da spazio o virgola"
            value={numberString}
            onChange={(e) => setNumberString(e.target.value)}
            style={{ width: "100%", marginTop: 10 }}
          />
          <button onClick={parseInputNumbers}>Carica Numeri</button>
        </>
      )}
      {initialized && (
        <>
          <button onClick={handleNewNumber}>Aggiungi Nuovo Numero</button>
          <button onClick={resetAll} style={{ marginLeft: 10, background: "#f55", color: "white" }}>Resetta Tutto</button>
        </>
      )}
      {numbers.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Prossima previsione suggerita:</h3>
          <ul>
            <li>🎨 Colore: {suggestion.color}</li>
            <li>⚖️ Pari/Dispari: {suggestion.parity}</li>
            <li>🔺 Range: {suggestion.range}</li>
            <li>🔥 Numero Caldo: {suggestion.hottest}</li>
            <li>❄️ Numero Freddo: {suggestion.coldest}</li>
            <li>🎯 Settore: {suggestion.sector}</li>
          </ul>

          <h3>Statistiche Win/Loss</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr><th>Tipo</th><th>Win</th><th>Loss</th></tr>
            </thead>
            <tbody>
              <tr><td>Colore</td><td>{stats.color.win}</td><td>{stats.color.loss}</td></tr>
              <tr><td>Pari/Dispari</td><td>{stats.parity.win}</td><td>{stats.parity.loss}</td></tr>
              <tr><td>Range</td><td>{stats.range.win}</td><td>{stats.range.loss}</td></tr>
              <tr><td>Settore</td><td>{stats.sector.win}</td><td>{stats.sector.loss}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}