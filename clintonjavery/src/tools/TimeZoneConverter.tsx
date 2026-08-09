// Time Zone Converter — re-skinned to Tailwind v4 + @theme tokens (Epic 4 /
// Story 4.2). Behavior preserved from the v1 tool: parse a `datetime-local`
// value in a `fromZone`, shift to `toZone`, format `yyyy LLL dd, hh:mm a ZZZZ`.
// No CSS module, no own <h1> (the Project show page carries the title, one
// h1/page NFR-1). AD-6.
import { useState } from 'react';
import { DateTime } from 'luxon';
import { buttonPrimary, field } from '../site/buttons';

const timeZones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export default function TimeZoneConverter() {
  const [inputDateTime, setInputDateTime] = useState('');
  const [fromZone, setFromZone] = useState('UTC');
  const [toZone, setToZone] = useState('America/New_York');
  const [convertedTime, setConvertedTime] = useState('');

  const handleConvert = () => {
    if (!inputDateTime) return;
    const converted = DateTime.fromISO(inputDateTime, { zone: fromZone })
      .setZone(toZone)
      .toFormat('yyyy LLL dd, hh:mm a ZZZZ');
    setConvertedTime(converted);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tz-datetime" className="font-body text-body-sm font-semibold text-ink">
          Date &amp; time
        </label>
        <input
          id="tz-datetime"
          type="datetime-local"
          value={inputDateTime}
          onChange={(e) => setInputDateTime(e.target.value)}
          className={field}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tz-from" className="font-body text-body-sm font-semibold text-ink">
          From time zone
        </label>
        <select id="tz-from" value={fromZone} onChange={(e) => setFromZone(e.target.value)} className={field}>
          {timeZones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tz-to" className="font-body text-body-sm font-semibold text-ink">
          To time zone
        </label>
        <select id="tz-to" value={toZone} onChange={(e) => setToZone(e.target.value)} className={field}>
          {timeZones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <button type="button" onClick={handleConvert} className={buttonPrimary}>
        Convert
      </button>

      {convertedTime && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <p className="font-body text-body-md text-on-surface-variant">
            If it&rsquo;s {inputDateTime} in{' '}
            <strong className="text-ink">{fromZone}</strong>, it is{' '}
            <strong className="text-ink">{convertedTime}</strong> in{' '}
            <strong className="text-ink">{toZone}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}