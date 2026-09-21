import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { currency } from '@/lib/utils';
export default function FinanceChart({ months }: { months: any[] }) {
  return (
    <div className="finance-chart" aria-label="Comparación mensual de cobros y gastos">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={months} barGap={5}>
          <CartesianGrid vertical={false} stroke="#eceef0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            tickFormatter={(v) => `${Number(v) / 1000}k`}
            tickLine={false}
            axisLine={false}
            fontSize={10}
          />
          <Tooltip
            formatter={(v: any) => currency(v)}
            contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar name="Cobros" dataKey="income" fill="#262d31" radius={[3, 3, 0, 0]} />
          <Bar name="Gastos" dataKey="expense" fill="#c3b3a1" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
