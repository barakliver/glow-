'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const AXIS = { stroke: '#ADB7B0', fontSize: 11 };
const GRID = '#2A2C26';

export function VolumeBarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} reversed />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={46} orientation="right" />
        <Tooltip
          cursor={{ fill: 'rgba(91,132,255,0.08)' }}
          contentStyle={{
            background: '#151A17',
            border: '1px solid #29322D',
            borderRadius: 12,
            color: '#F6F3EB',
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.value > 0 ? '#5B84FF' : '#2A2C26'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({
  data,
  /**
   * Fit the axis to the data instead of starting at zero.
   *
   * A body weight moving from 79 to 77 is a real change and a real month of
   * work, and on a 0-80 axis it is a flat line. Anything measured as a level
   * rather than a count wants this; a volume total does not.
   */
  fitToData = false,
}: {
  data: { label: string; value: number }[];
  fitToData?: boolean;
}) {
  const values = data.map((row) => row.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // A flat series would otherwise collapse to a zero-height domain.
  const pad = Math.max((max - min) * 0.25, 0.5);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          reversed
          minTickGap={24}
        />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={46}
          orientation="right"
          domain={
            fitToData && values.length > 0
              ? [Number((min - pad).toFixed(1)), Number((max + pad).toFixed(1))]
              : undefined
          }
          allowDecimals={fitToData}
        />
        <Tooltip
          contentStyle={{
            background: '#151A17',
            border: '1px solid #29322D',
            borderRadius: 12,
            color: '#F6F3EB',
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#5B84FF"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#5B84FF', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BalanceRadarChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="label" tick={{ fill: '#ADB7B0', fontSize: 11 }} />
        <Radar dataKey="value" stroke="#5B84FF" fill="#5B84FF" fillOpacity={0.25} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
