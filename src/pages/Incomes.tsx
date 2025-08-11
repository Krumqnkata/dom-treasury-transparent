import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

 type Apt = { id: string; name: string; monthly_fee: number; active: boolean };
 type Payment = { id: string; apartment_id: string; amount: number };

 export default function Incomes() {
  const [apartments, setApartments] = useState<Apt[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment>>({});
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState<number>(35);
  const monthDate = useMemo(() => new Date(`${month}-01T00:00:00`), [month]);
  const monthISO = useMemo(() => `${month}-01`, [month]);

  useEffect(() => {
    const load = async () => {
      const { data: apts, error: aErr } = await supabase
        .from("apartments")
        .select("id,name,monthly_fee,active")
        .order("name");
      if (aErr) {
        toast({ title: "Грешка", description: aErr.message, variant: "destructive" });
        return;
      }
      setApartments(apts || []);

      const { data: pays, error: pErr } = await supabase
        .from("payments")
        .select("id,apartment_id,amount")
        .eq("period_month", monthISO);
      if (pErr) {
        toast({ title: "Грешка", description: pErr.message, variant: "destructive" });
        return;
      }
      const map: Record<string, Payment> = {};
      (pays || []).forEach((p) => (map[p.apartment_id] = p as any));
      setPayments(map);
    };
    load();
  }, [monthISO]);

  const total = apartments.reduce((s, r) => s + Number(r.monthly_fee || 0), 0);
  const collected = apartments.reduce((s, r) => s + (payments[r.id] ? Number(r.monthly_fee) : 0), 0);
  const progress = total ? Math.round((collected / total) * 100) : 0;

  const togglePaid = async (apt: Apt, next: boolean) => {
    try {
      if (next) {
        const { data, error } = await supabase
          .from("payments")
          .upsert(
            [
              {
                apartment_id: apt.id,
                period_month: monthISO,
                amount: apt.monthly_fee,
              },
            ],
            { onConflict: "apartment_id,period_month" }
          )
          .select()
          .maybeSingle();
        if (error) throw error;
        setPayments((prev) => ({ ...prev, [apt.id]: data as any }));
      } else {
        const { error } = await supabase
          .from("payments")
          .delete()
          .eq("apartment_id", apt.id)
          .eq("period_month", monthISO);
        if (error) throw error;
        setPayments((prev) => {
          const cp = { ...prev };
          delete cp[apt.id];
          return cp;
        });
      }
    } catch (e: any) {
      toast({ title: "Грешка", description: e.message, variant: "destructive" });
    }
  };

  const addApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("apartments")
        .insert({ name: newName, monthly_fee: newFee, active: true })
        .select()
        .single();
      if (error) throw error;
      setApartments((prev) => [...prev, data as any]);
      setNewName("");
      setNewFee(35);
      toast({ title: "Добавен апартамент", description: newName });
    } catch (e: any) {
      toast({ title: "Грешка", description: e.message, variant: "destructive" });
    }
  };

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
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="month">Месец</Label>
              <Input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <form className="grid gap-1 md:col-span-2" onSubmit={addApartment}>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="name">Нов апартамент</Label>
                  <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ап. 1" />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="fee">Месечна такса (лв.)</Label>
                  <Input id="fee" type="number" value={newFee} onChange={(e) => setNewFee(Number(e.target.value || 0))} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" variant="outline">Добави</Button>
                </div>
              </div>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Апартамент</th>
                  <th className="py-2">Такса</th>
                  <th className="py-2">Платено</th>
                  <th className="py-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {apartments.map((r) => {
                  const paid = Boolean(payments[r.id]);
                  return (
                    <tr key={r.id} className="border-t">
                      <td className="py-2">{r.name}</td>
                      <td className="py-2">{Number(r.monthly_fee)} лв.</td>
                      <td className="py-2">
                        <Checkbox
                          checked={paid}
                          onCheckedChange={(v) => togglePaid(r, Boolean(v))}
                        />
                      </td>
                      <td className="py-2">
                        {paid ? (
                          <span className="text-primary">Дал {Number(r.monthly_fee)} лв.</span>
                        ) : (
                          <span className="text-destructive">Дължи {Number(r.monthly_fee)} лв.</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

