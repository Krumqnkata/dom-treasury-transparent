import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";

type Apt = { id: string; name: string; fee: number; paid: boolean };

export default function Incomes() {
  const initial = useMemo<Apt[]>(
    () => [
      { id: "a1", name: "Ап. 1", fee: 35, paid: true },
      { id: "a2", name: "Ап. 2", fee: 35, paid: false },
      { id: "a3", name: "Ап. 3", fee: 45, paid: true },
      { id: "a4", name: "Ап. 4", fee: 40, paid: false },
    ],
    []
  );
  const [rows, setRows] = useState<Apt[]>(initial);

  const total = rows.reduce((s, r) => s + r.fee, 0);
  const collected = rows.filter((r) => r.paid).reduce((s, r) => s + r.fee, 0);
  const progress = Math.round((collected / total) * 100);

  return (
    <>
      <Helmet>
        <title>Приходи – Домова каса онлайн</title>
        <meta name="description" content="Въвеждане и проследяване на месечни такси по апартаменти." />
        <link rel="canonical" href="/incomes" />
      </Helmet>

      <Card className="glass-surface">
        <CardHeader>
          <CardTitle>Месечни такси</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Апартамент</th>
                  <th className="py-2">Такса</th>
                  <th className="py-2">Платено</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.name}</td>
                    <td className="py-2">{r.fee} лв.</td>
                    <td className="py-2">
                      <Checkbox
                        checked={r.paid}
                        onCheckedChange={(v) =>
                          setRows((prev) => prev.map((p) => (p.id === r.id ? { ...p, paid: Boolean(v) } : p)))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Събрано</span>
              <span className="font-medium">
                {collected} / {total} лв. ({progress}%)
              </span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
