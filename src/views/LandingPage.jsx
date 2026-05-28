import { useContext, useEffect } from "react";
import LandingHeroSection from "../components/landing/LandingHeroSection";
import LandingTrendingSection from "../components/landing/LandingTrendingSection";
import LandingCategoriesSection from "../components/landing/LandingCategoriesSection";
import { UserContext } from "../context/user-context";
import useRouteScrollReset from "../hooks/useRouteScrollReset";
import routes from "../router/routes";
import "../css/views/LandingPage.css";

const TRENDING_GAMES = [
  {
    key: "resident-evil-requiem",
    title: "Resident Evil Requiem",
    genre: "Survival Horror",
    year: "2026",
    image: "/media/resident_evil_requiem.webp",
    to: routes.detail.replace(":id", "1004511"),
  },
  {
    key: "pragmata",
    title: "Pragmata",
    genre: "Azione",
    year: "2026",
    image: "/media/pragmata_wallpaper.webp",
    to: routes.detail.replace(":id", "452650"),
  },
  {
    key: "forza-horizon-6",
    title: "Forza Horizon 6",
    genre: "Corse",
    year: "2026",
    image: "/media/forza_horizon_6_wallpaper.webp",
    to: routes.detail.replace(":id", "1010949"),
  },
  {
    key: "tomodachi-life",
    title: "Tomodachi Life",
    genre: "Simulazione",
    year: "2013",
    image: "/media/tomodachi_life_wallpaper.webp",
    to: routes.detail.replace(":id", "27980"),
  },
];

const CATEGORY_CARDS = [
  {
    key: "adventure",
    title: "Adventure",
    subtitle: "Filtro dedicato al genere Adventure",
    image: "/media/expedition_33_mobile_wallpaper.webp",
    to: routes.genre.replace(":slug", "adventure"),
  },
  {
    key: "must-play",
    title: "Giochi da non perdere",
    subtitle: "Ritorna alla Home ordinata per voto",
    image: "/media/the_witcher_3_mobile_wallpaper.webp",
    to: routes.home,
  },
  {
    key: "stories",
    title: "Storie indimenticabili",
    subtitle: "Esplora subito il genere Action",
    image: "/media/red_dead_redemption_2_mobile_wallpaper.webp",
    to: routes.genre.replace(":slug", "action"),
  },
  {
    key: "extreme-challenges",
    title: "Sfide estreme",
    subtitle: "Vai ai migliori RPG",
    image: "/media/elden_ring_mobile_wallpaper.webp",
    to: routes.genre.replace(":slug", "role-playing-games-rpg"),
  },
  {
    key: "open-worlds",
    title: "Mondi aperti",
    subtitle: "Scopri i migliori Adventure",
    image: "/media/zelda_mobile_wallpaper.webp",
    to: routes.genre.replace(":slug", "adventure"),
  },
];

export default function LandingPage() {
  const { user } = useContext(UserContext);

  useRouteScrollReset();

  useEffect(() => {
    document.body.classList.add("landing-body");

    return () => {
      document.body.classList.remove("landing-body");
    };
  }, []);

  return (
    <main className="landing-page">
      <LandingHeroSection
        title="Final Fantasy VII Remake"
        description="Una leggenda ritorna. La storia che ha cambiato per sempre il GDR adesso ti aspetta in una veste cinematografica."
        description2="  ⭐ 4.5/5 | 2020 | "
        img_logo = "/media/ff7_logo.webp"
        link_square= "Square Enix"
        primaryAction={{
          label: "Entra nella libreria",
          to: routes.home,
        }}
        secondaryAction={
          !user
            ? {
              label: "Registrati",
              to: routes.register,
            }
            : null
        }
      />

      <LandingTrendingSection cards={TRENDING_GAMES} />

      <LandingCategoriesSection
        cards={CATEGORY_CARDS}
        allCollectionsTo={routes.home}
      />
    </main>
  );
}
