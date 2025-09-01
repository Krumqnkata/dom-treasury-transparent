import * as React from "react"
import { format } from "date-fns"
import { bg } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className
}: DateRangePickerProps) {
  const handlePresetChange = (preset: string) => {
    const today = new Date()
    let from: Date
    let to: Date = today

    switch (preset) {
      case "7d":
        from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        from = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "6m":
        from = new Date(today.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        from = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case "current-month":
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      default:
        return
    }

    onDateRangeChange({ from, to })
  }

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Избери период" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Последните 7 дни</SelectItem>
          <SelectItem value="30d">Последните 30 дни</SelectItem>
          <SelectItem value="current-month">Текущия месец</SelectItem>
          <SelectItem value="90d">Последните 90 дни</SelectItem>
          <SelectItem value="6m">Последните 6 месеца</SelectItem>
          <SelectItem value="1y">Последната година</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd.MM.yyyy", { locale: bg })} -{" "}
                  {format(dateRange.to, "dd.MM.yyyy", { locale: bg })}
                </>
              ) : (
                format(dateRange.from, "dd.MM.yyyy", { locale: bg })
              )
            ) : (
              <span>Избери период</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={bg}
            className={cn("p-3 pointer-events-auto")}
            disabled={(date) =>
              date > new Date() || date < new Date("2020-01-01")
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}