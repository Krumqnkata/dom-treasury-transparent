import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Goal { id: string; title: string; target_amount: number; saved_amount: number }

export default function Goals() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState("Да съберем за асансьор");
  const [target, setTarget] = useState<number>(5000);
  const [saved, setSaved] = useState<number>(0);

  const pct = useMemo(() => (target ? Math.min(100, Math.round((saved / target) * 100)) : 0), [saved, target]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("id,title,target_amount,saved_amount")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        toast({ title: "Грешка", description: error.message, variant: "destructive" });
        return;
      }
      if (data) {
        setGoal(data as any);
        setTitle(data.title);
        setTarget(Number(data.target_amount));
        setSaved(Number(data.saved_amount));
      }
    };
    load();
  }, []);

  const save = async () => {
    try {
      if (goal) {
        const { data, error } = await supabase
          .from("goals")
          .update({ title, target_amount: target, saved_amount: saved })
          .eq("id", goal.id)
          .select()
          .single();
        if (error) throw error;
        setGoal(data as any);
      } else {
        const { data, error } = await supabase
          .from("goals")
          .insert({ title, target_amount: target, saved_amount: saved })
          .select()
          .single();
        if (error) throw error;
        setGoal(data as any);
      }
      toast({ title: "Запазено" });
    } catch (e: any) {
      toast({ title: "Грешка", description: e.message, variant: "destructive" });
    }
  };

  const remove = async () => {
    try {
      if (!goal) return;
      const { error } = await supabase.from("goals").delete().eq("id", goal.id);
      if (error) throw error;
      setGoal(null);
      setTitle("Да съберем за асансьор");
      setTarget(5000);
      setSaved(0);
      toast({ title: "Целта е изтрита" });
    } catch (e: any) {
      toast({ title: "Грешка", description: e.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Цели за спестяване – Домова каса онлайн</title>
        <meta name="description" content="Задайте цели за спестяване (напр. асансьор) и следете прогреса." />
        <link rel="canonical" href="/goals" />
      </Helmet>

      <Card className="glass-surface max-w-2xl">
        <CardHeader>
          <CardTitle>{title || "Цел"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Прогрес</span>
              <span className="font-medium">{saved.toLocaleString("bg-BG")} лв. / {target.toLocaleString("bg-BG")} лв. ({pct}%)</span>
            </div>
            <Progress value={pct} />
          </div>

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

          <div className="flex gap-2">
            <Button variant="hero" onClick={save}>Запази промени</Button>
            {goal && (
              <Button variant="outline" onClick={remove}>Изтрий целта</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
