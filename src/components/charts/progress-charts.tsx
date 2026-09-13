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

export function TrendLineChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} reversed />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={46} orientation="right" />
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
