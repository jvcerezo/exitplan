"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TrafficPoint = {
  label: string;
  signups: number;
  activeUsers: number;
  transactions: number;
};

type ProvisioningPoint = {
  label: string;
  accounts: number;
  goals: number;
  budgets: number;
};

type HealthPoint = {
  metric: string;
  value: number;
};

interface AdminOverviewChartsProps {
  trafficData: TrafficPoint[];
  provisioningData: ProvisioningPoint[];
  healthData: HealthPoint[];
}

function NumberTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <p
            key={`${entry.dataKey}-${entry.name}`}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value ?? 0}
          </p>
        ))}
      </div>
    </div>
  );
}

function PercentTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: HealthPoint;
    value?: number;
    color?: string;
  }>;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0];
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
      <p className="text-sm font-medium">{item.payload?.metric}</p>
      <p className="text-sm" style={{ color: item.color }}>
        {Math.round(item.value ?? 0)}%
      </p>
    </div>
  );
}

function formatPercentTick(value: number) {
  return `${value}%`;
}

export function AdminOverviewCharts({
  trafficData,
  provisioningData,
  healthData,
}: AdminOverviewChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Traffic & Activity · 14d</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip content={<NumberTooltip />} />
                <Legend />
                <Bar
                  yAxisId="right"
                  dataKey="transactions"
                  name="Transactions"
                  fill="#64748b"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="signups"
                  name="Signups"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="activeUsers"
                  name="Active Users"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Provisioning Events · 14d</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provisioningData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip content={<NumberTooltip />} />
                <Legend />
                <Bar dataKey="accounts" name="Accounts" fill="#0f766e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="goals" name="Goals" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="budgets" name="Budgets" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Service Level Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthData} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={formatPercentTick}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="metric"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={140}
                />
                <Tooltip content={<PercentTooltip />} />
                <Bar dataKey="value" name="Score" fill="#16a34a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
