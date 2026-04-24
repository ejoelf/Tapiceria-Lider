import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "./DashboardCharts.css";

const COLORS = [
  "#111111",
  "#444444",
  "#777777",
  "#999999",
  "#c2c2c2",
  "#d9d9d9",
  "#e6e6e6",
];

function DashboardPieChart({ data = [], dataKey = "value", nameKey = "name", small = false }) {
  if (!data.length) {
    return <div className="dashboard-chart__empty">Sin datos para mostrar</div>;
  }

  return (
    <div className={`dashboard-chart ${small ? "dashboard-chart--small" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={small ? 80 : 100}
            innerRadius={small ? 40 : 54}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${entry[nameKey]}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardPieChart;