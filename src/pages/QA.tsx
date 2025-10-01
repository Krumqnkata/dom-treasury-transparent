import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function QA() {
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [expenseId, setExpenseId] = useState<string | null>(null);
  const [receiptPath, setReceiptPath] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([]);
  const log = (m: string) => {
    console.log("[QA]", m);
    setLogs((l) => [...l, m]);
  };

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const monthStart = useMemo(() => {
    const d = new Date();
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    return m;
  }, []);

  // Budgets suite
  const runBudgets = async () => {
    try {
      setLogs([]);
      log("Budgets: insert 123.45");
const { data: ins, error } = await (supabase as any)
        .from("budgets")
        .insert({ amount: 123.45, note: "QA" })
        .select("id")
        .single();
      if (error) throw error;
      setBudgetId(ins.id);
      log(`Budgets: inserted id=${ins.id}`);

      log("Budgets: update to 200");
const { error: upErr } = await (supabase as any)
        .from("budgets")
        .update({ amount: 200 })
        .eq("id", ins.id);
      if (upErr) throw upErr;
      log("Budgets: updated to 200");
      toast({ title: "Budgets OK", description: "Създаден и обновен успешно" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Budgets error", description: e.message, variant: "destructive" });
      log(`Budgets error: ${e.message}`);
    }
  };

  const cleanupBudgets = async () => {
    if (!budgetId) return;
    try {
      const { error } = await (supabase as any).from("budgets").delete().eq("id", budgetId);
      if (error) throw error;
      log(`Budgets: deleted id=${budgetId}`);
      setBudgetId(null);
      toast({ title: "Budgets cleanup", description: "Изтрито" });
    } catch (e: any) {
      toast({ title: "Cleanup error", description: e.message, variant: "destructive" });
    }
  };

  // Goals suite
  const runGoals = async () => {
    try {
      log("Goals: insert QA Goal");
      const { data: ins, error } = await supabase
        .from("goals")
        .insert({ title: "QA Goal", target_amount: 500, saved_amount: 0 })
        .select("id")
        .single();
      if (error) throw error;
      setGoalId(ins.id);
      log(`Goals: inserted id=${ins.id}`);

      log("Goals: update saved_amount to 150");
      const { error: upErr } = await supabase
        .from("goals")
        .update({ saved_amount: 150 })
        .eq("id", ins.id);
      if (upErr) throw upErr;
      log("Goals: updated saved_amount=150");
      toast({ title: "Goals OK", description: "Създадена и обновена успешно" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Goals error", description: e.message, variant: "destructive" });
      log(`Goals error: ${e.message}`);
    }
  };

  const cleanupGoals = async () => {
    if (!goalId) return;
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);
      if (error) throw error;
      log(`Goals: deleted id=${goalId}`);
      setGoalId(null);
      toast({ title: "Goals cleanup", description: "Изтрита" });
    } catch (e: any) {
      toast({ title: "Cleanup error", description: e.message, variant: "destructive" });
    }
  };

  // Expenses suite
  const ensureCategory = async () => {
    const { data: catList, error } = await supabase
      .from("expense_categories")
      .select("id, name")
      .eq("name", "QA")
      .limit(1);
    if (error) throw error;
    if (catList && catList.length > 0) return catList[0].id as string;
    const { data: created, error: insErr } = await supabase
      .from("expense_categories")
      .insert({ name: "QA" })
      .select("id")
      .single();
    if (insErr) throw insErr;
    return created.id as string;
  };

  const runExpenses = async () => {
    try {
      log("Expenses: ensure QA category");
      const catId = await ensureCategory();

      log("Expenses: fetch placeholder.svg");
      const resp = await fetch("/placeholder.svg");
      if (!resp.ok) throw new Error("Неуспешно зареждане на файла");
      const blob = await resp.blob();

      const fileName = `qa/${Date.now()}.svg`;
      log(`Expenses: upload ${fileName}`);
      const { data: up, error: upErr } = await supabase.storage
        .from("receipts")
        .upload(fileName, blob, { contentType: "image/svg+xml", upsert: true });
      if (upErr) throw upErr;
      setReceiptPath(up.path);

      log("Expenses: insert expense");
      const { data: ins, error } = await supabase
        .from("expenses")
        .insert({ amount: 9.99, incurred_at: todayStr, category_id: catId, description: "QA", receipt_path: up.path })
        .select("id")
        .single();
      if (error) throw error;
      setExpenseId(ins.id);
      log(`Expenses: inserted id=${ins.id}`);

      toast({ title: "Expenses OK", description: "Създаден разход с бележка" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Expenses error", description: e.message, variant: "destructive" });
      log(`Expenses error: ${e.message}`);
    }
  };

  const cleanupExpenses = async () => {
    try {
      if (expenseId) {
        const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
        if (error) throw error;
        log(`Expenses: deleted id=${expenseId}`);
        setExpenseId(null);
      }
      if (receiptPath) {
        const { error: remErr } = await supabase.storage.from("receipts").remove([receiptPath]);
        if (remErr) throw remErr;
        log(`Receipts: removed ${receiptPath}`);
        setReceiptPath(null);
      }
      toast({ title: "Expenses cleanup", description: "Почистено" });
    } catch (e: any) {
      toast({ title: "Cleanup error", description: e.message, variant: "destructive" });
    }
  };


  return (
    <>
      <Helmet>
        <title>QA тестове – Домова каса</title>
        <meta name="description" content="Автоматични QA тестове за бюджети, цели, разходи, плащания." />
        <link rel="canonical" href="/qa" />
      </Helmet>
      <div className="grid gap-6">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>QA Test Runner</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <section>
              <h2 className="text-lg font-semibold mb-2">Budgets</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="hero" onClick={runBudgets}>Run</Button>
                <Button variant="outline" onClick={cleanupBudgets} disabled={!budgetId}>Clean up</Button>
              </div>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">Goals</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="hero" onClick={runGoals}>Run</Button>
                <Button variant="outline" onClick={cleanupGoals} disabled={!goalId}>Clean up</Button>
              </div>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">Expenses</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="hero" onClick={runExpenses}>Run</Button>
                <Button variant="outline" onClick={cleanupExpenses} disabled={!expenseId && !receiptPath}>Clean up</Button>
              </div>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">Логове</h2>
              <div className="rounded-md border p-3 bg-muted/50 text-sm max-h-64 overflow-auto">
                {logs.length === 0 ? (
                  <div className="text-muted-foreground">Няма събития</div>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {logs.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
