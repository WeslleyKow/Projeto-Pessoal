import { useState, useRef } from "react";
import type {
  Project,
  Extras as Data,
  Shelf,
  Collectible,
  Purchase,
} from "./model";
import { defaults, money, safeUrl } from "./model";
import { Plus, Trash2, Box, ShoppingBag, ImagePlus } from "lucide-react";
type Props = { project: Project; change: (p: Project) => void; mode: string };
function Num({
  label,
  value,
  onChange,
  min = 1,
  max = 2000,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = +e.target.value;
          if (n >= min && n <= max) onChange(n);
        }}
      />
    </label>
  );
}
export default function Extras({ project, change, mode }: Props) {
  const d = project.extras || defaults;
  const set = (v: Partial<Data>) =>
    change({ ...project, extras: { ...d, ...v } });
  const [sid, select] = useState("");
  const [wall, setWall] = useState("Superior");
  const [error, setError] = useState("");
  const ref = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    id: string;
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const shelf = d.shelves.find((s) => s.id === sid);
  const edit = (v: Partial<Shelf>) =>
    set({ shelves: d.shelves.map((s) => (s.id === sid ? { ...s, ...v } : s)) });
  const collect = (id: string, v: Partial<Collectible>) =>
    set({
      collection: d.collection.map((c) => (c.id === id ? { ...c, ...v } : c)),
    });
  const purchase = (id: string, v: Partial<Purchase>) =>
    set({
      purchases: d.purchases.map((c) => (c.id === id ? { ...c, ...v } : c)),
    });
  const point = (e: React.PointerEvent) => {
    const q = ref.current!.createSVGPoint();
    q.x = e.clientX;
    q.y = e.clientY;
    return q.matrixTransform(ref.current!.getScreenCTM()!.inverse());
  };
  if (mode === "Orçamento")
    return (
      <section className="page">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DO PLANO À REALIDADE</span>
            <h2>Invista no que faz sentido.</h2>
            <p>Reaproveite primeiro. Planeje suas compras no seu ritmo.</p>
          </div>
          <button
            className="primary"
            onClick={() =>
              set({
                purchases: [
                  ...d.purchases,
                  {
                    id: crypto.randomUUID(),
                    name: "Novo item",
                    qty: 1,
                    price: 0,
                    url: "",
                    priority: "Essencial",
                    status: "Planejado",
                  },
                ],
              })
            }
          >
            <Plus size={16} />
            Adicionar compra
          </button>
        </div>
        <div className="stats">
          {[
            [
              "Total estimado",
              d.purchases.reduce((t, i) => t + i.qty * i.price, 0),
            ],
            [
              "Essenciais",
              d.purchases
                .filter((i) => i.priority === "Essencial")
                .reduce((t, i) => t + i.qty * i.price, 0),
            ],
            [
              "Melhorias futuras",
              d.purchases
                .filter((i) => i.priority === "Futura")
                .reduce((t, i) => t + i.qty * i.price, 0),
            ],
            [
              "Já comprado / instalado",
              d.purchases
                .filter((i) => i.status !== "Planejado")
                .reduce((t, i) => t + i.qty * i.price, 0),
            ],
          ].map(([t, v]) => (
            <div key={t}>
              <span>{t}</span>
              <strong>{money(Number(v))}</strong>
            </div>
          ))}
        </div>
        {!d.purchases.length ? (
          <div className="empty">
            <ShoppingBag size={40} />
            <h3>Uma transformação, uma compra por vez.</h3>
            <p>
              Adicione móveis, fixadores e acessórios. Valores são informados
              por você.
            </p>
          </div>
        ) : (
          <div className="purchase-list">
            {d.purchases.map((b) => (
              <article className="purchase" key={b.id}>
                <label>
                  Item
                  <input
                    aria-label="Nome da compra"
                    value={b.name}
                    onChange={(e) => purchase(b.id, { name: e.target.value })}
                  />
                </label>
                <Num
                  label="Quantidade"
                  value={b.qty}
                  max={999}
                  onChange={(qty) => purchase(b.id, { qty })}
                />
                <Num
                  label="Valor unitário (R$)"
                  value={b.price}
                  min={0}
                  max={1000000}
                  onChange={(price) => purchase(b.id, { price })}
                />
                <label>
                  Prioridade
                  <select
                    value={b.priority}
                    onChange={(e) =>
                      purchase(b.id, { priority: e.target.value })
                    }
                  >
                    <option>Essencial</option>
                    <option>Futura</option>
                  </select>
                </label>
                <label>
                  Status
                  <select
                    value={b.status}
                    onChange={(e) => purchase(b.id, { status: e.target.value })}
                  >
                    <option>Planejado</option>
                    <option>Comprado</option>
                    <option>Instalado</option>
                  </select>
                </label>
                <label>
                  Link da loja
                  <input
                    type="url"
                    placeholder="https://…"
                    value={b.url}
                    onChange={(e) => purchase(b.id, { url: e.target.value })}
                  />
                </label>
                <strong>{money(b.qty * b.price)}</strong>
                {safeUrl(b.url) && (
                  <a href={safeUrl(b.url)} target="_blank" rel="noreferrer">
                    Ver loja ↗
                  </a>
                )}
                <button
                  title="Excluir compra"
                  onClick={() =>
                    set({ purchases: d.purchases.filter((i) => i.id !== b.id) })
                  }
                >
                  <Trash2 size={15} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  if (mode === "Coleção")
    return (
      <section className="page">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SEU UNIVERSO PARTICULAR</span>
            <h2>Cada peça tem uma história.</h2>
            <p>
              Organize Naruto, Nerd ao Cubo, impressões 3D e suas próximas
              descobertas.
            </p>
          </div>
          <button
            className="primary"
            onClick={() =>
              set({
                collection: [
                  ...d.collection,
                  {
                    id: crypto.randomUUID(),
                    name: "Novo colecionável",
                    category: "Nerd ao Cubo",
                    w: 10,
                    h: 15,
                    d: 10,
                    location: "",
                  },
                ],
              })
            }
          >
            <Plus size={16} />
            Adicionar peça
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
        <div className="collection-grid">
          {d.collection.map((c) => (
            <article key={c.id} className="collection-card">
              <div className="photo">
                {c.photo ? (
                  <img src={c.photo} alt={c.name} />
                ) : (
                  <Box size={45} />
                )}
                <label className="photo-upload">
                  <ImagePlus size={17} />
                  <input
                    aria-label="Foto da peça"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (
                        f.size > 1000000 ||
                        !["image/png", "image/jpeg", "image/webp"].includes(
                          f.type,
                        )
                      ) {
                        setError("Use uma foto PNG, JPEG ou WebP de até 1 MB.");
                        return;
                      }
                      const r = new FileReader();
                      r.onload = () => {
                        collect(c.id, { photo: String(r.result) });
                        setError("");
                      };
                      r.readAsDataURL(f);
                    }}
                  />
                </label>
              </div>
              <label>
                Nome
                <input
                  value={c.name}
                  onChange={(e) => collect(c.id, { name: e.target.value })}
                />
              </label>
              <label>
                Categoria / franquia
                <input
                  value={c.category}
                  onChange={(e) => collect(c.id, { category: e.target.value })}
                />
              </label>
              <div className="three">
                {(["w", "h", "d"] as const).map((k, n) => (
                  <Num
                    key={k}
                    label={["Larg. cm", "Alt. cm", "Prof. cm"][n]}
                    value={c[k]}
                    max={1000}
                    onChange={(v) => collect(c.id, { [k]: v })}
                  />
                ))}
              </div>
              <label>
                Local de exposição
                <select
                  value={c.location}
                  onChange={(e) => collect(c.id, { location: e.target.value })}
                >
                  <option value="">A definir</option>
                  {d.shelves.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name} · {s.wall}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="danger"
                onClick={() =>
                  set({ collection: d.collection.filter((i) => i.id !== c.id) })
                }
              >
                <Trash2 size={15} />
                Excluir peça
              </button>
            </article>
          ))}
        </div>
        {!d.collection.length && (
          <div className="empty">
            <Box size={40} />
            <h3>O próximo capítulo da sua coleção.</h3>
            <p>
              Cadastre uma peça e escolha uma prateleira no planejador de
              paredes.
            </p>
          </div>
        )}
      </section>
    );
  const visible = d.shelves.filter((s) => s.wall === wall);
  const monitorX = Math.max(0, (d.wallWidth - d.monitorWidth) / 2);
  return (
    <section className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">EXPANDA SEU UNIVERSO</span>
          <h2>Uma parede cheia de possibilidades.</h2>
          <p>
            Elevação frontal · centímetros · alturas medidas a partir do piso.
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            const id = crypto.randomUUID();
            set({
              shelves: [
                ...d.shelves,
                {
                  id,
                  name: "Prateleira " + (d.shelves.length + 1),
                  wall,
                  x: 20,
                  y: 160,
                  w: 60,
                  d: 20,
                },
              ],
            });
            select(id);
          }}
        >
          <Plus size={16} />
          Adicionar prateleira
        </button>
      </div>
      <div className="wall-editor">
        <div className="wall-canvas">
          <div className="wall-tabs">
            {["Superior", "Esquerda", "Direita", "Inferior"].map((w) => (
              <button
                className={wall === w ? "on" : ""}
                key={w}
                onClick={() => {
                  setWall(w);
                  select("");
                }}
              >
                {w}
              </button>
            ))}
          </div>
          <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`-25 -25 ${d.wallWidth + 50} ${d.wallHeight + 55}`}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const q = point(e),
                g = drag.current;
              set({
                shelves: d.shelves.map((s) =>
                  s.id === g.id
                    ? {
                        ...s,
                        x: Math.max(0, Math.round(g.ox + q.x - g.x)),
                        y: Math.max(0, Math.round(g.oy - (q.y - g.y))),
                      }
                    : s,
                ),
              });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            style={{ touchAction: "none" }}
          >
            <defs>
              <pattern
                id="wallgrid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M10 0H0V10"
                  stroke="#334058"
                  strokeWidth=".3"
                  fill="none"
                />
              </pattern>
            </defs>
            <rect
              width={d.wallWidth}
              height={d.wallHeight}
              fill="#171f2e"
              stroke="#687892"
            />
            <rect
              width={d.wallWidth}
              height={d.wallHeight}
              fill="url(#wallgrid)"
            />
            <text
              x={d.wallWidth / 2}
              y="-10"
              textAnchor="middle"
              fill="#a6b2c5"
              fontSize="8"
            >
              {d.wallWidth} cm · parede {wall.toLowerCase()}
            </text>
            {wall === "Superior" && (
              <>
                <rect
                  x={monitorX}
                  y={d.wallHeight - d.monitorHeight}
                  width={d.monitorWidth}
                  height={d.monitorHeight}
                  fill="#687bb2"
                  fillOpacity=".12"
                  stroke="#7188b9"
                  strokeDasharray="4 3"
                />
                <text
                  x={monitorX + 5}
                  y={d.wallHeight - 7}
                  fill="#8192b1"
                  fontSize="7"
                >
                  Área reservada: mesa + monitores
                </text>
              </>
            )}
            {visible.map((s) => {
              let offset = 0;
              const pieces = d.collection.filter((c) => c.location === s.id);
              return (
                <g
                  key={s.id}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    select(s.id);
                    const q = point(e);
                    drag.current = {
                      id: s.id,
                      x: q.x,
                      y: q.y,
                      ox: s.x,
                      oy: s.y,
                    };
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }}
                  style={{ cursor: "grab" }}
                >
                  <rect
                    x={s.x}
                    y={d.wallHeight - s.y}
                    width={s.w}
                    height="4"
                    fill="#be9d75"
                    stroke={sid === s.id ? "#c4a9ff" : "#e1c49e"}
                    strokeWidth={sid === s.id ? 2 : 1}
                  />
                  <text
                    x={s.x}
                    y={d.wallHeight - s.y + 13}
                    fill="#abb8ce"
                    fontSize="7"
                  >
                    {s.name} · {s.y} cm do piso
                  </text>
                  {pieces.map((c) => {
                    const x = s.x + offset;
                    offset += c.w + 2;
                    return (
                      <g key={c.id}>
                        <rect
                          x={x}
                          y={d.wallHeight - s.y - c.h}
                          width={c.w}
                          height={c.h}
                          fill={
                            offset > s.w + 2 || c.d > s.d
                              ? "#c7757b"
                              : "#a998d8"
                          }
                          stroke="#e1d0ff"
                          strokeWidth=".5"
                        />
                        <title>
                          {c.name}: {c.w} × {c.h} × {c.d} cm
                        </title>
                      </g>
                    );
                  })}
                </g>
              );
            })}
            <text
              x={d.wallWidth / 2}
              y={d.wallHeight + 20}
              fill="#8391a9"
              fontSize="8"
              textAnchor="middle"
            >
              PISO · medidas ilustrativas até você conferir no local
            </text>
          </svg>
        </div>
        <aside className="wall-controls">
          <h3>Dimensões da elevação</h3>
          <div className="two">
            <Num
              label="Largura (cm)"
              value={d.wallWidth}
              min={100}
              onChange={(wallWidth) => set({ wallWidth })}
            />
            <Num
              label="Altura (cm)"
              value={d.wallHeight}
              min={100}
              max={1000}
              onChange={(wallHeight) => set({ wallHeight })}
            />
          </div>
          <h3>Reserva dos equipamentos</h3>
          <div className="two">
            <Num
              label="Largura (cm)"
              value={d.monitorWidth}
              min={0}
              max={1000}
              onChange={(monitorWidth) => set({ monitorWidth })}
            />
            <Num
              label="Altura do piso (cm)"
              value={d.monitorHeight}
              min={0}
              max={1000}
              onChange={(monitorHeight) => set({ monitorHeight })}
            />
          </div>
          <h3>Prateleiras nesta parede</h3>
          {visible.map((s) => (
            <button
              key={s.id}
              className="shelf-select"
              onClick={() => select(s.id)}
            >
              {s.name} · {s.w} cm
            </button>
          ))}
          {shelf && (
            <>
              <label>
                Nome
                <input
                  value={shelf.name}
                  onChange={(e) => edit({ name: e.target.value })}
                />
              </label>
              <div className="two">
                <Num
                  label="Largura (cm)"
                  value={shelf.w}
                  onChange={(w) => edit({ w })}
                />
                <Num
                  label="Profundidade (cm)"
                  value={shelf.d}
                  max={500}
                  onChange={(d) => edit({ d })}
                />
                <Num
                  label="X (cm)"
                  value={shelf.x}
                  min={0}
                  onChange={(x) => edit({ x })}
                />
                <Num
                  label="Altura do piso (cm)"
                  value={shelf.y}
                  min={0}
                  max={1000}
                  onChange={(y) => edit({ y })}
                />
              </div>
              <div className="two">
                <button
                  onClick={() =>
                    edit({ x: Math.max(0, (d.wallWidth - shelf.w) / 2) })
                  }
                >
                  Centralizar
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    set({
                      shelves: d.shelves.filter((s) => s.id !== sid),
                      collection: d.collection.map((c) =>
                        c.location === sid ? { ...c, location: "" } : c,
                      ),
                    });
                    select("");
                  }}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </>
          )}
          <div className="observation">
            <strong>Conferência da composição</strong>
            {visible.flatMap((s) => {
              const cs = d.collection.filter((c) => c.location === s.id);
              const msgs = [];
              if (s.x + s.w > d.wallWidth || s.y > d.wallHeight)
                msgs.push(`${s.name}: ultrapassa a parede.`);
              if (
                wall === "Superior" &&
                s.y <= d.monitorHeight &&
                s.x < monitorX + d.monitorWidth &&
                s.x + s.w > monitorX
              )
                msgs.push(`${s.name}: interfere na reserva dos equipamentos.`);
              if (
                cs.reduce((t, c) => t + c.w + 2, 0) > s.w + 2 ||
                cs.some((c) => c.d > s.d || s.y + c.h > d.wallHeight)
              )
                msgs.push(`${s.name}: peças excedem espaço de exposição.`);
              return msgs.map((m) => <p key={m}>{m}</p>);
            })}
            <p>
              Os blocos representam as dimensões das peças. A resistência não
              foi calculada: confira suportes, buchas e carga especificada para
              sua parede.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
