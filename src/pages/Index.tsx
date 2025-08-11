import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart as PieIcon, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <>
      <Helmet>
        <title>Домова каса онлайн – Прозрачност и отчетност</title>
        <meta
          name="description"
          content="Управлявайте приходите и разходите на входа с прозрачност – табло, графики, цели за спестяване."
        />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Домова каса онлайн",
            url: "/",
            description:
              "Онлайн домова каса: приходи, разходи, графики и прозрачност за всички съсобственици.",
          })}
        </script>
      </Helmet>
      <section className="min-h-[78vh] flex items-center">
        <div className="w-full grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              <span className="text-gradient">Домова каса онлайн</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Заменете тетрадката с модерна, прозрачна система за такси, разходи
              и цели за спестяване. Всички виждат, всичко е ясно.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="hero">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Отвори таблото <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/expenses">Добави разход</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Вход за домоуправител</Link>
              </Button>
            </div>
          </div>
          <div>
            <Card className="glass-surface shadow-elegant animate-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon /> Месечен баланс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Приходи</div>
                    <div className="text-2xl font-semibold">2 430 лв.</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Разходи</div>
                    <div className="text-2xl font-semibold">1 780 лв.</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Баланс</div>
                    <div className="text-2xl font-semibold">+650 лв.</div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="size-4" /> +8% спрямо миналия месец
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
