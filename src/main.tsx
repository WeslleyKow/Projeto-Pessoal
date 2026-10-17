import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  Armchair,
  BedDouble,
  Box,
  ChevronRight,
  Download,
  Grid2X2,
  Layers,
  LayoutDashboard,
  Plus,
  RotateCw,
  Save,
  Settings2,
  Trash2,
  Upload,
  Undo2,
  Check,
  Move,
  Package,
  DoorOpen,
  Monitor,
  Copy,
} from "lucide-react";
import "./style.css";
import Extras from "./Extras";
const Room3D = lazy(() => import("./Room3D"));
import { validProject as valid } from "./model";
import type { Item, Project } from "./model";
const initial: Project = {
  width: 360,
  depth: 330,
  confirmed: false,
  items: [
    {
      id: "desk",
      name: "Mesa em L",
      kind: "desk",
      x: 0,
      y: 0,
      w: 160,
      d: 100,
      r: 0,
    },
    {
      id: "bed",
      name: "Cama",
      kind: "bed",
      x: 0,
      y: 115,
      w: 140,
      d: 200,
      r: 0,
    },
    {
      id: "wardrobe",
      name: "Guarda-roupa",
      kind: "wardrobe",
      x: 290,
      y: 125,
      w: 65,
      d: 200,
      r: 0,
    },
    {
      id: "chair",
      name: "Cadeira gamer",
      kind: "chair",
      x: 95,
      y: 63,
      w: 55,
      d: 55,
      r: 0,
    },
    {
      id: "door",
      name: "Porta",
      kind: "door",
      x: 270,
      y: 0,
      w: 80,
      d: 8,
      r: 0,
    },
    {
      id: "window",
      name: "Janela",
      kind: "window",
      x: 155,
      y: 322,
      w: 110,
      d: 8,
      r: 0,
    },
  ],
};
function load() {
  try {
    const p = JSON.parse(localStorage.getItem("quarto-project") || "null");
    return valid(p) ? p : initial;
  } catch {
    return initial;
  }
}
const catalog = [
  ["bed", "Cama", 140, 200],
  ["desk", "Mesa em L", 160, 100],
  ["wardrobe", "Guarda-roupa", 65, 180],
  ["chair", "Cadeira gamer", 55, 55],
  ["shelf", "Estante aberta", 80, 30],
  ["rack", "Rack compacto", 100, 35],
  ["shelf", "Prateleira", 60, 20],
  ["niche", "Nicho", 40, 30],
  ["door", "Porta", 80, 8],
  ["window", "Janela", 100, 8],
  ["custom", "Personalizado", 60, 60],
] as const;
function bounds(i: Item) {
  return {
    x: i.x,
    y: i.y,
    w: i.r % 180 === 0 ? i.w : i.d,
    d: i.r % 180 === 0 ? i.d : i.w,
  };
}
function App() {
  const [p, setP] = useState<Project>(load);
  const [selected, select] = useState("desk");
  const [tab, setTab] = useState("Planta 2D");
  const [toast, setToast] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);
  const [grid, setGrid] = useState(true);
  const [clearance, setClearance] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<Project[]>([]);
  const [compare, setCompare] = useState<Project | null>(() => {
    try {
      const x = JSON.parse(localStorage.getItem("quarto-layout") || "null");
      return valid(x) ? x : null;
    } catch {
      return null;
    }
  });
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    id: string;
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const obj = p.items.find((i) => i.id === selected);
  const say = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 3000);
  };
  useEffect(() => {
    try {
      localStorage.setItem("quarto-project", JSON.stringify(p));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
      say("Não foi possível salvar neste navegador. Exporte o JSON.");
    }
  }, [p]);
  const change = (next: Project) => {
    setHistory((h) => [...h.slice(-29), p]);
    setP(next);
  };
  const update = (v: Partial<Item>) =>
    obj &&
    change({
      ...p,
      items: p.items.map((i) => (i.id === obj.id ? { ...i, ...v } : i)),
    });
  const add = (c: (typeof catalog)[number]) => {
    const id = crypto.randomUUID();
    change({
      ...p,
      items: [
        ...p.items,
        {
          id,
          kind: c[0],
          name: c[1],
          x: Math.max(0, p.width / 2 - c[2] / 2),
          y: Math.max(0, p.depth / 2 - c[3] / 2),
          w: c[2],
          d: c[3],
          r: 0,
        },
      ],
    });
    select(id);
  };
  const solids = p.items.filter((i) => !["door", "window"].includes(i.kind));
  const collisions = solids.flatMap((a, n) =>
    solids
      .slice(n + 1)
      .filter((b) => {
        const A = bounds(a),
          B = bounds(b);
        return (
          A.x < B.x + B.w &&
          A.x + A.w > B.x &&
          A.y < B.y + B.d &&
          A.y + A.d > B.y
        );
      })
      .map((b) => `${a.name} e ${b.name}`),
  );
  const outside = p.items.filter((i) => {
    const b = bounds(i);
    return b.x < 0 || b.y < 0 || b.x + b.w > p.width || b.y + b.d > p.depth;
  });
  const download = (data: Blob, name: string) => {
    const u = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
  const point = (e: React.PointerEvent) => {
    const s = svg.current!;
    const q = s.createSVGPoint();
    q.x = e.clientX;
    q.y = e.clientY;
    return q.matrixTransform(s.getScreenCTM()!.inverse());
  };
  return (
    <div className="app">
      <aside className="rail">
        <div className="logo">
          <Box size={25} />
        </div>
        <button
          className="rail-active"
          title="Planejador"
          onClick={() => setTab("Planta 2D")}
        >
          <LayoutDashboard />
        </button>
        <button title="Catálogo" onClick={() => setTab("Catálogo")}>
          <Package />
        </button>
        <button title="Comparar layouts" onClick={() => setTab("Layouts")}>
          <Layers />
        </button>
        <span className="rail-bottom">WK</span>
      </aside>
      <div className="shell">
        <header>
          <div>
            <span className="breadcrumb">
              MEUS PROJETOS <ChevronRight size={12} /> QUARTO ATUAL
            </span>
            <h1>
              Meu Quarto <span>Nerd</span>
              <span className="badge">PROJETO PESSOAL</span>
            </h1>
          </div>
          <div className="header-actions">
            <span className="saved">
              <Check size={14} />{" "}
              {saveFailed
                ? "Falha ao salvar — exporte JSON"
                : "Salvo neste navegador"}
            </span>
            <button onClick={() => file.current?.click()}>
              <Upload size={16} /> Importar
            </button>
            <button
              className="primary"
              onClick={() =>
                download(
                  new Blob([JSON.stringify(p, null, 2)], {
                    type: "application/json",
                  }),
                  "meu-quarto.json",
                )
              }
            >
              <Download size={16} /> Exportar projeto
            </button>
          </div>
        </header>
        <nav>
          {[
            "Planta 2D",
            "Paredes",
            "Coleção",
            "3D",
            "Orçamento",
            "Catálogo",
            "Layouts",
          ].map((t) => (
            <button
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
              key={t}
            >
              {t === "Planta 2D" ? (
                <Grid2X2 size={16} />
              ) : t === "Catálogo" ? (
                <Armchair size={16} />
              ) : (
                <Layers size={16} />
              )}{" "}
              {t}
            </button>
          ))}
          <span className="phase">
            SEU PROJETO <i /> Planeje seu espaço
          </span>
        </nav>
        <div className="notice">
          <span>✦</span>
          <div>
            <strong>Seu quarto, do seu jeito.</strong> O croqui define a
            disposição inicial. As medidas são exemplos — ajuste com as medidas
            reais antes de comprar.
          </div>
          <span className="draft">
            {p.confirmed ? "MEDIDAS INFORMADAS" : "MEDIDAS A CONFIRMAR"}
          </span>
        </div>
        {["Paredes", "Coleção", "Orçamento"].includes(tab) ? (
          <Extras project={p} change={change} mode={tab} />
        ) : tab === "3D" ? (
          <Suspense
            fallback={
              <section className="page">Preparando visualização 3D…</section>
            }
          >
            <Room3D project={p} />
          </Suspense>
        ) : tab === "Catálogo" ? (
          <section className="page">
            <h2>Um lugar para cada ideia.</h2>
            <p>Adicione um móvel e ajuste suas medidas na planta.</p>
            <div className="catalog-grid">
              {catalog.map((c, n) => (
                <button
                  key={n}
                  onClick={() => {
                    add(c);
                    setTab("Planta 2D");
                  }}
                >
                  <Box />
                  <h3>{c[1]}</h3>
                  <span>Dimensões editáveis · exemplo</span>
                  <Plus />
                </button>
              ))}
            </div>
          </section>
        ) : tab === "Layouts" ? (
          <section className="page">
            <h2>Explore outras possibilidades</h2>
            <p>
              Guarde uma versão para comparar e continue experimentando. As
              medidas são {p.confirmed ? "informadas por você" : "ilustrativas"}
              .
            </p>
            <div className="layout-card">
              <Layers />
              <h3>Distribuição atual</h3>
              <svg
                viewBox={`-5 -5 ${p.width + 10} ${p.depth + 10}`}
                style={{ width: 180, height: 150 }}
              >
                <rect
                  width={p.width}
                  height={p.depth}
                  fill="#111827"
                  stroke="#7d8aa0"
                />
                {p.items.map((i) => {
                  const b = bounds(i);
                  return (
                    <rect
                      key={i.id}
                      x={b.x}
                      y={b.y}
                      width={b.w}
                      height={b.d}
                      fill={i.kind === "bed" ? "#60799e" : "#88769a"}
                      stroke="#c6b7d8"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
              <p>
                {p.items.length} objetos · {p.width} × {p.depth} cm
              </p>
              <button
                className="primary"
                onClick={() => {
                  setCompare(structuredClone(p));
                  localStorage.setItem("quarto-layout", JSON.stringify(p));
                  say("Versão de comparação salva");
                }}
              >
                <Save size={16} /> Guardar versão
              </button>
            </div>
            {compare && (
              <div className="layout-card">
                <h3>Versão guardada</h3>
                <svg
                  viewBox={`-5 -5 ${compare.width + 10} ${compare.depth + 10}`}
                  style={{ width: 180, height: 150 }}
                >
                  <rect
                    width={compare.width}
                    height={compare.depth}
                    fill="#111827"
                    stroke="#7d8aa0"
                  />
                  {compare.items.map((i) => {
                    const b = bounds(i);
                    return (
                      <rect
                        key={i.id}
                        x={b.x}
                        y={b.y}
                        width={b.w}
                        height={b.d}
                        fill={i.kind === "bed" ? "#60799e" : "#88769a"}
                        stroke="#c6b7d8"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>
                <p>
                  {compare.items.length} objetos · {compare.width} ×{" "}
                  {compare.depth} cm
                </p>
                <p>
                  {JSON.stringify(compare) === JSON.stringify(p)
                    ? "Igual ao layout atual"
                    : "Há alterações em relação ao layout atual"}
                </p>
                <button
                  onClick={() => {
                    change(structuredClone(compare));
                    setTab("Planta 2D");
                  }}
                >
                  Restaurar versão
                </button>
              </div>
            )}
          </section>
        ) : (
          <main>
            <aside className="tools">
              <div className="panel-title">
                SEU AMBIENTE <Settings2 size={14} />
              </div>
              <h3>Dimensões do quarto</h3>
              <div className="two">
                {(["width", "depth"] as const).map((k, n) => (
                  <label key={k}>
                    {n ? "Comprimento" : "Largura"}
                    <div className="input-unit">
                      <input
                        type="number"
                        min="100"
                        max="2000"
                        value={p[k]}
                        onChange={(e) => {
                          const v = +e.target.value;
                          if (v >= 100 && v <= 2000)
                            change({ ...p, [k]: v, confirmed: false });
                        }}
                      />
                      <span>cm</span>
                    </div>
                  </label>
                ))}
              </div>
              <label className="confirm">
                <input
                  type="checkbox"
                  checked={p.confirmed}
                  onChange={(e) =>
                    change({ ...p, confirmed: e.target.checked })
                  }
                />{" "}
                Conferi as medidas reais
              </label>
              <div className="divider" />
              <div className="panel-title">
                ADICIONAR MÓVEL <Plus size={14} />
              </div>
              <div className="quick-catalog">
                {catalog.slice(0, 8).map((c, n) => (
                  <button key={n} onClick={() => add(c)}>
                    {n === 0 ? (
                      <BedDouble />
                    ) : n === 3 ? (
                      <Armchair />
                    ) : n === 1 ? (
                      <Monitor />
                    ) : (
                      <Box />
                    )}
                    <span>{c[1]}</span>
                    <Plus size={13} />
                  </button>
                ))}
              </div>
              <button className="all" onClick={() => setTab("Catálogo")}>
                Ver catálogo completo <ChevronRight size={14} />
              </button>
              <div className="divider" />
              <div className="panel-title">
                OBJETOS NA PLANTA{" "}
                <span>{p.items.length.toString().padStart(2, "0")}</span>
              </div>
              <div className="object-list">
                {p.items.map((i) => (
                  <button
                    className={selected === i.id ? "chosen" : ""}
                    key={i.id}
                    onClick={() => select(i.id)}
                  >
                    <span className={"dot " + i.kind} />
                    {i.name}
                    <ChevronRight size={13} />
                  </button>
                ))}
              </div>
              <div className="tip">
                <span>✧</span>
                <strong>Espaço para crescer</strong>
                <p>
                  Reserve a área próxima à porta para uma estante modular de
                  colecionáveis.
                </p>
              </div>
            </aside>
            <section className="workspace">
              <div className="canvas-toolbar">
                <div>
                  <strong>Distribuição desejada</strong>
                  <span>Vista superior · unidade em cm</span>
                </div>
                <div>
                  <button
                    title="Desfazer"
                    disabled={!history.length}
                    onClick={() => {
                      setP(history[history.length - 1]);
                      setHistory(history.slice(0, -1));
                    }}
                  >
                    <Undo2 size={16} />
                  </button>
                  <button
                    title="Alternar grade"
                    className={grid ? "on" : ""}
                    onClick={() => setGrid(!grid)}
                  >
                    <Grid2X2 size={16} />
                  </button>
                  <button
                    title="Exportar planta SVG"
                    onClick={() => {
                      if (svg.current)
                        download(
                          new Blob(
                            [
                              new XMLSerializer().serializeToString(
                                svg.current,
                              ),
                            ],
                            { type: "image/svg+xml" },
                          ),
                          "planta.svg",
                        );
                    }}
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <div className="drawing">
                <div className="canvas-wrap" style={{ width: `${zoom}%` }}>
                  <svg
                    ref={svg}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={`-35 -38 ${p.width + 70} ${p.depth + 85}`}
                    onPointerMove={(e) => {
                      if (!drag.current) return;
                      const q = point(e),
                        d = drag.current;
                      setP((v) => ({
                        ...v,
                        items: v.items.map((i) =>
                          i.id === d.id
                            ? {
                                ...i,
                                x: Math.round((d.ox + q.x - d.x) / 5) * 5,
                                y: Math.round((d.oy + q.y - d.y) / 5) * 5,
                              }
                            : i,
                        ),
                      }));
                    }}
                    onPointerUp={() => {
                      drag.current = null;
                    }}
                    onPointerCancel={() => (drag.current = null)}
                  >
                    <defs>
                      <pattern
                        id="grid"
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 10 0 L 0 0 0 10"
                          fill="none"
                          stroke="#2b3549"
                          strokeWidth=".35"
                        />
                      </pattern>
                    </defs>
                    <rect
                      x="0"
                      y="0"
                      width={p.width}
                      height={p.depth}
                      fill="#171f2e"
                      stroke="#7e8ba1"
                      strokeWidth="3"
                    />
                    {grid && (
                      <rect
                        width={p.width}
                        height={p.depth}
                        fill="url(#grid)"
                      />
                    )}
                    <g stroke="#53617b" strokeWidth=".7">
                      <path
                        d={`M0 -15 V-25 M0 -20 H${p.width} M${p.width} -15 V-25 M-15 0 H-25 M-20 0 V${p.depth} M-15 ${p.depth} H-25`}
                      />
                    </g>
                    <g fill="#93a0b8" fontSize="8" textAnchor="middle">
                      <text x={p.width / 2} y="-25">
                        {p.width} cm
                      </text>
                      <text
                        transform={`translate(-26 ${p.depth / 2}) rotate(-90)`}
                      >
                        {p.depth} cm
                      </text>
                    </g>
                    {clearance &&
                      solids.map((i) => {
                        const b = bounds(i);
                        return (
                          <rect
                            key={i.id}
                            x={b.x - 60}
                            y={b.y - 60}
                            width={b.w + 120}
                            height={b.d + 120}
                            fill="#d4a451"
                            fillOpacity=".035"
                            stroke="#d4a451"
                            strokeWidth=".5"
                            strokeDasharray="3 3"
                          />
                        );
                      })}
                    {p.items.map((i) => (
                      <g
                        key={i.id}
                        transform={`translate(${i.x} ${i.y})`}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          select(i.id);
                          setHistory((h) => [
                            ...h.slice(-29),
                            structuredClone(p),
                          ]);
                          const q = point(e);
                          drag.current = {
                            id: i.id,
                            x: q.x,
                            y: q.y,
                            ox: i.x,
                            oy: i.y,
                          };
                          e.currentTarget.setPointerCapture(e.pointerId);
                        }}
                        style={{ cursor: "grab" }}
                      >
                        <g
                          transform={
                            i.r === 90
                              ? `translate(${i.d} 0) rotate(90)`
                              : i.r === 180
                                ? `translate(${i.w} ${i.d}) rotate(180)`
                                : i.r === 270
                                  ? `translate(0 ${i.w}) rotate(270)`
                                  : undefined
                          }
                        >
                          {i.kind === "desk" ? (
                            <path
                              d={`M0 0 H${i.w} V${i.d * 0.42} H${i.w * 0.4} V${i.d} H0 Z`}
                              fill="#66563f"
                              stroke="#c4a675"
                              strokeWidth="1.2"
                            />
                          ) : (
                            <rect
                              width={i.w}
                              height={i.d}
                              rx={i.kind === "chair" ? 10 : 2}
                              fill={
                                i.kind === "bed"
                                  ? "#354665"
                                  : i.kind === "wardrobe"
                                    ? "#4a405a"
                                    : i.kind === "chair"
                                      ? "#3e435a"
                                      : i.kind === "door"
                                        ? "#72b5a2"
                                        : i.kind === "window"
                                          ? "#6eb6d5"
                                          : "#4a604f"
                              }
                              stroke={selected === i.id ? "#a399ff" : "#8c96af"}
                              strokeWidth="1"
                            />
                          )}
                          {i.kind === "bed" && (
                            <>
                              <rect
                                x="6"
                                y="8"
                                width={i.w - 12}
                                height={i.d * 0.2}
                                rx="5"
                                fill="#8292ac"
                              />
                              <path
                                d={`M5 ${i.d * 0.35} H${i.w - 5}`}
                                stroke="#7f91b0"
                                strokeWidth="2"
                              />
                              <rect
                                x="6"
                                y={i.d * 0.38}
                                width={i.w - 12}
                                height={i.d * 0.55}
                                rx="2"
                                fill="#425678"
                              />
                            </>
                          )}
                          {i.kind === "wardrobe" && (
                            <>
                              <path
                                d={`M0 ${i.d / 2} H${i.w}`}
                                stroke="#9b87ad"
                              />
                              <path
                                d={`M${i.w - 10} ${i.d / 2 - 20} v12 m0 16 v12`}
                                stroke="#c4adcf"
                                strokeWidth="2"
                              />
                            </>
                          )}
                          {i.kind === "desk" && (
                            <>
                              <rect
                                x={i.w * 0.38}
                                y="7"
                                width={i.w * 0.35}
                                height="15"
                                rx="2"
                                fill="#15202f"
                                stroke="#939eb2"
                              />
                              <rect
                                x={i.w * 0.44}
                                y="26"
                                width={i.w * 0.23}
                                height="7"
                                rx="1"
                                fill="#b1a18b"
                              />
                            </>
                          )}
                          {i.kind === "door" && (
                            <path
                              d={`M0 0 V${i.w} A${i.w} ${i.w} 0 0 0 ${i.w} 0`}
                              fill="#78cbb1"
                              fillOpacity=".06"
                              stroke="#78cbb1"
                              strokeWidth=".8"
                              strokeDasharray="3 3"
                            />
                          )}
                          <text
                            x={i.w / 2}
                            y={i.kind === "desk" ? i.d * 0.27 : i.d / 2 + 3}
                            textAnchor="middle"
                            fontSize="8"
                            fill="#eef0fa"
                            style={{ pointerEvents: "none" }}
                          >
                            {i.name}
                          </text>
                        </g>
                        {selected === i.id && (
                          <rect
                            x="-3"
                            y="-3"
                            width={bounds(i).w + 6}
                            height={bounds(i).d + 6}
                            fill="none"
                            stroke="#9f8bff"
                            strokeWidth="1.3"
                            strokeDasharray="4 2"
                          />
                        )}
                      </g>
                    ))}
                    <text
                      x={p.width / 2}
                      y={p.depth + 28}
                      textAnchor="middle"
                      fill="#76839b"
                      fontSize="7"
                    >
                      {p.confirmed
                        ? "DIMENSÕES INFORMADAS PELO USUÁRIO"
                        : "ESTUDO ILUSTRATIVO · CONFIRME TODAS AS MEDIDAS"}
                    </text>
                  </svg>
                </div>
              </div>
              <div className="canvas-bottom">
                <span>
                  <Move size={14} /> Arraste para mover · selecione para editar
                </span>
                <div>
                  <button onClick={() => setZoom(Math.max(60, zoom - 10))}>
                    −
                  </button>
                  <span>{zoom}%</span>
                  <button onClick={() => setZoom(Math.min(160, zoom + 10))}>
                    +
                  </button>
                </div>
              </div>
              <div className="checks">
                <div>
                  <span className="status-dot" />
                  <strong>Antes de reorganizar</strong>
                </div>
                <p>
                  {!p.confirmed
                    ? "Informe as medidas reais para avaliar o espaço disponível."
                    : `${collisions.length} sobreposição(ões) · ${outside.length} objeto(s) fora do quarto.`}
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={clearance}
                    onChange={(e) => setClearance(e.target.checked)}
                  />{" "}
                  Mostrar faixa ilustrativa de 60 cm
                </label>
                <small>
                  A faixa é uma referência visual. Confira cadeira, portas e
                  gavetas abertas no local.
                </small>
              </div>
            </section>
            <aside className="properties">
              <div className="panel-title">
                PROPRIEDADES <Settings2 size={14} />
              </div>
              {obj ? (
                <>
                  <div className="selected-icon">
                    {obj.kind === "bed" ? (
                      <BedDouble size={30} />
                    ) : (
                      <Box size={30} />
                    )}
                  </div>
                  <h2>{obj.name}</h2>
                  <span className="subtle">Objeto selecionado</span>
                  <div className="divider" />
                  <label>
                    Nome
                    <input
                      value={obj.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </label>
                  <h4>DIMENSÕES</h4>
                  <div className="two">
                    {(["w", "d"] as const).map((k, n) => (
                      <label key={k}>
                        {n ? "Profundidade" : "Largura"}
                        <div className="input-unit">
                          <input
                            type="number"
                            min="1"
                            max="2000"
                            value={obj[k]}
                            onChange={(e) => {
                              if (
                                +e.target.value > 0 &&
                                +e.target.value <= 2000
                              )
                                update({ [k]: +e.target.value });
                            }}
                          />
                          <span>cm</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <label className="height-field">
                    Altura do móvel (cm) · exemplo se não informado
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={
                        obj.h ??
                        ({
                          bed: 50,
                          desk: 75,
                          wardrobe: 210,
                          chair: 110,
                          shelf: 180,
                          rack: 55,
                          niche: 40,
                          door: 210,
                          window: 110,
                        }[obj.kind] ||
                          70)
                      }
                      onChange={(e) => {
                        const h = +e.target.value;
                        if (h >= 1 && h <= 1000) update({ h });
                      }}
                    />
                  </label>
                  <h4>POSIÇÃO</h4>
                  <div className="two">
                    {(["x", "y"] as const).map((k) => (
                      <label key={k}>
                        Eixo {k.toUpperCase()}
                        <div className="input-unit">
                          <input
                            type="number"
                            value={obj[k]}
                            onChange={(e) => update({ [k]: +e.target.value })}
                          />
                          <span>cm</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    className="rotate"
                    onClick={() => update({ r: (obj.r + 90) % 360 })}
                  >
                    <RotateCw size={16} /> Girar 90° <span>{obj.r}°</span>
                  </button>
                  <div className="divider" />
                  <div className="selection-actions">
                    <button
                      onClick={() => {
                        const id = crypto.randomUUID();
                        change({
                          ...p,
                          items: [
                            ...p.items,
                            {
                              ...obj,
                              id,
                              x: obj.x + 10,
                              y: obj.y + 10,
                              name: obj.name + " (cópia)",
                            },
                          ],
                        });
                        select(id);
                      }}
                    >
                      <Copy size={15} /> Duplicar
                    </button>
                    <button
                      className="danger"
                      onClick={() => {
                        change({
                          ...p,
                          items: p.items.filter((i) => i.id !== obj.id),
                        });
                        select("");
                      }}
                    >
                      <Trash2 size={15} /> Excluir
                    </button>
                  </div>
                </>
              ) : (
                <p className="subtle">
                  Selecione um móvel na planta para editar.
                </p>
              )}
              <div className="observation">
                <strong>◈ Pontos de atenção</strong>
                {collisions.map((c, n) => (
                  <p key={n}>Sobreposição: {c}.</p>
                ))}
                {outside.map((i) => (
                  <p key={i.id}>{i.name} ultrapassa a parede.</p>
                ))}
                {!collisions.length && !outside.length && (
                  <p>Sem sobreposições retangulares detectadas.</p>
                )}
                <p>
                  A mesa em L usa limites retangulares na detecção; o recorte
                  pode gerar um alerta conservador.
                </p>
                <p>
                  Verifique o giro da porta e o acesso ao guarda-roupa. Não foi
                  confirmada a capacidade de carga de prateleiras.
                </p>
              </div>
            </aside>
          </main>
        )}
        <footer>
          <span>
            <span className="footer-dot" /> MEU QUARTO NERD
          </span>
          <span>Planejar primeiro. Transformar depois.</span>
          <span>Armazenamento local · v1.0</span>
        </footer>
      </div>
      <input
        type="file"
        ref={file}
        hidden
        accept="application/json,.json"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            const v = JSON.parse(await f.text());
            if (!valid(v)) throw Error();
            change(v);
            select("");
            say("Projeto importado");
          } catch {
            say(
              "Arquivo inválido. Importe um projeto JSON exportado pelo editor.",
            );
          }
          e.target.value = "";
        }}
      />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
