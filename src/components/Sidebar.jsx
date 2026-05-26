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

const PLATFORM_FAMILIES = [
  {
    id: "sony",
    label: "Sony / PlayStation",
    shortLabel: "PS",
    Icon: FaPlaystation,
    toneClass: "text-[#60a5fa]",
  },
  {
    id: "xbox",
    label: "Xbox",
    shortLabel: "Xbox",
    Icon: FaXbox,
    toneClass: "text-[#34d399]",
  },
  {
    id: "microsoft",
    label: "Windows / PC",
    shortLabel: "PC",
    Icon: FaWindows,
    toneClass: "text-[#93c5fd]",
  },
  {
    id: "nintendo",
    label: "Nintendo",
    shortLabel: "Nintendo",
    Icon: BsNintendoSwitch,
    toneClass: "text-[#fb7185]",
  },
  {
    id: "sega",
    label: "Sega",
    shortLabel: "Sega",
    Icon: SiSega,
    toneClass: "text-[#f59e0b]",
  },
  {
    id: "atari",
    label: "Atari",
    shortLabel: "Atari",
    Icon: SiAtari,
    toneClass: "text-[#a78bfa]",
  },
  {
    id: "apple",
    label: "Apple",
    shortLabel: "Apple",
    Icon: FaApple,
    toneClass: "text-[#e2e8f0]",
  },
  {
    id: "linux",
    label: "Linux / Steam",
    shortLabel: "Linux",
    Icon: FaLinux,
    toneClass: "text-[#cbd5e1]",
  },
  {
    id: "other",
    label: "Altri",
    shortLabel: "Altro",
    Icon: FaLayerGroup,
    toneClass: "text-[#7dd3fc]",
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

  return { Icon: FaGamepad, toneClass: "text-[#7dd3fc]" };
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
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        aria-label="Chiudi menu generi"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside
        className={`absolute left-0 top-0 h-full w-[min(26.5rem,94vw)] overflow-y-auto border-r border-[#67e8f9]/25 bg-[linear-gradient(165deg,rgba(4,12,27,0.97)_0%,rgba(7,18,37,0.98)_46%,rgba(10,31,61,0.94)_100%)] px-5 py-6 shadow-[24px_0_60px_rgba(2,6,23,0.7)] backdrop-blur-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-orbitron text-lg font-black uppercase tracking-[0.2em] text-[#fef08a]"> Filters</h2>
            </div>

            <button
              onClick={onClose}
              aria-label="Chiudi menu"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-[#0d1b35] text-[#94a3b8] transition hover:border-[#fef08a]/30 hover:text-[#fef08a]"
            >
              <FaXmark />
            </button>
          </div>

          <button
            type="button"
            onClick={resetAllFilters}
            disabled={!hasAnyActiveFilters}
            className={`group inline-flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
              hasAnyActiveFilters
                ? "border-[#fef08a]/45 bg-[linear-gradient(120deg,rgba(132,204,22,0.08)_0%,rgba(250,204,21,0.16)_55%,rgba(14,165,233,0.08)_100%)] text-[#fef08a] shadow-[0_0_18px_rgba(254,240,138,0.14)] hover:border-[#fef08a]/70 hover:shadow-[0_0_22px_rgba(254,240,138,0.22)]"
                : "cursor-not-allowed border-[#2a4b72] bg-[#09162b]/80 text-[#7f97b6] opacity-70"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#091a32] text-[#7dd3fc] transition group-hover:text-[#fef08a]">
                <FaSliders className="text-[0.72rem]" />
              </span>
              Filter reset
            </span>

            <span
              className={`inline-flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 text-[0.62rem] font-bold ${
                hasAnyActiveFilters
                  ? "bg-[#fef08a]/20 text-[#fef08a]"
                  : "bg-[#17304e] text-[#8ea6c3]"
              }`}
            >
              {activeFiltersCount}
            </span>
          </button>
        </div>

        <div className="pb-2">
          <div className="space-y-5">
            <section className="space-y-3">
              <h3 className="inline-flex items-center gap-2 font-orbitron text-xs font-bold uppercase tracking-[0.16em] text-[#cbd5e1]">
                <FaGamepad className="text-[#67e8f9]" />
                Piattaforme
              </h3>

              <div className="grid grid-cols-3 gap-2 text-base">
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
                      className={`select-none rounded-xl border px-2 py-2 text-left transition ${
                        !hasOptions
                          ? "cursor-not-allowed border-[#1e3553] bg-[#091427] opacity-45"
                          : isOpenFamily
                            ? "border-[#fef08a]/45 bg-[#10264a]"
                            : "border-[#26466f] bg-[#0b1c34] hover:border-[#67e8f9]/45 hover:bg-[#0e2446]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <FamilyIcon className={family.toneClass} />
                        <span className="text-[0.6rem] font-semibold text-[#7dd3fc]">{familyOptions.length}</span>
                      </span>
                      <span className="mt-1 block text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#cbd5e1]">
                        {family.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {openFamilyId && (
                <div className="rounded-2xl border border-[#2a4f78] bg-[#0a1b34]/85 p-3">
                  {isLoadingPlatforms ? (
                    <div className="rounded-xl border border-[#1b2e4b] bg-[#061024]/70 px-3 py-3 text-xs text-[#64748b]">
                      Caricamento piattaforme...
                    </div>
                  ) : openedFamilyPlatforms.length === 0 ? (
                    <div className="rounded-xl border border-[#1b2e4b] bg-[#061024]/70 px-3 py-3 text-xs text-[#64748b]">
                      Nessuna piattaforma disponibile.
                    </div>
                  ) : (
                    <div className="space-y-2">
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
                            className={`group select-none flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition ${
                              isPlatformActive
                                ? "border-[#fef08a]/55 bg-[#10264a] text-[#fef08a]"
                                : "border-[#203a5f] bg-[#08152b]/80 text-[#dbeafe] hover:border-[#60a5fa]/45 hover:bg-[#0b1b36] hover:text-white"
                            }`}
                          >
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#244369] bg-[#0c1a32]">
                              <OptionIcon className={optionVisual.toneClass} />
                            </span>

                            <span className="truncate transition group-hover:text-white">{platform.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

              <section className="space-y-3">
                <h3 className="inline-flex items-center gap-2 font-orbitron text-xs font-bold uppercase tracking-[0.16em] text-[#cbd5e1]">
                  <FaSliders className="text-[#67e8f9]" />
                  Metacritic
                </h3>

                <div className="rounded-xl border border-[#1f3758] bg-[#081325]/85 px-3 py-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-[#94a3b8]">
                    <span>0</span>
                    <span className="font-semibold text-[#fef08a]">{pendingMetacriticMin}</span>
                    <span>100</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={pendingMetacriticMin}
                    onChange={(event) => setPendingMetacriticMin(Number.parseInt(event.target.value, 10) || 0)}
                    className="w-full accent-[#fef08a]"
                  />

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#7dd3fc]">
                      Aggiornamento live
                    </span>
                  </div>
                </div>
              </section>

            <section className="space-y-3">
              <h3 className="inline-flex items-center gap-2 font-orbitron text-xs font-bold uppercase tracking-[0.16em] text-[#cbd5e1]">
                <FaLayerGroup className="text-[#67e8f9]" />
                Generi ({genreLinks.length})
              </h3>

              <ul className="space-y-2">
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
                        className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                          isGenreActive
                            ? "border-[#fef08a]/55 bg-[#10264a] text-[#fef08a]"
                            : "border-[#1f3758] bg-[#071325]/70 text-[#dbeafe] hover:border-[#fef08a]/35 hover:text-[#fef08a]"
                        }`}
                        onClick={onClose}
                      >
                        <span>{genre.name}</span>
                        <span className={`text-xs ${isGenreActive ? "text-[#fef08a]" : "text-[#64748b]"}`}>
                          {isGenreActive ? "active" : "open"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {genreLinks.length === 0 && (
                <div className="rounded-xl border border-[#1f3758] bg-[#071325]/60 px-3 py-3 text-sm text-[#94a3b8]">
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
