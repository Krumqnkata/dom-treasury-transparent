import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";

interface Expense { id: string; title: string; amount: number; category: string; date: string; image?: string }

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>([]);
  const [form, setForm] = useState<Partial<Expense>>({ category: "комунални", date: new Date().toISOString().slice(0,10) });
  const fileRef = useRef<HTMLInputElement | null>(null);

  const add = () => {
    if (!form.title || !form.amount || !form.category || !form.date) return;
    const id = Math.random().toString(36).slice(2);
    setItems([{ id, ...(form as Expense) }, ...items]);
    setForm({ category: form.category, date: new Date().toISOString().slice(0,10) });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <Helmet>
        <title>Разходи – Домова каса онлайн</title>
        <meta name="description" content="Записвайте разходи по категории, с дата и снимка на фактура/бележка." />
        <link rel="canonical" href="/expenses" />
      </Helmet>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>Нов разход</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-sm">Описание</label>
              <Input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <label className="text-sm">Сума (лв.)</label>
                <Input type="number" value={form.amount ?? ''} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Дата</label>
                <Input type="date" value={form.date ?? ''} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Категория</label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ремонти">Ремонти</SelectItem>
                  <SelectItem value="комунални">Комунални</SelectItem>
                  <SelectItem value="почистване">Почистване</SelectItem>
                  <SelectItem value="извънредни">Извънредни</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Снимка на фактура/бележка</label>
              <Input ref={fileRef} type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                setForm((f) => ({ ...f, image: url }));
              }} />
            </div>
            <div>
              <Button variant="hero" onClick={add}>Запази разход</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>Последни разходи</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground">Няма добавени разходи.</div>
            )}
            {items.map((e) => (
              <div key={e.id} className="border rounded-md p-3 grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{e.title}</div>
                  <div className="font-semibold">{e.amount.toFixed(2)} лв.</div>
                </div>
                <div className="text-xs text-muted-foreground">{e.category} • {new Date(e.date).toLocaleDateString('bg-BG')}</div>
                {e.image && (
                  <img src={e.image} alt={`Разход: ${e.title}`} className="rounded-md max-h-48 object-cover" loading="lazy" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
