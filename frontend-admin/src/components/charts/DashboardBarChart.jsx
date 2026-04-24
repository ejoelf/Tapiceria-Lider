import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./DashboardCharts.css";

const COLORS = [
  "#111111",
  "#444444",
  "#777777",
  "#999999",
  "#c2c2c2",
  "#d9d9d9",
];

function DashboardBarChart({
  data = [],
  dataKey = "value",
  xKey = "name",
  title = "",
  small = false,
  colorByIndex = false,
}) {
  if (!data.length) {
    return <div className="dashboard-chart__empty">Sin datos para mostrar</div>;
  }

  return (
    <div className={`dashboard-chart ${small ? "dashboard-chart--small" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          {title ? <Legend /> : null}
          <Bar dataKey={dataKey} name={title || dataKey} fill="#111111" radius={[8, 8, 0, 0]}>
            {colorByIndex
              ? data.map((entry, index) => (
                  <Cell key={`cell-${entry[xKey]}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))
              : null}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardBarChart;