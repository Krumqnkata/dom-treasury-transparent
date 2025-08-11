import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, Pie, PieChart as RPieChart, Cell, Tooltip as RTooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const COLORS = ["hsl(var(--accent-1))", "hsl(var(--accent-2))", "hsl(var(--accent-3))", "hsl(var(--primary))"]; 

type Expense = { id: string; amount: number; incurred_at: string; category_id: string | null };
type Payment = { id: string; amount: number; period_month: string };
type Category = { id: string; name: string };

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Dashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  const months = useMemo(() => {
    const arr: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const label = d.toLocaleDateString("bg-BG", { month: "short" });
      arr.push({ key, label });
    }
    return arr;
  }, []);

  const startIso = `${months[0].key}-01`;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [{ data: pays, error: pErr }, { data: exps, error: eErr }, { data: cats, error: cErr }] = await Promise.all([
          supabase.from("payments").select("id,amount,period_month").gte("period_month", startIso),
          supabase.from("expenses").select("id,amount,incurred_at,category_id").gte("incurred_at", startIso),
          supabase.from("expense_categories").select("id,name"),
        ]);
        if (pErr) throw pErr; if (eErr) throw eErr; if (cErr) throw cErr;
        setPayments(pays || []);
        setExpenses(exps || []);
        setCategories(cats || []);
      } catch (e: any) {
        toast({ title: "Грешка", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [startIso]);

  const sumsByMonth = useMemo(() => {
    const income: Record<string, number> = {};
    const expense: Record<string, number> = {};
    months.forEach((m) => { income[m.key] = 0; expense[m.key] = 0; });
    payments.forEach((p) => { const k = p.period_month.slice(0, 7); if (k in income) income[k] += Number(p.amount); });
    expenses.forEach((x) => { const k = x.incurred_at.slice(0, 7); if (k in expense) expense[k] += Number(x.amount); });
    return months.map((m) => ({ month: m.label, income: income[m.key], expense: expense[m.key] }));
  }, [payments, expenses, months]);

  const currentKey = months[months.length - 1].key;
  const currentIncome = sumsByMonth[sumsByMonth.length - 1]?.income || 0;
  const currentExpense = sumsByMonth[sumsByMonth.length - 1]?.expense || 0;
  const balance = currentIncome - currentExpense;

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    const nameById: Record<string, string> = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    expenses.filter((x) => x.incurred_at.startsWith(currentKey)).forEach((x) => {
      const key = x.category_id ? nameById[x.category_id] || "Други" : "Други";
      map[key] = (map[key] || 0) + Number(x.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses, categories, currentKey]);

  return (
    <>
      <Helmet>
        <title>Табло – Домова каса онлайн</title>
        <meta name="description" content="Обобщение: приходи, разходи, баланс, графики и история по месеци." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Събрани приходи" value={`${currentIncome.toFixed(2)} лв.`} trend="" />
        <StatCard title="Разходи" value={`${currentExpense.toFixed(2)} лв.`} trend="" />
        <StatCard title="Баланс" value={`${balance >= 0 ? "+" : ""}${balance.toFixed(2)} лв.`} trend="" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>За какво се харчат парите (текущ месец)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                  {pieData.map((_, index) => (
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
              <LineChart data={sumsByMonth}>
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
