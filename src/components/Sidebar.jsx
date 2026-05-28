import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  FaApple,
  FaChevronDown,
  FaGamepad,
  FaLayerGroup,
  FaPlaystation,
  FaSliders,
  FaWindows,
  FaXbox,
  FaXmark,
} from "react-icons/fa6";
import { BsNintendoSwitch } from "react-icons/bs";
import { SiAtari, SiSega } from "react-icons/si";
import routes from "../router/routes";
import "../css/components/Sidebar.css";

const PLATFORM_HIERARCHY = [
  {
    id: "console",
    label: "Console",
    Icon: FaGamepad,
  },
  {
    id: "pc",
    label: "PC",
    Icon: FaWindows,
  },
  {
    id: "mobile",
    label: "Mobile",
    Icon: FaApple,
  },
];

const CONSOLE_BRAND_HIERARCHY = [
  {
    id: "sony",
    label: "Sony",
    Icon: FaPlaystation,
    match: /playstation|(^|\s)ps[1-5](\s|$)|ps vita|psp/,
    chronology: [
      { id: "ps1", match: /playstation 1|(^|\s)ps1(\s|$)|(^|\s)playstation(\s|$)/ },
      { id: "ps2", match: /playstation 2|(^|\s)ps2(\s|$)/ },
      { id: "ps3", match: /playstation 3|(^|\s)ps3(\s|$)/ },
      { id: "ps4", match: /playstation 4|(^|\s)ps4(\s|$)/ },
      { id: "ps5", match: /playstation 5|(^|\s)ps5(\s|$)/ },
    ],
  },
  {
    id: "microsoft",
    label: "Microsoft",
    Icon: FaXbox,
    match: /xbox/,
    chronology: [
      { id: "xbox", match: /(^|\s)xbox(?!\s*(360|one|series))(\s|$)/ },
      { id: "xbox-360", match: /xbox 360/ },
      { id: "xbox-one", match: /xbox one/ },
      { id: "xbox-series", match: /xbox series|xbox series x|xbox series s|xbox sx/ },
    ],
  },
  {
    id: "nintendo",
    label: "Nintendo",
    Icon: BsNintendoSwitch,
    match:
      /nintendo|switch|wii|game boy|gameboy|game cube|gamecube|virtual boy|famicom|nintendo 64|n64|3ds|nds|(^|\s)snes(\s|$)|(^|\s)nes(\s|$)/,
    chronology: [
      { id: "nes", match: /nintendo entertainment system|famicom|(^|\s)nes(\s|$)/ },
      { id: "snes", match: /super nintendo|(^|\s)snes(\s|$)/ },
      { id: "n64", match: /nintendo 64|(^|\s)n64(\s|$)/ },
      { id: "gamecube", match: /game cube|gamecube/ },
      { id: "wii", match: /(^|\s)wii(?!\s*u)(\s|$)/ },
      { id: "wii-u", match: /wii u/ },
      { id: "switch", match: /switch/ },
    ],
  },
  {
    id: "sega",
    label: "Sega",
    Icon: SiSega,
    match: /sega|mega drive|genesis|dreamcast|saturn|game gear|master system|sega cd|32x/,
    chronology: [
      { id: "mega-drive", match: /mega drive|genesis/ },
      { id: "saturn", match: /saturn/ },
      { id: "dreamcast", match: /dreamcast/ },
    ],
  },
  {
    id: "atari",
    label: "Atari",
    Icon: SiAtari,
    match: /atari|jaguar|lynx|atari 2600|atari 5200|atari 7800|atari st/,
    chronology: [
      { id: "atari-2600", match: /atari 2600/ },
      { id: "atari-5200", match: /atari 5200/ },
      { id: "atari-7800", match: /atari 7800/ },
      { id: "atari-jaguar", match: /jaguar/ },
      { id: "atari-lynx", match: /lynx/ },
    ],
  },
  {
    id: "other",
    label: "Altri Brand",
    Icon: FaLayerGroup,
    match: /./,
    chronology: [],
  },
];

