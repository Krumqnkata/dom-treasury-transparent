import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pie, PieChart as RPieChart, Cell, Tooltip as RTooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { bg } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addMonths, subMonths, startOfDay } from "date-fns";

const COLORS = ["hsl(var(--accent-1))", "hsl(var(--accent-2))", "hsl(var(--accent-3))", "hsl(var(--primary))"]; 

type Expense = { id: string; amount: number; incurred_at: string; category_id: string | null };
type Category = { id: string; name: string };
type Goal = { id: string; title: string; target_amount: number; saved_amount: number };

export default function Dashboard() {
  const formatAmount = (amount: number) => `${amount.toFixed(2)} лв.`;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictedExpense, setPredictedExpense] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: startOfMonth(today),
      to: endOfMonth(today)
    };
  });

  useEffect(() => {
    const load = async () => {
      if (!dateRange?.from || !dateRange?.to) return;
      
      try {
        setLoading(true);
        
        // Calculate dates for prediction (last 3 months excluding current month)
        const today = new Date();
        const threeMonthsAgo = subMonths(startOfMonth(today), 3);
        const lastMonth = subMonths(startOfMonth(today), 1);
        
        const [{ data: exps, error: eErr }, { data: cats, error: catErr }, { data: goalData, error: goalErr }, { data: historicalExps, error: histErr }] = await Promise.all([
          supabase.from("expenses").select("id,amount,incurred_at,category_id")
            .gte("incurred_at", dateRange.from.toISOString().split('T')[0])
            .lte("incurred_at", dateRange.to.toISOString().split('T')[0]),
          supabase.from("expense_categories").select("id,name"),
          supabase.from("goals").select("id,title,target_amount,saved_amount"),
          supabase.from("expenses").select("amount,incurred_at")
            .gte("incurred_at", threeMonthsAgo.toISOString().split('T')[0])
            .lt("incurred_at", startOfMonth(today).toISOString().split('T')[0]),
        ]);
        
        if (eErr) throw eErr; if (catErr) throw catErr; if (goalErr) throw goalErr; if (histErr) throw histErr;
        
        setExpenses(exps || []);
        setCategories(cats || []);
        setGoals(goalData || []);
        
        // Calculate predicted expense based on last 3 months average
        if (historicalExps && historicalExps.length > 0) {
          const totalHistorical = historicalExps.reduce((sum, exp) => sum + Number(exp.amount), 0);
          const monthsCount = 3; // We're looking at 3 months
          const avgMonthlyExpense = totalHistorical / monthsCount;
          setPredictedExpense(avgMonthlyExpense);
        } else {
          setPredictedExpense(0);
        }
        
      } catch (e: any) {
        toast({ title: "Грешка", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateRange]);

  const currentExpense = useMemo(() => {
    return expenses.reduce((sum, x) => sum + Number(x.amount), 0);
  }, [expenses]);

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    const nameById: Record<string, string> = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    expenses.forEach((x) => {
      const key = x.category_id ? nameById[x.category_id] || "Други" : "Други";
      map[key] = (map[key] || 0) + Number(x.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses, categories]);

  return (
    <>
      <Helmet>
        <title>Табло – Домова каса онлайн</title>
        <meta name="description" content="Обобщение на разходите: какво количество пари се харчи и за какво." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      {/* Period selector */}
      <div className="flex justify-center mb-8">
        <DateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 w-full max-w-4xl mx-auto px-4">
        <StatCard 
          title="Разходи за периода" 
          value={`${formatAmount(currentExpense)}`} 
          trend={dateRange?.from && dateRange?.to ? 
            `${format(dateRange.from, "dd.MM", { locale: bg })} - ${format(dateRange.to, "dd.MM", { locale: bg })}` : 
            ""
          } 
        />
        <StatCard 
          title="Предсказан разход" 
          value={`${formatAmount(predictedExpense)}`} 
          trend={predictedExpense > 0 ? "Базиран на последните 3 месеца" : "Няма достатъчно данни"} 
        />
      </div>

      {/* Goals Section */}
      <div className="mt-8 w-full max-w-4xl mx-auto px-4">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>Цели за спестяване</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progress = goal.target_amount > 0 ? (goal.saved_amount / goal.target_amount) * 100 : 0;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatAmount(goal.saved_amount)} / {formatAmount(goal.target_amount)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      {progress.toFixed(1)}% завършено
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Няма добавени цели за спестяване
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 w-full max-w-4xl mx-auto px-4">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              За какво се харчат парите
              {dateRange?.from && dateRange?.to && (
                <span className="block text-sm text-muted-foreground mt-1">
                  {format(dateRange.from, "dd.MM.yyyy", { locale: bg })} - {format(dateRange.to, "dd.MM.yyyy", { locale: bg })}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 sm:h-96">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    outerRadius="80%" 
                    innerRadius="20%"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip formatter={(value) => `${Number(value).toFixed(2)} лв.`} />
                  <Legend wrapperStyle={{ fontSize: '14px' }} />
                </RPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Няма данни за разходи за избрания период
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
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl sm:text-3xl font-semibold leading-tight">{value}</div>
        {trend && <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{trend}</div>}
      </CardContent>
    </Card>
  );
}