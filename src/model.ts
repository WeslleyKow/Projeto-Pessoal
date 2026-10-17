export type Shelf = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  d: number;
  wall: string;
};
export type Collectible = {
  id: string;
  name: string;
  category: string;
  w: number;
  h: number;
  d: number;
  location: string;
  photo?: string;
};
export type Purchase = {
  id: string;
  name: string;
  qty: number;
  price: number;
  url: string;
  priority: string;
  status: string;
};
export type Extras = {
  wallWidth: number;
  wallHeight: number;
  monitorWidth: number;
  monitorHeight: number;
  shelves: Shelf[];
  collection: Collectible[];
  purchases: Purchase[];
};
export type Item = {
  id: string;
  name: string;
  kind: string;
  x: number;
  y: number;
  w: number;
  d: number;
  r: number;
  h?: number;
};
export type Project = {
  width: number;
  depth: number;
  confirmed: boolean;
  items: Item[];
  extras?: Extras;
};
export const defaults: Extras = {
  wallWidth: 360,
  wallHeight: 260,
  monitorWidth: 100,
  monitorHeight: 120,
  shelves: [],
  collection: [],
  purchases: [],
};
export function validProject(p: unknown): p is Project {
  if (!p || typeof p !== "object") return false;
  const a = p as Project;
  const n = (v: unknown, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
  const str = (v: unknown) => typeof v === "string" && v.length <= 500;
  const list = (v: unknown) => Array.isArray(v) && v.length <= 200;
  if (
    !n(a.width, 100, 2000) ||
    !n(a.depth, 100, 2000) ||
    typeof a.confirmed !== "boolean" ||
    !list(a.items) ||
    !a.items.every(
      (i) =>
        i &&
        str(i.id) &&
        str(i.name) &&
        str(i.kind) &&
        n(i.x, -2000, 4000) &&
        n(i.y, -2000, 4000) &&
        n(i.w, 1, 2000) &&
        n(i.d, 1, 2000) &&
        [0, 90, 180, 270].includes(i.r) &&
        (i.h === undefined || n(i.h, 1, 1000)),
    )
  )
    return false;
  if (new Set(a.items.map((i) => i.id)).size !== a.items.length) return false;
  const e = a.extras;
  if (e === undefined) return true;
  return (
    !!e &&
    n(e.wallWidth, 100, 2000) &&
    n(e.wallHeight, 100, 1000) &&
    n(e.monitorWidth, 0, 1000) &&
    n(e.monitorHeight, 0, 1000) &&
    list(e.shelves) &&
    e.shelves.every(
      (s) =>
        s &&
        str(s.id) &&
        str(s.name) &&
        str(s.wall) &&
        n(s.x, 0, 2000) &&
        n(s.y, 0, 1000) &&
        n(s.w, 1, 2000) &&
        n(s.d, 1, 500),
    ) &&
    list(e.collection) &&
    e.collection.every(
      (c) =>
        c &&
        str(c.id) &&
        str(c.name) &&
        str(c.category) &&
        str(c.location) &&
        n(c.w, 1, 1000) &&
        n(c.h, 1, 1000) &&
        n(c.d, 1, 1000) &&
        (!c.photo ||
          (typeof c.photo === "string" &&
            c.photo.length < 1500000 &&
            /^data:image\/(png|jpeg|webp);base64,/.test(c.photo))),
    ) &&
    list(e.purchases) &&
    e.purchases.every(
      (b) =>
        b &&
        str(b.id) &&
        str(b.name) &&
        str(b.url) &&
        n(b.qty, 1, 999) &&
        n(b.price, 0, 1000000) &&
        ["Essencial", "Futura"].includes(b.priority) &&
        ["Planejado", "Comprado", "Instalado"].includes(b.status),
    )
  );
}
export function money(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
export function safeUrl(s: string) {
  try {
    const u = new URL(s);
    return ["http:", "https:"].includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}
