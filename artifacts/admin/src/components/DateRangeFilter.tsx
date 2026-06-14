import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, CalendarDays, ChevronDown, CalendarCheck } from "lucide-react";
import { downloadCSV } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export type PresetId = "today" | "7d" | "30d" | "mtd" | "ytd" | "fy" | "custom";

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  className?: string;
  exportFilename?: string;
  exportData?: Record<string, string | number>[];
  exportLabel?: string;
  showPresets?: boolean;
  onApply?: () => void;
}

const PRESETS: { id: PresetId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "mtd", label: "This Month" },
  { id: "ytd", label: "This Year" },
  { id: "fy", label: "This FY" },
];

function getPresetRange(id: PresetId): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (id) {
    case "today":
      return { from: today, to: today };
    case "7d": {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { from: d, to: today };
    }
    case "30d": {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return { from: d, to: today };
    }
    case "mtd": {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: d, to: today };
    }
    case "ytd": {
      const d = new Date(today.getFullYear(), 0, 1);
      return { from: d, to: today };
    }
    case "fy": {
      // FY: Apr 1 - Mar 31
      const year = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
      return { from: new Date(year, 3, 1), to: today };
    }
    default:
      return { from: undefined, to: undefined };
  }
}

function fmtDate(d: Date | undefined) {
  return d && isValid(d) ? format(d, "dd MMM yyyy") : "Select";
}

export default function DateRangeFilter({
  value,
  onChange,
  label = "Date Range",
  className = "",
  exportFilename,
  exportData,
  exportLabel = "Export CSV",
  showPresets = true,
  onApply,
}: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<PresetId>("fy");
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  function applyPreset(id: PresetId) {
    setActivePreset(id);
    if (id !== "custom") {
      onChange(getPresetRange(id));
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Presets */}
      {showPresets && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:mx-0 md:px-0 scrollbar-hide">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors min-h-[32px] ${
                activePreset === p.id
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white border-gray-200 text-slate-600 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Date pickers */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-slate-700">{label}</span>

        <Popover open={fromOpen} onOpenChange={setFromOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 gap-1.5 text-sm font-normal">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              {fmtDate(value.from)}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value.from}
              onSelect={(d) => {
                onChange({ ...value, from: d ?? undefined });
                setActivePreset("custom");
                setFromOpen(false);
              }}
              defaultMonth={value.from ?? new Date()}
              captionLayout="dropdown"
              fromYear={2023}
              toYear={2027}
            />
          </PopoverContent>
        </Popover>

        <span className="text-sm text-muted-foreground">to</span>

        <Popover open={toOpen} onOpenChange={setToOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 gap-1.5 text-sm font-normal">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              {fmtDate(value.to)}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value.to}
              onSelect={(d) => {
                onChange({ ...value, to: d ?? undefined });
                setActivePreset("custom");
                setToOpen(false);
              }}
              defaultMonth={value.to ?? new Date()}
              captionLayout="dropdown"
              fromYear={2023}
              toYear={2027}
            />
          </PopoverContent>
        </Popover>

        {onApply && (
          <Button
            size="sm"
            className="h-9 gap-1 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={onApply}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Apply
          </Button>
        )}

        {exportData && exportFilename && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1 ml-auto"
            onClick={() => downloadCSV(exportFilename, exportData)}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{exportLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Helpers for date range filtering ─────────────────────────────────────

export function monthToDate(monthKey: string, fy: string): Date {
  // monthKey: "2025-04" format
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function filterByDateRange<T extends Record<string, any>>(
  items: T[],
  range: DateRange,
  dateKey: "date" | "month" | "paidAt" | "day" | "since" | "renewDate" | "requestedAt" | "createdAt" = "month"
): T[] {
  if (!range.from || !range.to) return items;
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  return items.filter((item) => {
    let raw: string | undefined;
    if (dateKey === "month" && item.month) {
      raw = item.month;
    } else if (dateKey === "date" && item.date) {
      raw = item.date;
    } else if (dateKey === "paidAt" && item.paidAt) {
      raw = item.paidAt;
    } else if (dateKey === "day" && item.day) {
      raw = item.day;
    } else if (dateKey === "since" && item.since) {
      raw = item.since;
    } else if (dateKey === "renewDate" && item.renewsIn) {
      return true;
    } else if (dateKey === "requestedAt" && item.requestedAt) {
      raw = item.requestedAt;
    } else if (dateKey === "createdAt" && item.createdAt) {
      raw = item.createdAt;
    }
    if (!raw) return true;
    let ts: number;
    if (dateKey === "month" && raw) {
      const [y, m] = raw.split("-").map(Number);
      if (!y || !m) return true;
      ts = new Date(y, m - 1, 1).getTime();
    } else if (dateKey === "since") {
      // "Jan 2025" format
      const d = new Date(`${raw} 01`);
      if (!isValid(d)) return true;
      ts = d.getTime();
    } else {
      const d = parseISO(raw);
      if (!isValid(d)) return true;
      ts = d.getTime();
    }
    return ts >= from && ts <= to;
  });
}

export function filterByDateRangeDaily<T extends Record<string, any>>(
  items: T[],
  range: DateRange
): T[] {
  if (!range.from || !range.to) return items;
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  return items.filter((item) => {
    const raw: string | undefined = item.date || item.day || item.paidAt || item.requestedAt || item.createdAt || item.since;
    if (!raw) return true;
    const d = parseISO(raw);
    if (!isValid(d)) return true;
    const ts = d.getTime();
    return ts >= from && ts <= to;
  });
}

export function isInDateRange(dateStr: string, range: DateRange): boolean {
  if (!range.from || !range.to) return true;
  const d = parseISO(dateStr);
  if (!isValid(d)) return true;
  const ts = d.getTime();
  return ts >= new Date(range.from).getTime() && ts <= new Date(range.to).getTime();
}
