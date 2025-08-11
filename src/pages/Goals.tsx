import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Goals() {
  const [target, setTarget] = useState<number>(5000);
  const [saved, setSaved] = useState<number>(650);

  const pct = Math.min(100, Math.round((saved / target) * 100));

  return (
    <>
      <Helmet>
        <title>Цели за спестяване – Домова каса онлайн</title>
        <meta name="description" content="Задайте цели за спестяване (напр. асансьор) и следете прогреса." />
        <link rel="canonical" href="/goals" />
      </Helmet>

      <Card className="glass-surface max-w-2xl">
        <CardHeader>
          <CardTitle>Да съберем {target.toLocaleString("bg-BG")} лв. за асансьор</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Прогрес</span>
              <span className="font-medium">{saved.toLocaleString("bg-BG")} лв. / {target.toLocaleString("bg-BG")} лв. ({pct}%)</span>
            </div>
            <Progress value={pct} />
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

          <div>
            <Button variant="hero">Запази промени</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