function normalizePlatformText(...values) {
  return values
    .map((value) => String(value || "").toLowerCase())
    .join(" ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isGenericPlayStationParent({ id, name, slug }) {
  const normalizedName = normalizePlatformText(name);
  const normalizedSlug = normalizePlatformText(slug);

  return id === 2 && normalizedName === "playstation" && normalizedSlug === "playstation";
}

function getNormalizedPlatformName({ id, name, slug }) {
  const normalizedName = normalizePlatformText(name);
  const normalizedSlug = normalizePlatformText(slug);

  if (
    id !== 2
    && normalizedName === "playstation"
    && (normalizedSlug === "playstation" || normalizedSlug === "playstation1")
  ) {
    return "PlayStation 1";
  }

  return name;
}

function resolvePlatformMacroCategoryId(option, slug = "") {
  const value = normalizePlatformText(option, slug);

  if (/android|ios|iphone|ipad|mobile|windows phone|blackberry|fire os/.test(value)) {
    return "mobile";
  }

  if (/windows|microsoft|pc|linux|mac|os x|steam os|steam deck|dos|amiga|commodore/.test(value)) {
    return "pc";
  }

  return "console";
}

function resolveConsoleBrandId(option, slug = "") {
  const value = normalizePlatformText(option, slug);

  const matchedBrand = CONSOLE_BRAND_HIERARCHY.find((brand) => {
    if (brand.id === "other") {
      return false;
    }

    return brand.match.test(value);
  });

  return matchedBrand?.id || "other";
}

function resolveConsoleChronologyIndex(brand, option, slug = "") {
  if (!brand || !Array.isArray(brand.chronology) || brand.chronology.length === 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  const value = normalizePlatformText(option, slug);
  const index = brand.chronology.findIndex((entry) => entry.match.test(value));

  if (index === -1) {
    return Number.MAX_SAFE_INTEGER;
  }

  return index;
}

function buildPlatformOption(rawPlatform) {
  const id = Number(rawPlatform?.id);
  const name = String(rawPlatform?.name ?? "").trim();
  const slug = String(rawPlatform?.slug ?? "").trim();

  if (!Number.isFinite(id) || !name || !slug) {
    return null;
  }

  if (isGenericPlayStationParent({ id, name, slug })) {
    return null;
  }

  const normalizedName = getNormalizedPlatformName({ id, name, slug });

  return {
    id,
    name: normalizedName,
    slug,
  };
}

function extractGlobalPlatforms(payload) {
  const uniquePlatforms = new Map();
  const parents = Array.isArray(payload?.results) ? payload.results : [];

  const toUniqueKey = (option) => {
    const normalizedSlug = String(option?.slug ?? "").trim().toLowerCase();

    if (normalizedSlug) {
      return `slug:${normalizedSlug}`;
    }

    return `id:${option?.id}`;
  };

  parents.forEach((parent) => {
    const parentOption = buildPlatformOption(parent);

    if (parentOption) {
      uniquePlatforms.set(toUniqueKey(parentOption), parentOption);
    }

    const childPlatforms = Array.isArray(parent?.platforms) ? parent.platforms : [];

    childPlatforms.forEach((platform) => {
      const platformOption = buildPlatformOption(platform);

      if (platformOption) {
        uniquePlatforms.set(toUniqueKey(platformOption), platformOption);
      }
    });
  });

  return Array.from(uniquePlatforms.values()).sort((left, right) => left.name.localeCompare(right.name));
}

function parseMetacriticMinFromSearch(search) {
  const params = new URLSearchParams(search);
  const parsedValue = Number.parseInt(params.get("metacriticMin") ?? "0", 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return Math.min(100, parsedValue);
}

function parsePositiveInt(value) {
  const parsedValue = Number.parseInt(String(value ?? ""), 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return null;
  }

  return parsedValue;
}

function parsePathFilters(pathname) {
  const [routeKey = "", firstParam = "", secondParam = ""] = String(pathname ?? "")
    .split("/")
    .filter(Boolean);

  if (routeKey === "genre") {
    return {
      isGenreRoute: true,
      isPlatformRoute: false,
      genreSlug: String(firstParam || "").trim(),
      platformId: null,
      platformSlug: "",
    };
  }

  if (routeKey === "platform") {
    return {
      isGenreRoute: false,
      isPlatformRoute: true,
      genreSlug: "",
      platformId: parsePositiveInt(firstParam),
      platformSlug: String(secondParam || "").trim(),
    };
  }

  return {
    isGenreRoute: false,
    isPlatformRoute: false,
    genreSlug: "",
    platformId: null,
    platformSlug: "",
  };
}

function parseOptionalFiltersFromSearch(search) {
  const params = new URLSearchParams(search);

  return {
    genreSlug: String(params.get("genre") ?? "").trim(),
    platformId: parsePositiveInt(params.get("platform")),
    platformSlug: String(params.get("platformSlug") ?? "").trim(),
  };
}

function buildFilterSearch(
  search,
  {
    metacriticMin = 0,
    genreSlug = "",
    platformId = null,
    platformSlug = "",
    includeGenre = true,
    includePlatform = true,
  } = {},
) {
  const params = new URLSearchParams(search);
  const safeMin = Math.max(0, Math.min(100, Number(metacriticMin) || 0));
  const safeGenreSlug = String(genreSlug ?? "").trim();
  const safePlatformId = parsePositiveInt(platformId);
  const safePlatformSlug = String(platformSlug ?? "").trim();

  params.delete("page");

  if (safeMin <= 0) {
    params.delete("metacriticMin");
  } else {
    params.set("metacriticMin", String(safeMin));
  }

  if (includeGenre && safeGenreSlug) {
    params.set("genre", safeGenreSlug);
  } else {
    params.delete("genre");
  }

  if (includePlatform && safePlatformId) {
    params.set("platform", String(safePlatformId));

    if (safePlatformSlug) {
      params.set("platformSlug", safePlatformSlug);
    } else {
      params.delete("platformSlug");
    }
  } else {
    params.delete("platform");
    params.delete("platformSlug");
  }

  const nextSearch = params.toString();
  return nextSearch ? `?${nextSearch}` : "";
}

export default function Sidebar({ genres, isOpen, onClose }) {
  const [isPlatformsExpanded, setIsPlatformsExpanded] = useState(false);
  const [isGenresExpanded, setIsGenresExpanded] = useState(false);
  const [openMacroCategoryId, setOpenMacroCategoryId] = useState(null);
  const [openConsoleBrandId, setOpenConsoleBrandId] = useState(null);
  const [globalPlatforms, setGlobalPlatforms] = useState([]);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);

  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const pathFilters = useMemo(() => parsePathFilters(pathname), [pathname]);
  const queryFilters = useMemo(() => parseOptionalFiltersFromSearch(search), [search]);

  const activeGenreSlug = pathFilters.genreSlug || queryFilters.genreSlug;
  const activePlatformId = pathFilters.platformId || queryFilters.platformId;
  const activePlatformSlug = pathFilters.platformSlug || queryFilters.platformSlug;

  const activeMetacriticMin = useMemo(() => parseMetacriticMinFromSearch(search), [search]);
  const [pendingMetacriticMin, setPendingMetacriticMin] = useState(activeMetacriticMin);
  const [pendingGenreSlug, setPendingGenreSlug] = useState(activeGenreSlug);
  const [pendingPlatformId, setPendingPlatformId] = useState(activePlatformId);
  const [pendingPlatformSlug, setPendingPlatformSlug] = useState(activePlatformSlug);
  const [pendingPrimaryFilter, setPendingPrimaryFilter] = useState(
    pathFilters.isPlatformRoute
      ? "platform"
      : pathFilters.isGenreRoute
        ? "genre"
        : null,
  );

  useEffect(() => {
    setPendingMetacriticMin(activeMetacriticMin);
    setPendingGenreSlug(activeGenreSlug);
    setPendingPlatformId(activePlatformId);
    setPendingPlatformSlug(activePlatformSlug);
    setPendingPrimaryFilter(
      pathFilters.isPlatformRoute
        ? "platform"
        : pathFilters.isGenreRoute
          ? "genre"
          : null,
    );
  }, [
    activeGenreSlug,
    activeMetacriticMin,
    activePlatformId,
    activePlatformSlug,
    pathFilters.isGenreRoute,
    pathFilters.isPlatformRoute,
  ]);

  const genreLinks = useMemo(() => {
    const uniqueGenres = new Map();
    const genreItems = Array.isArray(genres) ? genres : [];

    genreItems.forEach((genre) => {
      const slug = String(genre?.slug ?? "").trim();
      const name = String(genre?.name ?? "").trim();

      if (!slug || !name) {
        return;
      }

      uniqueGenres.set(slug, {
        slug,
        name,
      });
    });

    return Array.from(uniqueGenres.values()).sort((left, right) => left.name.localeCompare(right.name));
  }, [genres]);

  useEffect(() => {
    let isCancelled = false;

    const fetchGlobalPlatforms = async () => {
      const apiKey = String(import.meta.env.VITE_RAWG_KEY ?? "").trim();

      if (!apiKey) {
        if (!isCancelled) {
          setGlobalPlatforms([]);
        }

        return;
      }

      setIsLoadingPlatforms(true);

      try {
        const response = await fetch(
          `https://api.rawg.io/api/platforms/lists/parents?key=${apiKey}&page_size=100`,
        );
        const payload = await response.json();

        if (!response.ok) {
          console.error("RAWG API error:", payload);

          if (!isCancelled) {
            setGlobalPlatforms([]);
          }

          return;
        }

        if (!isCancelled) {
          setGlobalPlatforms(extractGlobalPlatforms(payload));
        }
      } catch (error) {
        console.error("RAWG platforms fetch error:", error);

        if (!isCancelled) {
          setGlobalPlatforms([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPlatforms(false);
        }
      }
    };

    fetchGlobalPlatforms();

    return () => {
      isCancelled = true;
    };
  }, []);

  const groupedPlatformsByMacro = useMemo(() => {
    const groups = PLATFORM_HIERARCHY.reduce((accumulator, macroCategory) => {
      accumulator[macroCategory.id] = [];
      return accumulator;
    }, {});

    globalPlatforms.forEach((platform) => {
      const macroCategoryId = resolvePlatformMacroCategoryId(platform.name, platform.slug);
      groups[macroCategoryId].push(platform);
    });

    Object.keys(groups).forEach((macroCategoryId) => {
      groups[macroCategoryId].sort((left, right) => left.name.localeCompare(right.name));
    });

    return groups;
  }, [globalPlatforms]);

  const consolePlatformsByBrand = useMemo(() => {
    const groupedByBrand = CONSOLE_BRAND_HIERARCHY.reduce((accumulator, brand) => {
      accumulator[brand.id] = [];
      return accumulator;
    }, {});

    const consolePlatforms = groupedPlatformsByMacro.console || [];

    consolePlatforms.forEach((platform) => {
      const brandId = resolveConsoleBrandId(platform.name, platform.slug);
      groupedByBrand[brandId].push(platform);
    });

    CONSOLE_BRAND_HIERARCHY.forEach((brand) => {
      groupedByBrand[brand.id].sort((left, right) => {
        const leftChronology = resolveConsoleChronologyIndex(brand, left.name, left.slug);
        const rightChronology = resolveConsoleChronologyIndex(brand, right.name, right.slug);

        if (leftChronology !== rightChronology) {
          return leftChronology - rightChronology;
        }

        return left.name.localeCompare(right.name);
      });
    });

    return groupedByBrand;
  }, [groupedPlatformsByMacro]);

  const visibleConsoleBrands = useMemo(() => {
    return CONSOLE_BRAND_HIERARCHY.filter((brand) => {
      const platforms = consolePlatformsByBrand[brand.id] || [];
      return platforms.length > 0;
    });
  }, [consolePlatformsByBrand]);

  useEffect(() => {
    if (!isOpen || !activePlatformId || globalPlatforms.length === 0) {
      return;
    }

    const currentPlatform = globalPlatforms.find((platform) => platform.id === activePlatformId);

    if (!currentPlatform) {
      return;
    }

    const currentMacroCategoryId = resolvePlatformMacroCategoryId(currentPlatform.name, currentPlatform.slug);

    setIsPlatformsExpanded(true);
    setOpenMacroCategoryId(currentMacroCategoryId);

    if (currentMacroCategoryId === "console") {
      setOpenConsoleBrandId(resolveConsoleBrandId(currentPlatform.name, currentPlatform.slug));
    } else {
      setOpenConsoleBrandId(null);
    }
  }, [activePlatformId, globalPlatforms, isOpen]);

  useEffect(() => {
    if (!isOpen || !activeGenreSlug) {
      return;
    }

    setIsGenresExpanded(true);
  }, [activeGenreSlug, isOpen]);

  const hasAnyGlobalPlatforms = globalPlatforms.length > 0;
  const hasAnyActiveFilters =
    activeMetacriticMin > 0
    || Boolean(activeGenreSlug)
    || Boolean(activePlatformId);
  const hasAnyPendingFilters =
    pendingMetacriticMin > 0
    || Boolean(pendingGenreSlug)
    || Boolean(pendingPlatformId);
  const canResetFilters =
    hasAnyPendingFilters
    || hasAnyActiveFilters
    || pathname !== routes.home
    || Boolean(search);
  const resolvedPendingPlatformSlug = pendingPlatformSlug
    || globalPlatforms.find((platform) => platform.id === pendingPlatformId)?.slug
    || "";
  const selectedPendingFilters = useMemo(() => {
    const pendingFilters = [];
    const selectedGenre = genreLinks.find((genre) => genre.slug === pendingGenreSlug);
    const selectedPlatform = globalPlatforms.find((platform) => {
      if (platform.id !== pendingPlatformId) {
        return false;
      }

      if (!pendingPlatformSlug) {
        return true;
      }

      return platform.slug === pendingPlatformSlug;
    });

    if (selectedGenre?.name) {
      pendingFilters.push(`Genere: ${selectedGenre.name}`);
    }

    if (selectedPlatform?.name) {
      pendingFilters.push(`Piattaforma: ${selectedPlatform.name}`);
    }

    if (pendingMetacriticMin > 0) {
      pendingFilters.push(`Metascore: >= ${pendingMetacriticMin}`);
    }

    return pendingFilters;
  }, [
    genreLinks,
    globalPlatforms,
    pendingGenreSlug,
    pendingMetacriticMin,
    pendingPlatformId,
    pendingPlatformSlug,
  ]);
  const effectivePrimaryFilter =
    pendingPrimaryFilter === "platform" && pendingPlatformId
      ? "platform"
      : pendingPrimaryFilter === "genre" && pendingGenreSlug
        ? "genre"
        : pendingPlatformId
          ? "platform"
          : pendingGenreSlug
            ? "genre"
            : null;
  const applyTargetPathname =
    effectivePrimaryFilter === "platform"
      ? `/platform/${pendingPlatformId}/${resolvedPendingPlatformSlug || pendingPlatformId}`
      : effectivePrimaryFilter === "genre"
        ? `/genre/${pendingGenreSlug}`
        : pathname;
  const applyTargetSearch =
    effectivePrimaryFilter === "platform"
      ? buildFilterSearch(search, {
        metacriticMin: pendingMetacriticMin,
        genreSlug: pendingGenreSlug,
        includeGenre: Boolean(pendingGenreSlug),
        includePlatform: false,
      })
      : effectivePrimaryFilter === "genre"
        ? buildFilterSearch(search, {
          metacriticMin: pendingMetacriticMin,
          platformId: pendingPlatformId,
          platformSlug: resolvedPendingPlatformSlug,
          includeGenre: false,
          includePlatform: Boolean(pendingPlatformId),
        })
        : buildFilterSearch(search, {
          metacriticMin: pendingMetacriticMin,
          genreSlug: pendingGenreSlug,
          platformId: pendingPlatformId,
          platformSlug: resolvedPendingPlatformSlug,
          includeGenre: !pathFilters.isGenreRoute,
          includePlatform: !pathFilters.isPlatformRoute,
        });
  const canApplyFilters =
    applyTargetPathname !== pathname
    || applyTargetSearch !== search;

  const preventDragStart = (event) => {
    event.preventDefault();
  };

  const applyPendingFilters = () => {
    if (!canApplyFilters) {
      return;
    }

    navigate(
      {
        pathname: applyTargetPathname,
        search: applyTargetSearch,
      },
      { replace: true },
    );

    if (typeof onClose === "function") {
      onClose();
    }
  };

  const resetPendingFilters = () => {
    setPendingMetacriticMin(0);
    setPendingGenreSlug("");
    setPendingPlatformId(null);
    setPendingPlatformSlug("");
    setPendingPrimaryFilter(null);
  };

  const handleResetFilters = (event) => {
    if (!canResetFilters) {
      event.preventDefault();
      return;
    }

    resetPendingFilters();

    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div
      className={`sidebar-panel ${
        isOpen
          ? "sidebar-panel--open"
          : "sidebar-panel--closed"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        aria-label="Chiudi menu filtri"
        className="sidebar-panel__scrim"
        onClick={onClose}
      />

      <aside
        className={`sidebar-panel__aside ${
          isOpen ? "sidebar-panel__aside--open" : "sidebar-panel__aside--closed"
        }`}
      >
        <div className="sidebar-panel__head">
          <div className="sidebar-panel__head-row">
            <div className="sidebar-panel__title-wrap">
              <h2 className="sidebar-panel__title">Filtri</h2>
            </div>

            <button
              onClick={onClose}
              aria-label="Chiudi menu"
              className="sidebar-panel__close-btn"
            >
              <FaXmark />
            </button>
          </div>

          <div className="sidebar-panel__filter-actions">
            <button
              type="button"
              onClick={applyPendingFilters}
              disabled={!canApplyFilters}
              className={`sidebar-panel__apply ${
                canApplyFilters
                  ? "sidebar-panel__apply--active"
                  : "sidebar-panel__apply--inactive"
              }`}
            >
              Applica filtri
            </button>

            <Link
              to={routes.home}
              onClick={handleResetFilters}
              aria-disabled={!canResetFilters}
              className={`sidebar-panel__reset ${
                canResetFilters
                  ? "sidebar-panel__reset--active"
                  : "sidebar-panel__reset--inactive"
              }`}
            >
              <span className="sidebar-panel__reset-left">
                <FaSliders className="sidebar-panel__reset-icon" />
                Reset filtri
              </span>
            </Link>
          </div>

          <div className="sidebar-panel__selected-filters" aria-live="polite">
            <p className="sidebar-panel__selected-filters-title">Filtri selezionati</p>

            {selectedPendingFilters.length === 0 ? (
              <p className="sidebar-panel__selected-filters-empty">Nessun filtro selezionato</p>
            ) : (
              <ul className="sidebar-panel__selected-filters-list">
                {selectedPendingFilters.map((pendingFilterLabel) => {
                  return (
                    <li key={pendingFilterLabel} className="sidebar-panel__selected-filters-item">
                      {pendingFilterLabel}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="sidebar-panel__body">
          <div className="sidebar-panel__sections">
            <section className="sidebar-panel__section">
              <button
                type="button"
                className={`sidebar-accordion__toggle ${
                  isPlatformsExpanded ? "sidebar-accordion__toggle--open" : ""
                }`}
                aria-expanded={isPlatformsExpanded}
                aria-controls="sidebar-platforms-accordion"
                onClick={() => setIsPlatformsExpanded((previousState) => !previousState)}
              >
                <span className="sidebar-accordion__toggle-main">
                  <FaGamepad className="sidebar-panel__section-title-icon" />
                  <span className="sidebar-accordion__toggle-title">Piattaforme</span>
                </span>

                <span className="sidebar-accordion__toggle-meta">
                  <FaChevronDown
                    className={`sidebar-accordion__chevron ${
                      isPlatformsExpanded ? "sidebar-accordion__chevron--open" : ""
                    }`}
                  />
                </span>
              </button>

              <div
                id="sidebar-platforms-accordion"
                className={`sidebar-accordion__content ${
                  isPlatformsExpanded ? "sidebar-accordion__content--open" : ""
                }`}
              >
                <div className="sidebar-accordion__inner">
                  {isLoadingPlatforms ? (
                    <div className="sidebar-platforms__message">
                      Caricamento piattaforme...
                    </div>
                  ) : !hasAnyGlobalPlatforms ? (
                    <div className="sidebar-platforms__message">
                      Nessuna piattaforma disponibile.
                    </div>
                  ) : (
                    <div className="sidebar-platforms__macros">
                      {PLATFORM_HIERARCHY.map((macroCategory) => {
                        const macroPlatforms = groupedPlatformsByMacro[macroCategory.id] || [];
                        const hasPlatforms = macroPlatforms.length > 0;
                        const isMacroOpen = openMacroCategoryId === macroCategory.id;
                        const isMacroDisabled = !hasPlatforms;
                        const MacroIcon = macroCategory.Icon;

                        return (
                          <div key={macroCategory.id} className="sidebar-platforms__macro">
                            <button
                              type="button"
                              disabled={isMacroDisabled}
                              draggable={false}
                              onDragStart={preventDragStart}
                              className={`sidebar-platforms__macro-toggle ${
                                isMacroDisabled
                                  ? "sidebar-platforms__macro-toggle--disabled"
                                  : isMacroOpen
                                    ? "sidebar-platforms__macro-toggle--open"
                                    : "sidebar-platforms__macro-toggle--idle"
                              }`}
                              aria-expanded={isMacroOpen}
                              aria-controls={`sidebar-platforms-macro-${macroCategory.id}`}
                              onClick={() => {
                                const willOpen = openMacroCategoryId !== macroCategory.id;
                                setOpenMacroCategoryId(willOpen ? macroCategory.id : null);

                                if (!willOpen || macroCategory.id !== "console") {
                                  setOpenConsoleBrandId(null);
                                }
                              }}
                            >
                              <span className="sidebar-platforms__macro-label-wrap">
                                <MacroIcon className="sidebar-platforms__macro-icon" />
                                <span className="sidebar-platforms__macro-label">{macroCategory.label}</span>
                              </span>

                              <span className="sidebar-platforms__macro-meta">
                                <FaChevronDown
                                  className={`sidebar-platforms__macro-chevron ${
                                    isMacroOpen ? "sidebar-platforms__macro-chevron--open" : ""
                                  }`}
                                />
                              </span>
                            </button>

                            <div
                              id={`sidebar-platforms-macro-${macroCategory.id}`}
                              className={`sidebar-nested__content ${
                                isMacroOpen ? "sidebar-nested__content--open" : ""
                              }`}
                            >
                              <div className="sidebar-nested__inner">
                                {macroCategory.id === "console" ? (
                                  visibleConsoleBrands.length === 0 ? (
                                    <div className="sidebar-platforms__message">
                                      Nessuna console disponibile.
                                    </div>
                                  ) : (
                                    <div className="sidebar-platforms__brands">
                                      {visibleConsoleBrands.map((brand) => {
                                        const brandPlatforms = consolePlatformsByBrand[brand.id] || [];
                                        const isBrandOpen = openConsoleBrandId === brand.id;
                                        const BrandIcon = brand.Icon;

                                        return (
                                          <div key={brand.id} className="sidebar-platforms__brand">
                                            <button
                                              type="button"
                                              className={`sidebar-platforms__brand-toggle ${
                                                isBrandOpen
                                                  ? "sidebar-platforms__brand-toggle--open"
                                                  : "sidebar-platforms__brand-toggle--idle"
                                              }`}
                                              aria-expanded={isBrandOpen}
                                              aria-controls={`sidebar-brand-${brand.id}`}
                                              onClick={() => {
                                                setOpenConsoleBrandId((previousId) => {
                                                  return previousId === brand.id ? null : brand.id;
                                                });
                                              }}
                                            >
                                              <span className="sidebar-platforms__brand-label-wrap">
                                                <BrandIcon className="sidebar-platforms__brand-icon" />
                                                <span className="sidebar-platforms__brand-label">{brand.label}</span>
                                              </span>

                                              <FaChevronDown
                                                className={`sidebar-platforms__brand-chevron ${
                                                  isBrandOpen ? "sidebar-platforms__brand-chevron--open" : ""
                                                }`}
                                              />
                                            </button>

                                            <div
                                              id={`sidebar-brand-${brand.id}`}
                                              className={`sidebar-nested__content ${
                                                isBrandOpen ? "sidebar-nested__content--open" : ""
                                              }`}
                                            >
                                              <div className="sidebar-nested__inner">
                                                <div className="sidebar-platforms__list">
                                                  {brandPlatforms.map((platform) => {
                                                    const platformIdentityKey = `${platform.id}-${platform.slug}`;
                                                    const isPlatformActive =
                                                      pendingPlatformId === platform.id
                                                      && (!pendingPlatformSlug || pendingPlatformSlug === platform.slug);

                                                    return (
                                                      <button
                                                        type="button"
                                                        key={platformIdentityKey}
                                                        draggable={false}
                                                        onDragStart={preventDragStart}
                                                        onClick={() => {
                                                          setPendingPlatformId(platform.id);
                                                          setPendingPlatformSlug(platform.slug);
                                                          setPendingPrimaryFilter("platform");
                                                        }}
                                                        className={`sidebar-platforms__item ${
                                                          isPlatformActive
                                                            ? "sidebar-platforms__item--active"
                                                            : "sidebar-platforms__item--idle"
                                                        }`}
                                                      >
                                                        <span className="sidebar-platforms__item-name">{platform.name}</span>
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )
                                ) : (
                                  <div className="sidebar-platforms__list">
                                    {macroPlatforms.map((platform) => {
                                      const platformIdentityKey = `${platform.id}-${platform.slug}`;
                                      const isPlatformActive =
                                        pendingPlatformId === platform.id
                                        && (!pendingPlatformSlug || pendingPlatformSlug === platform.slug);

                                      return (
                                        <button
                                          type="button"
                                          key={platformIdentityKey}
                                          draggable={false}
                                          onDragStart={preventDragStart}
                                          onClick={() => {
                                            setPendingPlatformId(platform.id);
                                            setPendingPlatformSlug(platform.slug);
                                            setPendingPrimaryFilter("platform");
                                          }}
                                          className={`sidebar-platforms__item ${
                                            isPlatformActive
                                              ? "sidebar-platforms__item--active"
                                              : "sidebar-platforms__item--idle"
                                          }`}
                                        >
                                          <span className="sidebar-platforms__item-name">{platform.name}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="sidebar-panel__section sidebar-panel__section--metascore">
              <h3 className="sidebar-panel__section-title">
                <FaSliders className="sidebar-panel__section-title-icon" />
                Metascore
              </h3>

              <div className="sidebar-mc__box">
                <div className="sidebar-mc__scale">
                  <span>0</span>
                  <span className="sidebar-mc__value">{pendingMetacriticMin}</span>
                  <span>100</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={pendingMetacriticMin}
                  onChange={(event) => setPendingMetacriticMin(Number.parseInt(event.target.value, 10) || 0)}
                  className="sidebar-mc__input"
                />

                <div className="sidebar-mc__footer">
                  <span className="sidebar-mc__live">Si applica con Applica filtri</span>
                </div>
              </div>
            </section>

            <section className="sidebar-panel__section">
              <button
                type="button"
                className={`sidebar-accordion__toggle ${
                  isGenresExpanded ? "sidebar-accordion__toggle--open" : ""
                }`}
                aria-expanded={isGenresExpanded}
                aria-controls="sidebar-genres-accordion"
                onClick={() => setIsGenresExpanded((previousState) => !previousState)}
              >
                <span className="sidebar-accordion__toggle-main">
                  <FaLayerGroup className="sidebar-panel__section-title-icon" />
                  <span className="sidebar-accordion__toggle-title">Generi</span>
                </span>

                <span className="sidebar-accordion__toggle-meta">
                  <FaChevronDown
                    className={`sidebar-accordion__chevron ${
                      isGenresExpanded ? "sidebar-accordion__chevron--open" : ""
                    }`}
                  />
                </span>
              </button>

              <div
                id="sidebar-genres-accordion"
                className={`sidebar-accordion__content ${
                  isGenresExpanded ? "sidebar-accordion__content--open" : ""
                }`}
              >
                <div className="sidebar-accordion__inner">
                  {genreLinks.length === 0 ? (
                    <div className="sidebar-genres__empty">
                      Nessun genere disponibile al momento.
                    </div>
                  ) : (
                    <ul className="sidebar-genres__list">
                      {genreLinks.map((genre) => {
                        const isGenreActive = pendingGenreSlug === genre.slug;

                        return (
                          <li key={genre.slug}>
                            <button
                              type="button"
                              className={`sidebar-genres__item-link ${
                                isGenreActive
                                  ? "sidebar-genres__item-link--active"
                                  : "sidebar-genres__item-link--idle"
                              }`}
                              onClick={() => {
                                setPendingGenreSlug(genre.slug);
                                setPendingPrimaryFilter("genre");
                              }}
                            >
                              <span>{genre.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}
