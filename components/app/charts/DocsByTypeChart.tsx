'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const TYPE_LABELS: Record<string, string> = {
  invoice: 'Facturas',
  receipt: 'Recibos',
  contract: 'Contratos',
  payslip: 'Nóminas',
  bank_statement: 'Extractos',
  other: 'Otros',
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']

interface Props {
  data: { type: string; count: number }[]
}

export function DocsByTypeChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sin datos este mes
      </div>
    )
  }

  const chartData = data.map(d => ({ ...d, name: TYPE_LABELS[d.type] ?? d.type }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} stroke="none">
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
