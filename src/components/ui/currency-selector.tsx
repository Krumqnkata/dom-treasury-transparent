import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/hooks/useCurrency";
import { ChevronDown, Loader2 } from "lucide-react";

export function CurrencySelector() {
  const { currency, setCurrency, exchangeRate, loading } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span className="font-medium">{currency}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setCurrency('BGN')}
          className={currency === 'BGN' ? 'bg-accent' : ''}
        >
          <div className="flex flex-col">
            <span>BGN (лв.)</span>
            <span className="text-xs text-muted-foreground">Български лев</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setCurrency('EUR')}
          className={currency === 'EUR' ? 'bg-accent' : ''}
        >
          <div className="flex flex-col">
            <span>EUR (€)</span>
            <span className="text-xs text-muted-foreground">
              Курс: 1 EUR = {exchangeRate.toFixed(4)} BGN
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}