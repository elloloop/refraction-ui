"use client";

import { Chart, Bars, XAxis, YAxis } from '@refraction-ui/react-charts';

export function ChartsExamples() {
  const data = [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 120 },
    { label: 'Apr', value: 200 },
  ];

  return (
    <div className="border border-border rounded-lg p-6 flex justify-center bg-card">
      <Chart width={500} height={300} margin={{ left: 50, bottom: 40, right: 20, top: 20 }}>
        <Bars data={data} x={(d) => d.label} y={(d) => d.value} fill="#3b82f6" />
        <XAxis
          ticks={data.map((d) => d.label)}
          scale={(val) => {
            const index = data.findIndex(d => d.label === val);
            const step = 430 / data.length;
            return (index * step) + (step / 2);
          }}
          height={240}
        />
        <YAxis
          ticks={[0, 50, 100, 150, 200]}
          scale={(val) => 240 - ((val as number) / 200) * 240}
        />
      </Chart>
    </div>
  );
}
