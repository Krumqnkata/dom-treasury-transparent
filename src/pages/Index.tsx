import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {

  return (
    <>
      <Helmet>
        <title>Домова каса онлайн – Управление на домашните разходи</title>
        <meta 
          name="description" 
          content="Проследете разходите си лесно с нашето приложение за домашна касa. Визуализирайте къде отиват парите ви и планирайте бюджета си ефективно." 
        />
        <link rel="canonical" href="/" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-gradient">
            Домова каса онлайн
          </h1>
          <Button asChild size="lg" variant="hero" className="text-lg px-8 py-4">
            <Link to="/auth">Вход</Link>
          </Button>
        </div>
      </div>
    </>
  );
}