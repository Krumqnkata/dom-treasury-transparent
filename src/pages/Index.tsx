import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart as PieIcon, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export default function Index() {
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    previousMonthIncome: 0,
    changePercentage: 0
  });

  useEffect(() => {
    const fetchMonthlyData = async () => {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const prevMonth = subMonths(now, 1);
      const prevMonthStart = startOfMonth(prevMonth);
      const prevMonthEnd = endOfMonth(prevMonth);

      // Fetch current month's daily cash (income)
      const { data: currentIncome } = await supabase
        .from('daily_cash')
        .select('amount')
        .gte('date', currentMonthStart.toISOString().split('T')[0])
        .lte('date', currentMonthEnd.toISOString().split('T')[0]);

      // Fetch current month's expenses
      const { data: currentExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('incurred_at', currentMonthStart.toISOString().split('T')[0])
        .lte('incurred_at', currentMonthEnd.toISOString().split('T')[0]);

      // Fetch previous month's daily cash for comparison
      const { data: prevIncome } = await supabase
        .from('daily_cash')
        .select('amount')
        .gte('date', prevMonthStart.toISOString().split('T')[0])
        .lte('date', prevMonthEnd.toISOString().split('T')[0]);

      const totalIncome = currentIncome?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = currentExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalPrevIncome = prevIncome?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      const balance = totalIncome - totalExpenses;
      const changePercentage = totalPrevIncome > 0 
        ? ((totalIncome - totalPrevIncome) / totalPrevIncome) * 100 
        : 0;

      setMonthlyData({
        income: totalIncome,
        expenses: totalExpenses,
        balance,
        previousMonthIncome: totalPrevIncome,
        changePercentage
      });
    };

    fetchMonthlyData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Домова каса онлайн – Прозрачност и отчетност</title>
        <meta
          name="description"
          content="Управлявайте приходите и разходите на входа с прозрачност – табло, графики, цели за спестяване."
        />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Домова каса онлайн",
            url: "/",
            description:
              "Онлайн домова каса: приходи, разходи, графики и прозрачност за всички съсобственици.",
          })}
        </script>
      </Helmet>
      <section className="min-h-[78vh] flex items-center">
        <div className="w-full grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              <span className="text-gradient">Домова каса онлайн</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Заменете тетрадката с модерна, прозрачна система за такси, разходи
              и цели за спестяване. Всички виждат, всичко е ясно.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="hero">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Отвори таблото <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/expenses">Добави разход</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Вход за домоуправител</Link>
              </Button>
            </div>
          </div>
          <div>
            <Card className="glass-surface shadow-elegant animate-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon /> Месечен баланс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Приходи</div>
                    <div className="text-2xl font-semibold">{monthlyData.income.toFixed(0)} лв.</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Разходи</div>
                    <div className="text-2xl font-semibold">{monthlyData.expenses.toFixed(0)} лв.</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Баланс</div>
                    <div className="text-2xl font-semibold">
                      {monthlyData.balance >= 0 ? '+' : ''}{monthlyData.balance.toFixed(0)} лв.
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="size-4" /> 
                  {monthlyData.changePercentage >= 0 ? '+' : ''}
                  {monthlyData.changePercentage.toFixed(1)}% спрямо миналия месец
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
