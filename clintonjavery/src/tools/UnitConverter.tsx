// src/tools/UnitConverter.tsx
import { useState } from "react";
import styles from "../styles/UnitConverter.module.css";

type Unit = "m" | "ft" | "kg" | "lb" | "l" | "gal";

const conversions: Record<Unit, number> = {
  m: 1,
  ft: 0.3048,
  kg: 1,
  lb: 0.453592,
  l: 1,
  gal: 3.78541,
};

export default function UnitConverter() {
  const [value, setValue] = useState(0);
  const [from, setFrom] = useState<Unit>("m");
  const [to, setTo] = useState<Unit>("ft");
  const result = (value * conversions[from]) / conversions[to];

  return (
    <div className={styles.converter}>
      <input
        type="number"
        value={value}
        onChange={e => setValue(parseFloat(e.target.value))}
      />
      <select value={from} onChange={e => setFrom(e.target.value as Unit)}>
        {Object.keys(conversions).map(u => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <span>=</span>
      <select value={to} onChange={e => setTo(e.target.value as Unit)}>
        {Object.keys(conversions).map(u => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <span>{result.toFixed(4)}</span>
    </div>
  );
}