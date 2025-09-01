import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart as PieIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";

const COLORS = ["hsl(var(--accent-1))", "hsl(var(--accent-2))", "hsl(var(--accent-3))", "hsl(var(--primary))"];

export default function Index() {
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      const currentDate = new Date();
      const currentMonthStart = startOfMonth(currentDate);
      const currentMonthEnd = endOfMonth(currentDate);

      // Fetch current month's expenses
      const { data: currentExpenses } = await supabase
        .from('expenses')
        .select('amount, category_id')
        .gte('incurred_at', currentMonthStart.toISOString().split('T')[0])
        .lte('incurred_at', currentMonthEnd.toISOString().split('T')[0]);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('expense_categories')
        .select('id, name');

      const totalExpenses = currentExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      setMonthlyExpenses(totalExpenses);

      // Set categories
      setCategories(categoriesData || []);

      // Calculate pie chart data
      if (currentExpenses && categoriesData) {
        const expensesByCategory: Record<string, number> = {};
        const nameById: Record<string, string> = Object.fromEntries(
          categoriesData.map((c) => [c.id, c.name])
        );
        
        currentExpenses.forEach((expense) => {
          const categoryName = expense.category_id ? nameById[expense.category_id] || "Други" : "Други";
          expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + Number(expense.amount);
        });

        const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
          name,
          value
        }));

        setPieData(pieChartData);
      }
    };

    fetchMonthlyData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Домова каса онлайн – Управление на домашните разходи</title>
        <meta 
          name="description" 
          content="Проследете разходите си лесно с нашето приложение за домашна касa. Визуализирайте къде отиват парите ви и планирайте бюджета си ефективно." 
        />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Домова каса онлайн",
            "description": "Приложение за управление на домашните разходи и проследяване къде се харчат парите",
            "url": "/",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "BGN"
            }
          })}
        </script>
      </Helmet>
      
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Домова каса онлайн
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Проследете разходите си лесно. Визуализирайте къде отиват парите ви и планирайте бюджета си ефективно.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link to="/dashboard">Преглед на таблото</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[200px]">
              <Link to="/expenses">Добави разход</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Месечни разходи</h2>
            <p className="text-muted-foreground">Обобщение на разходите за текущия месец</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card className="glass-surface">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Общо разходи</div>
                  <div className="text-3xl font-semibold text-accent-2">{monthlyExpenses.toFixed(2)} лв.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Expense breakdown section */}
      {pieData.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">За какво се харчат парите</h2>
              <p className="text-muted-foreground">Разбивка на разходите за текущия месец</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <Card className="glass-surface">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {pieData.map((item, index) => {
                      const percentage = monthlyExpenses > 0 ? (item.value / monthlyExpenses) * 100 : 0;
                      return (
                        <div key={item.name} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                            <span className="font-semibold">{item.value.toFixed(2)} лв.</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Общо разходи за месеца: <span className="font-semibold">{monthlyExpenses.toFixed(2)} лв.</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </>
  );
}