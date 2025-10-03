import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { goalSchema } from "@/lib/validations";

interface Goal { id: string; title: string; target_amount: number; saved_amount: number }

export default function Goals() {
  const formatAmount = (amount: number) => `${amount.toFixed(2)} лв.`;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("Да съберем за асансьор");
  const [target, setTarget] = useState<number>(5000);
  const [saved, setSaved] = useState<number>(0);

  const pct = useMemo(() => (target ? Math.min(100, Math.round((saved / target) * 100)) : 0), [saved, target]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("id,title,target_amount,saved_amount")
        .order("created_at", { ascending: true });
      if (error) {
        toast({ title: "Грешка", description: error.message, variant: "destructive" });
        return;
      }
      setGoals((data || []) as any);
    };
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("Да съберем за асансьор");
    setTarget(5000);
    setSaved(0);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate input
      const validation = goalSchema.safeParse({ title, target, saved });
      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast({ title: "Невалидни данни", description: firstError.message, variant: "destructive" });
        return;
      }
      if (editingId) {
        const { data, error } = await supabase
          .from("goals")
          .update({ title, target_amount: target, saved_amount: saved })
          .eq("id", editingId)
          .select()
          .single();
        if (error) throw error;
        setGoals((prev) => prev.map((g) => (g.id === editingId ? (data as any) : g)));
        toast({ title: "Целта е обновена" });
        resetForm();
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({ title: "Грешка", description: "Не сте влезли в профила си", variant: "destructive" });
          return;
        }
        
        const { data, error } = await supabase
          .from("goals")
          .insert({ 
            user_id: user.id,
            title, 
            target_amount: target, 
            saved_amount: saved 
          })
          .select()
          .single();
        if (error) throw error;
        setGoals((prev) => [...prev, data as any]);
        toast({ title: "Добавена е нова цел" });
        resetForm();
      }
    } catch (e: any) {
      toast({ title: "Грешка", description: e.message, variant: "destructive" });
    }
  };

  const edit = (g: Goal) => {
    setEditingId(g.id);
    setTitle(g.title);
    setTarget(Number(g.target_amount));
    setSaved(Number(g.saved_amount));
  };

  const remove = async (g: Goal) => {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", g.id);
      if (error) throw error;
      setGoals((prev) => prev.filter((x) => x.id !== g.id));
      if (editingId === g.id) resetForm();
      toast({ title: "Целта е изтрита" });
    } catch (e: any) {
      toast({ title: "Грешка", description: e.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Цели за спестяване – Домова каса онлайн</title>
        <meta name="description" content="Добавяйте, редактирайте и следете цели за спестяване (напр. асансьор)." />
        <link rel="canonical" href="/goals" />
      </Helmet>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>{editingId ? "Редакция на цел" : "Нова цел"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form className="grid gap-4" onSubmit={submit}>
              <div className="grid gap-1">
                <label className="text-sm">Заглавие</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-sm">Целева сума (лв.)</label>
                  <Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value || 0))} />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Събрани до момента (лв.)</label>
                  <Input type="number" value={saved} onChange={(e) => setSaved(Number(e.target.value || 0))} />
                </div>
              </div>
              <div className="grid gap-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Прогрес</span>
                  <span className="font-medium">{formatAmount(saved)} / {formatAmount(target)} ({pct}%)</span>
                </div>
                <Progress value={pct} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="hero">{editingId ? "Запази промените" : "Добави цел"}</Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>Откажи</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>Всички цели</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {goals.length === 0 && (
              <div className="text-sm text-muted-foreground">Няма добавени цели.</div>
            )}
            <div className="grid gap-3">
              {goals.map((g) => {
                const p = g.target_amount ? Math.min(100, Math.round((Number(g.saved_amount) / Number(g.target_amount)) * 100)) : 0;
                return (
                  <div key={g.id} className="border rounded-md p-3 grid gap-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{g.title}</div>
                      <div className="font-semibold">{formatAmount(Number(g.saved_amount))} / {formatAmount(Number(g.target_amount))}</div>
                    </div>
                    <Progress value={p} />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => edit(g)}>Редактирай</Button>
                      <Button size="sm" variant="outline" onClick={() => remove(g)}>Изтрий</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
