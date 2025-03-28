import { useState } from "react";
import { DateTime } from "luxon";
import styles from "../styles/layout.module.css"; // or tools.module.css if you separate

const timeZones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney"
];

export default function TimeZoneConverter() {
  const [inputDateTime, setInputDateTime] = useState("");
  const [fromZone, setFromZone] = useState("UTC");
  const [toZone, setToZone] = useState("America/New_York");
  const [convertedTime, setConvertedTime] = useState("");

  const handleConvert = () => {
    if (!inputDateTime) return;
    const converted = DateTime.fromISO(inputDateTime, { zone: fromZone })
      .setZone(toZone)
      .toFormat("yyyy LLL dd, hh:mm a ZZZZ");
    setConvertedTime(converted);
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>🕰️ Time Zone Converter</h1>
      <div className={styles.formGroup}>
        <label>Date & Time:</label>
        <input
          type="datetime-local"
          value={inputDateTime}
          onChange={(e) => setInputDateTime(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>From Time Zone:</label>
        <select value={fromZone} onChange={(e) => setFromZone(e.target.value)}>
          {timeZones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>To Time Zone:</label>
        <select value={toZone} onChange={(e) => setToZone(e.target.value)}>
          {timeZones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <button className={styles.venmoButton} onClick={handleConvert}>
        Convert
      </button>

      {convertedTime && (
        <div className={styles.resultBox}>
          <p>
            If it's {inputDateTime} in  <strong>{fromZone}, </strong> 
            it is {convertedTime} in <strong>{toZone}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
