import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

interface ExpenseRow { id: string; amount: number; incurred_at: string; description: string | null; receipt_path: string | null; category_id: string | null }
interface Category { id: string; name: string }

export default function Expenses() {
  const { formatAmount, currency, convertAmount } = useCurrency();
  const [items, setItems] = useState<ExpenseRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const today = useMemo(() => new Date().toISOString().slice(0,10), []);

  const [amount, setAmount] = useState<number>(0);
  const [inputCurrency, setInputCurrency] = useState<'BGN' | 'EUR'>('EUR');
  const [date, setDate] = useState<string>(today);
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editInputCurrency, setEditInputCurrency] = useState<'BGN' | 'EUR'>('EUR');
  const [editDate, setEditDate] = useState<string>("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: cats, error: cErr }, { data: exps, error: eErr }] = await Promise.all([
          supabase.from("expense_categories").select("id,name").order("name"),
          supabase.from("expenses").select("id,amount,incurred_at,description,receipt_path,category_id").order("incurred_at", { ascending: false }),
        ]);
        if (cErr) throw cErr;
        if (eErr) throw eErr;
        setCategories(cats || []);
        setItems(exps || []);
        if (cats && cats.length && !categoryId) setCategoryId(cats[0].id);
      } catch (e: any) {
        toast({ title: "Грешка", description: e.message, variant: "destructive" });
      }
    };
    load();
  }, []);

  const saveExpense = async () => {
    try {
      if (!amount || !date) return;
      let receipt_path: string | null = null;
      if (file) {
        const path = `${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("receipts").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        receipt_path = path;
      }
      // Convert amount to BGN for storage
      const amountInBGN = inputCurrency === 'EUR' ? convertAmount(amount, false) : amount;
      const { data, error } = await supabase
        .from("expenses")
        .insert({ amount: amountInBGN, incurred_at: date, category_id: categoryId || null, description: description || null, receipt_path })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [data as any, ...prev]);
      setAmount(0);
      setDate(today);
      setDescription("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      toast({ title: "Записан разход", description: formatAmount(amountInBGN) });
    } catch (e: any) {
      toast({ title: "Грешка", description: e.message, variant: "destructive" });
    }
  };

  const removeExpense = async (row: ExpenseRow) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", row.id);
      if (error) throw error;
      if (row.receipt_path) {
        await supabase.storage.from("receipts").remove([row.receipt_path]);
      }
      setItems((prev) => prev.filter((i) => i.id !== row.id));
    } catch (e: any) {
      toast({ title: "Грешка при изтриване", description: e.message, variant: "destructive" });
    }
  };

  const startEdit = (expense: ExpenseRow) => {
    setEditingId(expense.id);
    setEditAmount(expense.amount);
    setEditInputCurrency('BGN'); // Always show BGN amounts from DB
    setEditDate(expense.incurred_at);
    setEditCategoryId(expense.category_id || "");
    setEditDescription(expense.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount(0);
    setEditInputCurrency('EUR');
    setEditDate("");
    setEditCategoryId("");
    setEditDescription("");
  };

  const saveEdit = async () => {
    try {
      if (!editingId || !editAmount || !editDate) return;
      
      // Convert amount to BGN for storage
      const amountInBGN = editInputCurrency === 'EUR' ? convertAmount(editAmount, false) : editAmount;
      
      const { data, error } = await supabase
        .from("expenses")
        .update({ 
          amount: amountInBGN, 
          incurred_at: editDate, 
          category_id: editCategoryId || null, 
          description: editDescription || null 
        })
        .eq("id", editingId)
        .select()
        .single();
      
      if (error) throw error;
      
      setItems((prev) => prev.map((item) => 
        item.id === editingId ? { ...item, ...data } : item
      ));
      
      cancelEdit();
      toast({ title: "Разходът е обновен", description: formatAmount(amountInBGN) });
    } catch (e: any) {
      toast({ title: "Грешка при редактиране", description: e.message, variant: "destructive" });
    }
  };

  const publicUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("receipts").getPublicUrl(path);
    return data.publicUrl;
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
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <label className="text-sm">Сума</label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={amount || ''} 
                    onChange={(e) => setAmount(Number(e.target.value || 0))} 
                    className="flex-1"
                  />
                  <Select value={inputCurrency} onValueChange={(value: 'BGN' | 'EUR') => setInputCurrency(value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BGN">лв.</SelectItem>
                      <SelectItem value="EUR">€</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Дата</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Категория</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете категория" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Описание</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Снимка на фактура/бележка</label>
              <Input ref={fileRef} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <Button variant="hero" onClick={saveExpense}>Запази разход</Button>
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
                {editingId === e.id ? (
                  // Edit mode
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <label className="text-sm">Сума</label>
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            value={editAmount || ''} 
                            onChange={(e) => setEditAmount(Number(e.target.value || 0))} 
                            className="flex-1"
                          />
                          <Select value={editInputCurrency} onValueChange={(value: 'BGN' | 'EUR') => setEditInputCurrency(value)}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BGN">лв.</SelectItem>
                              <SelectItem value="EUR">€</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <label className="text-sm">Дата</label>
                        <Input 
                          type="date" 
                          value={editDate} 
                          onChange={(e) => setEditDate(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm">Категория</label>
                      <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Изберете категория" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm">Описание</label>
                      <Input 
                        value={editDescription} 
                        onChange={(e) => setEditDescription(e.target.value)} 
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>
                        <Check className="size-4 mr-1" />
                        Запази
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        <X className="size-4 mr-1" />
                        Отказ
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{e.description || "Разход"}</div>
                      <div className="font-semibold">{formatAmount(Number(e.amount))}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.incurred_at).toLocaleDateString('bg-BG')}
                      {e.category_id && (
                        <span className="ml-2 text-muted-foreground">
                          • {categories.find(c => c.id === e.category_id)?.name}
                        </span>
                      )}
                    </div>
                    {e.receipt_path && (
                      <img 
                        src={publicUrl(e.receipt_path) || undefined} 
                        alt={`Разход: ${e.description || e.id}`} 
                        className="rounded-md max-h-48 object-cover" 
                        loading="lazy" 
                      />
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(e)}>
                        <Edit2 className="size-4 mr-1" />
                        Редактирай
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removeExpense(e)}>
                        Изтрий
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
