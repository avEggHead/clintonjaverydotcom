import React, { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';

// Define the effort dimensions
const dimensions = [
  'Complexity',
  'NewCode',
  'Testing',
  'Coordination',
  'Research',
] as const;

type Dimension = typeof dimensions[number];
type EffortValues = Record<Dimension, number>;

// Fibonacci helper
function getNearestFibonacci(n: number): number {
  const fib = [0, 1];
  while (fib[fib.length - 1] < n) {
    fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
  }
  return fib.find(f => f >= n) || n;
}

export default function EffortSlider() {
  const initialState: EffortValues = dimensions.reduce((acc, dim) => {
    acc[dim] = 0;
    return acc;
  }, {} as EffortValues);

  const [values, setValues] = useState<EffortValues>(initialState);
  const MAX_SLIDER = 8;

  // 1. Normalize all sliders to 0–1
  const normalizedEffort = Object.values(values).reduce((sum, val) => {
    const normalized = val / MAX_SLIDER;
    return sum + normalized;
  }, 0);
  
  // 2. Apply non-linear scaling (square root slows things down nicely)
  const dampenedEffort = Math.sqrt(normalizedEffort) * 4.5; // ← you can tweak this multiplier
  
  // 3. Round up to nearest Fibonacci
  const fibEffort = getNearestFibonacci(Math.ceil(dampenedEffort));
  
  const handleChange = (dim: Dimension, val: number) => {
    setValues(prev => ({ ...prev, [dim]: val }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
<h2>Effort Estimate: {fibEffort}</h2>
<div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {dimensions.map(dim => (
          <div
            key={dim}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '200px',
              width: '50px',
            }}
          >
<Slider.Root
  orientation="vertical"
  min={0}
  max={8}
  step={0.05}
  value={[values[dim]]}
  onValueChange={([val]) => handleChange(dim, val)}
  style={{
    height: '150px',
    width: '40px',                 // wider for the thumb
    display: 'flex',
    flexDirection: 'column-reverse', // 👈 key to making vertical orientation behave
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }}
>

<Slider.Track
  style={{
    backgroundColor: 'lightgrey',    // Full track color
    flexGrow: 1,
    position: 'relative',
    width: '12px',                   // Makes the vertical track THICK
    border: '1px solid blue',     // 👈 Debug aid
    borderRadius: '6px',
    overflow: 'hidden',
    paddingBottom: '10px'
  }}
>
  <Slider.Range
    style={{
      backgroundColor: 'lightgrey',     // The filled part color
      position: 'absolute',
      width: '100%',                 // required for vertical
      borderRadius: '6px',
    }}
  />
</Slider.Track>


              <Slider.Thumb
                style={{
                  width: '500px',
                  height: '10px',
                  backgroundColor: '#297f39',
                  border: '20px solid rgb(170, 0, 255)', // ✅ Fixed spacing
                  borderRadius: '800px',
                  boxShadow: '0 2px 6px rgba(132, 0, 255, 0.3)',
                  cursor: 'grab',
                  transition: 'background-color 0.2s ease, transform 0.2s ease',
                }}
              />
            </Slider.Root>
            {/* <div style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>{values[dim]}</div> */}
            <div style={{color: 'white'}}>space</div>
            <label style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>{dim}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
