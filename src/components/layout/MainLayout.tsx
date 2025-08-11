import { Link, NavLink, Outlet } from "react-router-dom";
import { PieChart, Wallet, ReceiptText, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", label: "Табло", Icon: PieChart },
  { to: "/incomes", label: "Приходи", Icon: Wallet },
  { to: "/expenses", label: "Разходи", Icon: ReceiptText },
  { to: "/goals", label: "Цели", Icon: PiggyBank },
];

export default function MainLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex flex-col gap-4 p-4 border-r bg-card/30">
        <Link to="/" className="mb-2">
          <div className="rounded-lg p-4 glass-surface shadow-elegant">
            <div className="text-sm text-muted-foreground">Домова каса</div>
            <div className="text-xl font-semibold">Онлайн</div>
          </div>
        </Link>
        <nav className="flex flex-col gap-2">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted",
                ].join(" ")
              }
            >
              <Icon className="opacity-80" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto text-xs text-muted-foreground">
          © {new Date().getFullYear()} Домова каса
        </div>
      </aside>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <Link to="/" className="font-semibold">
              Домова каса онлайн
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="hero" size="sm">
                <Link to="/dashboard">Отвори таблото</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
