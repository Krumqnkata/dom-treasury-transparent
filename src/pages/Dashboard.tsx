import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { LineChart, Line, Pie, PieChart as RPieChart, Cell, Tooltip as RTooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useMemo } from "react";

const COLORS = ["hsl(var(--accent-1))", "hsl(var(--accent-2))", "hsl(var(--accent-3))", "hsl(var(--primary))"];

export default function Dashboard() {
  const expenseByCategory = useMemo(
    () => [
      { name: "Комунални", value: 680 },
      { name: "Почистване", value: 240 },
      { name: "Ремонти", value: 720 },
      { name: "Извънредни", value: 140 },
    ],
    []
  );

  const history = useMemo(
    () => [
      { month: "Ян", income: 2100, expense: 1600 },
      { month: "Фев", income: 2200, expense: 1500 },
      { month: "Мар", income: 2300, expense: 1720 },
      { month: "Апр", income: 2400, expense: 1780 },
    ],
    []
  );

  return (
    <>
      <Helmet>
        <title>Табло – Домова каса онлайн</title>
        <meta name="description" content="Обобщение: приходи, разходи, баланс, графики и история по месеци." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Събрани приходи" value="2 430 лв." trend="↑ 5%" />
        <StatCard title="Разходи" value="1 780 лв." trend="↓ 2%" />
        <StatCard title="Баланс" value="+650 лв." trend="↑" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>За какво се харчат парите</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" outerRadius={90}>
                  {expenseByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip />
                <Legend />
              </RPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>История по месеци</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="hsl(var(--accent-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="hsl(var(--accent-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <Card className="group perspective relative overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{trend}</div>
      </CardContent>
    </Card>
  );
}
