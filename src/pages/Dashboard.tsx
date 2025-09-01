import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, PieChart as RPieChart, Cell, Tooltip as RTooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const COLORS = ["hsl(var(--accent-1))", "hsl(var(--accent-2))", "hsl(var(--accent-3))", "hsl(var(--primary))"]; 

type Expense = { id: string; amount: number; incurred_at: string; category_id: string | null };
type Category = { id: string; name: string };

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const currentKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [{ data: exps, error: eErr }, { data: cats, error: catErr }] = await Promise.all([
          supabase.from("expenses").select("id,amount,incurred_at,category_id").gte("incurred_at", `${currentKey}-01`),
          supabase.from("expense_categories").select("id,name"),
        ]);
        if (eErr) throw eErr; if (catErr) throw catErr;
        setExpenses(exps || []);
        setCategories(cats || []);
      } catch (e: any) {
        toast({ title: "Грешка", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentKey]);

  const currentExpense = useMemo(() => {
    return expenses.filter((x) => x.incurred_at.startsWith(currentKey))
      .reduce((sum, x) => sum + Number(x.amount), 0);
  }, [expenses, currentKey]);

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
        <meta name="description" content="Обобщение на разходите: какво количество пари се харчи и за какво." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <div className="grid gap-4 md:grid-cols-1 max-w-md">
        <StatCard title="Месечни разходи" value={`${currentExpense.toFixed(2)} лв.`} trend="" />
      </div>

      <div className="mt-6 max-w-2xl">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>За какво се харчат парите (текущ месец)</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip />
                  <Legend />
                </RPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Няма данни за разходи този месец
              </div>
            )}
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