import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./DashboardCharts.css";

function DashboardLineChart({
  data = [],
  xKey = "name",
  firstLineKey = "ingresos",
  secondLineKey = "egresos",
  firstName = "Ingresos",
  secondName = "Egresos",
  small = false,
}) {
  if (!data.length) {
    return <div className="dashboard-chart__empty">Sin datos para mostrar</div>;
  }

  return (
    <div className={`dashboard-chart ${small ? "dashboard-chart--small" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={firstLineKey} name={firstName} stroke="#111111" strokeWidth={3} dot={{ r: 3 }} />
          <Line type="monotone" dataKey={secondLineKey} name={secondName} stroke="#888888" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardLineChart;