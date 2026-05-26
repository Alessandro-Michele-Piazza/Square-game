import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  FaApple,
  FaGamepad,
  FaLayerGroup,
  FaLinux,
  FaPlaystation,
  FaSliders,
  FaWindows,
  FaXbox,
  FaXmark,
} from "react-icons/fa6";
import { BsNintendoSwitch } from "react-icons/bs";
import { SiAtari, SiSega } from "react-icons/si";
import "../css/components/Sidebar.css";

const PLATFORM_FAMILIES = [
  {
    id: "sony",
    label: "Sony / PlayStation",
    shortLabel: "PS",
    Icon: FaPlaystation,
    toneClass: "sidebar-platforms__icon-tone--sony",
  },
  {
    id: "xbox",
    label: "Xbox",
    shortLabel: "Xbox",
    Icon: FaXbox,
    toneClass: "sidebar-platforms__icon-tone--xbox",
  },
  {
    id: "microsoft",
    label: "Windows / PC",
    shortLabel: "PC",
    Icon: FaWindows,
    toneClass: "sidebar-platforms__icon-tone--microsoft",
  },
  {
    id: "nintendo",
    label: "Nintendo",
    shortLabel: "Nintendo",
    Icon: BsNintendoSwitch,
    toneClass: "sidebar-platforms__icon-tone--nintendo",
  },
  {
    id: "sega",
    label: "Sega",
    shortLabel: "Sega",
    Icon: SiSega,
    toneClass: "sidebar-platforms__icon-tone--sega",
  },
  {
    id: "atari",
    label: "Atari",
    shortLabel: "Atari",
    Icon: SiAtari,
    toneClass: "sidebar-platforms__icon-tone--atari",
  },
  {
    id: "apple",
    label: "Apple",
    shortLabel: "Apple",
    Icon: FaApple,
    toneClass: "sidebar-platforms__icon-tone--apple",
  },
  {
    id: "linux",
    label: "Linux / Steam",
    shortLabel: "Linux",
    Icon: FaLinux,
    toneClass: "sidebar-platforms__icon-tone--linux",
  },
  {
    id: "other",
    label: "Altri",
    shortLabel: "Altro",
    Icon: FaLayerGroup,
    toneClass: "sidebar-platforms__icon-tone--other",
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

function resolvePlatformFamilyId(option, slug = "") {
  const value = normalizePlatformText(option, slug);

  if (/playstation|ps[0-9]?|sony/.test(value)) {
    return "sony";
  }

  if (/xbox/.test(value)) {
    return "xbox";
  }

  if (/sega|mega drive|genesis|dreamcast|saturn|game gear|master system|sega cd|32x/.test(value)) {
    return "sega";
  }

  if (/atari|jaguar|lynx|atari 2600|atari 5200|atari 7800|atari st/.test(value)) {
    return "atari";
  }

  if (/windows|microsoft|pc/.test(value)) {
    return "microsoft";
  }

  if (
    /nintendo|switch|wii|game boy|gameboy|game cube|gamecube|virtual boy|famicom|nintendo 64|n64|3ds|nds|snes/.test(value)
    || /(^|\s)nes(\s|$)/.test(value)
  ) {
    return "nintendo";
  }

  if (/linux|steam/.test(value)) {
    return "linux";
  }

  if (/mac|apple|ios/.test(value)) {
    return "apple";
  }

  return "other";
}

function resolvePlatformVisual(option, slug = "") {
  const familyId = resolvePlatformFamilyId(option, slug);
  const family = PLATFORM_FAMILIES.find((item) => item.id === familyId);

  if (family) {
    return { Icon: family.Icon, toneClass: family.toneClass };
  }

  return { Icon: FaGamepad, toneClass: "sidebar-platforms__icon-tone--other" };
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
  const [openFamilyId, setOpenFamilyId] = useState(null);
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

  useEffect(() => {
    setPendingMetacriticMin(activeMetacriticMin);
  }, [activeMetacriticMin]);

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

  const groupedPlatforms = useMemo(() => {
    const groups = PLATFORM_FAMILIES.reduce((accumulator, family) => {
      accumulator[family.id] = [];
      return accumulator;
    }, {});

    globalPlatforms.forEach((platform) => {
      const familyId = resolvePlatformFamilyId(platform.name, platform.slug);
      groups[familyId].push(platform);
    });

    Object.keys(groups).forEach((familyId) => {
      groups[familyId].sort((left, right) => left.name.localeCompare(right.name));
    });

    return groups;
  }, [globalPlatforms]);

  const visiblePlatformFamilies = useMemo(() => {
    if (isLoadingPlatforms) {
      return PLATFORM_FAMILIES;
    }

    return PLATFORM_FAMILIES.filter((family) => {
      return (groupedPlatforms[family.id] || []).length > 0;
    });
  }, [groupedPlatforms, isLoadingPlatforms]);

  useEffect(() => {
    if (!isOpen || !activePlatformId || globalPlatforms.length === 0) {
      return;
    }

    const currentPlatform = globalPlatforms.find((platform) => platform.id === activePlatformId);

    if (!currentPlatform) {
      return;
    }

    setOpenFamilyId(resolvePlatformFamilyId(currentPlatform.name, currentPlatform.slug));
  }, [activePlatformId, globalPlatforms, isOpen]);

  useEffect(() => {
    if (pendingMetacriticMin === activeMetacriticMin) {
      return;
    }

    const nextSearch = buildFilterSearch(search, {
      metacriticMin: pendingMetacriticMin,
      genreSlug: activeGenreSlug,
      platformId: activePlatformId,
      platformSlug: activePlatformSlug,
      includeGenre: !pathFilters.isGenreRoute,
      includePlatform: !pathFilters.isPlatformRoute,
    });

    if (nextSearch === search) {
      return;
    }

    const timeoutId = setTimeout(() => {
      navigate(
        {
          pathname,
          search: nextSearch,
        },
        { replace: true },
      );
    }, 220);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    activeGenreSlug,
    activeMetacriticMin,
    activePlatformId,
    activePlatformSlug,
    navigate,
    pathFilters.isGenreRoute,
    pathFilters.isPlatformRoute,
    pathname,
    pendingMetacriticMin,
    search,
  ]);

  const openedFamilyPlatforms = openFamilyId ? groupedPlatforms[openFamilyId] || [] : [];
  const activeFiltersCount =
    Number(activeMetacriticMin > 0) +
    Number(Boolean(activeGenreSlug)) +
    Number(Boolean(activePlatformId));
  const hasAnyActiveFilters = activeFiltersCount > 0;
  const preventDragStart = (event) => {
    event.preventDefault();
  };

  const resetAllFilters = () => {
    const nextPathname = pathname.startsWith("/search/") ? pathname : "/";

    setPendingMetacriticMin(0);

    if (nextPathname === pathname && !search) {
      return;
    }

    navigate({
      pathname: nextPathname,
      search: "",
    });

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
        aria-label="Chiudi menu generi"
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
              <h2 className="sidebar-panel__title">Filters</h2>
            </div>

            <button
              onClick={onClose}
              aria-label="Chiudi menu"
              className="sidebar-panel__close-btn"
            >
              <FaXmark />
            </button>
          </div>

          <button
            type="button"
            onClick={resetAllFilters}
            disabled={!hasAnyActiveFilters}
            className={`sidebar-panel__reset ${
              hasAnyActiveFilters
                ? "sidebar-panel__reset--active"
                : "sidebar-panel__reset--inactive"
            }`}
          >
            <span className="sidebar-panel__reset-left">
              <span className="sidebar-panel__reset-icon-box">
                <FaSliders className="sidebar-panel__reset-icon" />
              </span>
              Filter reset
            </span>

            <span
              className={`sidebar-panel__reset-count ${
                hasAnyActiveFilters
                  ? "sidebar-panel__reset-count--active"
                  : "sidebar-panel__reset-count--inactive"
              }`}
            >
              {activeFiltersCount}
            </span>
          </button>
        </div>

        <div className="sidebar-panel__body">
          <div className="sidebar-panel__sections">
            <section className="sidebar-panel__section">
              <h3 className="sidebar-panel__section-title">
                <FaGamepad className="sidebar-panel__section-title-icon" />
                Piattaforme
              </h3>

              <div className="sidebar-platforms__families">
                {visiblePlatformFamilies.map((family) => {
                  const familyOptions = groupedPlatforms[family.id] || [];
                  const hasOptions = familyOptions.length > 0 || isLoadingPlatforms;
                  const isOpenFamily = openFamilyId === family.id;
                  const FamilyIcon = family.Icon;

                  return (
                    <button
                      key={family.id}
                      type="button"
                      disabled={!hasOptions}
                      draggable={false}
                      onDragStart={preventDragStart}
                      onClick={() => setOpenFamilyId((previousId) => (previousId === family.id ? null : family.id))}
                      className={`sidebar-platforms__family ${
                        !hasOptions
                          ? "sidebar-platforms__family--disabled"
                          : isOpenFamily
                            ? "sidebar-platforms__family--open"
                            : "sidebar-platforms__family--idle"
                      }`}
                    >
                      <span className="sidebar-platforms__family-row">
                        <FamilyIcon className={family.toneClass} />
                        <span className="sidebar-platforms__family-count">{familyOptions.length}</span>
                      </span>
                      <span className="sidebar-platforms__family-label">
                        {family.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {openFamilyId && (
                <div className="sidebar-platforms__list-shell">
                  {isLoadingPlatforms ? (
                    <div className="sidebar-platforms__message">
                      Caricamento piattaforme...
                    </div>
                  ) : openedFamilyPlatforms.length === 0 ? (
                    <div className="sidebar-platforms__message">
                      Nessuna piattaforma disponibile.
                    </div>
                  ) : (
                    <div className="sidebar-platforms__list">
                      {openedFamilyPlatforms.map((platform) => {
                        const optionVisual = resolvePlatformVisual(platform.name, platform.slug);
                        const OptionIcon = optionVisual.Icon;
                        const platformSearch = buildFilterSearch(search, {
                          metacriticMin: activeMetacriticMin,
                          genreSlug: activeGenreSlug,
                          includeGenre: Boolean(activeGenreSlug),
                          includePlatform: false,
                        });
                        const platformIdentityKey = `${platform.id}-${platform.slug}`;
                        const isPlatformActive =
                          activePlatformId === platform.id
                          && (!activePlatformSlug || activePlatformSlug === platform.slug);

                        return (
                          <Link
                            key={platformIdentityKey}
                            to={`/platform/${platform.id}/${platform.slug}${platformSearch}`}
                            onClick={onClose}
                            draggable={false}
                            onDragStart={preventDragStart}
                            className={`sidebar-platforms__item ${
                              isPlatformActive
                                ? "sidebar-platforms__item--active"
                                : "sidebar-platforms__item--idle"
                            }`}
                          >
                            <span className="sidebar-platforms__item-icon-box">
                              <OptionIcon className={optionVisual.toneClass} />
                            </span>

                            <span className="sidebar-platforms__item-name">{platform.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="sidebar-panel__section">
              <h3 className="sidebar-panel__section-title">
                <FaSliders className="sidebar-panel__section-title-icon" />
                  Metacritic
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
                  <span className="sidebar-mc__live">Aggiornamento live</span>
                </div>
              </div>
            </section>

            <section className="sidebar-panel__section">
              <h3 className="sidebar-panel__section-title">
                <FaLayerGroup className="sidebar-panel__section-title-icon" />
                Generi ({genreLinks.length})
              </h3>

              <ul className="sidebar-genres__list">
                {genreLinks.map((genre) => {
                  const genreSearch = buildFilterSearch(search, {
                    metacriticMin: activeMetacriticMin,
                    platformId: activePlatformId,
                    platformSlug: activePlatformSlug,
                    includeGenre: false,
                    includePlatform: Boolean(activePlatformId),
                  });
                  const isGenreActive = activeGenreSlug === genre.slug;

                  return (
                    <li key={genre.slug}>
                      <Link
                        to={`/genre/${genre.slug}${genreSearch}`}
                        className={`sidebar-genres__item-link ${
                          isGenreActive
                            ? "sidebar-genres__item-link--active"
                            : "sidebar-genres__item-link--idle"
                        }`}
                        onClick={onClose}
                      >
                        <span>{genre.name}</span>
                        <span
                          className={`sidebar-genres__status ${
                            isGenreActive
                              ? "sidebar-genres__status--active"
                              : "sidebar-genres__status--idle"
                          }`}
                        >
                          {isGenreActive ? "active" : "open"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {genreLinks.length === 0 && (
                <div className="sidebar-genres__empty">
                  Nessun genere disponibile al momento.
                </div>
              )}
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}
