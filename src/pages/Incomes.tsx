import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, CalendarDays } from "lucide-react";

interface DailyCash {
  id: string;
  date: string;
  amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function Incomes() {
  const [dailyCash, setDailyCash] = useState<DailyCash[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchDailyCash = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("daily_cash")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);
      if (error) throw error;
      setDailyCash(data || []);
    } catch (err: any) {
      console.error("Error fetching daily cash:", err);
      toast({ title: "Грешка", description: "Неуспешно зареждане на записите", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchDailyCash();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim()) {
      toast({ title: "Грешка", description: "Въведете сума", variant: "destructive" });
      return;
    }

    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum)) {
        toast({ title: "Грешка", description: "Невалидна сума", variant: "destructive" });
        return;
      }

      if (editingId) {
        // Update existing record
        const { error } = await (supabase as any)
          .from("daily_cash")
          .update({
            date,
            amount: amountNum,
            notes: notes.trim() || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Успех", description: "Записът е обновен" });
        setEditingId(null);
      } else {
        // Insert new record
        const { error } = await (supabase as any)
          .from("daily_cash")
          .insert({
            date,
            amount: amountNum,
            notes: notes.trim() || null,
          });

        if (error) throw error;
        toast({ title: "Успех", description: "Записът е добавен" });
      }

      // Reset form
      setDate(new Date().toISOString().slice(0, 10));
      setAmount("");
      setNotes("");
      fetchDailyCash();
    } catch (err: any) {
      console.error("Error saving daily cash:", err);
      toast({ 
        title: "Грешка", 
        description: err.message.includes("duplicate") ? "Запис за тази дата вече съществува" : "Неуспешно запазване на записа", 
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (record: DailyCash) => {
    setEditingId(record.id);
    setDate(record.date);
    setAmount(record.amount.toString());
    setNotes(record.notes || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setAmount("");
    setNotes("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този запис?")) return;

    try {
      const { error } = await (supabase as any)
        .from("daily_cash")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Успех", description: "Записът е изтрит" });
      fetchDailyCash();
    } catch (err: any) {
      console.error("Error deleting daily cash:", err);
      toast({ title: "Грешка", description: "Неуспешно изтриване на записа", variant: "destructive" });
    }
  };

  const totalCurrentMonth = dailyCash
    .filter(record => {
      const recordMonth = new Date(record.date).getMonth();
      const currentMonth = new Date().getMonth();
      return recordMonth === currentMonth;
    })
    .reduce((sum, record) => sum + record.amount, 0);

  return (
    <>
      <Helmet>
        <title>Ежедневни приходи – Домова каса онлайн</title>
        <meta name="description" content="Записвайте ежедневно наличните пари в касата за прозрачно проследяване на финансите." />
        <link rel="canonical" href="/incomes" />
      </Helmet>
      
      <div className="grid gap-6">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays />
              {editingId ? "Редактиране на запис" : "Добавяне на ежедневен запис"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Дата</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Налични пари (лв.)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Бележки (по избор)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Допълнителна информация..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="hero">
                  {editingId ? "Обнови запис" : "Добави запис"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Отказ
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>Последни записи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-accent/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Общо за текущия месец</div>
              <div className="text-2xl font-semibold">{totalCurrentMonth.toFixed(2)} лв.</div>
            </div>
            
            {dailyCash.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Няма записи. Добавете първия си запис за днес.
              </div>
            ) : (
              <div className="grid gap-3">
                {dailyCash.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString("bg-BG")}
                        </div>
                        <div className="font-semibold text-lg">
                          {record.amount.toFixed(2)} лв.
                        </div>
                      </div>
                      {record.notes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {record.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        Редактирай
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

