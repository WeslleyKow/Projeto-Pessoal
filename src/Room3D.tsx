import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Project } from "./model";
import { defaults } from "./model";
export default function Room3D({ project }: { project: Project }) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [reset, setReset] = useState(0);
  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      setError("");
    } catch {
      setError(
        "O navegador não disponibilizou WebGL. Use a planta 2D ou habilite aceleração gráfica.",
      );
      return;
    }
    const p = project,
      e = p.extras || defaults;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#101722");
    const camera = new THREE.PerspectiveCamera(42, 1, 1, 15000);
    const max = Math.max(p.width, p.depth);
    camera.position.set(max * 1.4, max * 1.5, max * 1.7);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(p.width / 2, 20, p.depth / 2);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minDistance = 80;
    controls.maxDistance = max * 6;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xcad6ff, 0x272037, 3));
    const light = new THREE.DirectionalLight(0xffebd1, 3);
    light.position.set(200, 800, 300);
    scene.add(light);
    const resources: THREE.Mesh[] = [];
    const box = (
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      color: string,
      opacity = 1,
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.8,
          transparent: opacity < 1,
          opacity,
        }),
      );
      mesh.position.set(x + w / 2, y + h / 2, z + d / 2);
      parent.add(mesh);
      resources.push(mesh);
      return mesh;
    };
    box(scene, 0, -5, 0, p.width, 5, p.depth, "#303b50");
    box(scene, -3, 0, -3, p.width + 6, e.wallHeight, 3, "#4a4e69", 0.3);
    box(scene, -3, 0, 0, 3, e.wallHeight, p.depth, "#4a4e69", 0.2);
    const grid = new THREE.GridHelper(
      Math.max(p.width, p.depth),
      Math.ceil(Math.max(p.width, p.depth) / 10),
      0x52617e,
      0x33405a,
    );
    grid.position.set(p.width / 2, 0.2, p.depth / 2);
    scene.add(grid);
    for (const i of p.items) {
      const g = new THREE.Group();
      const r = i.r;
      g.position.set(
        i.x + (r === 90 ? i.d : r === 180 ? i.w : 0),
        0,
        i.y + (r === 180 ? i.d : r === 270 ? i.w : 0),
      );
      g.rotation.y = (-r * Math.PI) / 180;
      scene.add(g);
      const h =
        i.h ??
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
        }[i.kind] ||
          70);
      if (i.kind === "desk") {
        box(g, 0, h - 4, 0, i.w, 4, i.d * 0.42, "#b79c79");
        box(g, 0, h - 4, i.d * 0.42, i.w * 0.4, 4, i.d * 0.58, "#b79c79");
        for (const [x, z] of [
          [3, 3],
          [i.w - 7, 3],
          [3, i.d - 7],
          [i.w * 0.4 - 7, i.d - 7],
        ])
          box(g, x, 0, z, 4, h - 4, 4, "#5d6474");
      } else if (i.kind === "bed") {
        box(g, 0, 0, 0, i.w, h * 0.5, i.d, "#313c54");
        box(g, 2, h * 0.5, 2, i.w - 4, h * 0.5, i.d - 4, "#6981ab");
        box(g, 6, h, 7, i.w - 12, 7, i.d * 0.2, "#b0bfd3");
      } else if (i.kind === "chair") {
        box(g, i.w * 0.1, 40, i.d * 0.1, i.w * 0.8, 8, i.d * 0.8, "#8b72b9");
        box(
          g,
          i.w * 0.1,
          48,
          i.d * 0.1,
          i.w * 0.8,
          Math.max(10, h - 48),
          8,
          "#5b477e",
        );
        box(g, i.w / 2 - 3, 0, i.d / 2 - 3, 6, 40, 6, "#6f7787");
      } else if (["shelf", "niche", "rack"].includes(i.kind)) {
        box(g, 0, 0, 0, 3, h, i.d, "#b29676");
        box(g, i.w - 3, 0, 0, 3, h, i.d, "#b29676");
        for (let y = 0; y < h; y += Math.max(25, h / 4))
          box(g, 0, y, 0, i.w, 3, i.d, "#b29676");
      } else if (i.kind === "window") {
        box(g, 0, 90, 0, i.w, h, i.d, "#70bdd1", 0.5);
      } else if (i.kind === "door") {
        box(g, 0, 0, 0, i.w, h, i.d, "#78b4a5", 0.35);
      } else {
        box(
          g,
          0,
          0,
          0,
          i.w,
          h,
          i.d,
          i.kind === "wardrobe" ? "#766580" : "#9c9581",
        );
        if (i.kind === "wardrobe")
          box(g, i.w - 2, h * 0.5, i.d * 0.5, 3, 15, 2, "#d5c5df");
      }
    }
    for (const s of e.shelves) {
      const g = new THREE.Group();
      if (s.wall === "Superior") g.position.set(s.x, s.y, 0);
      if (s.wall === "Inferior") {
        g.position.set(p.width - s.x, s.y, p.depth);
        g.rotation.y = Math.PI;
      }
      if (s.wall === "Esquerda") {
        g.position.set(0, s.y, p.depth - s.x);
        g.rotation.y = Math.PI / 2;
      }
      if (s.wall === "Direita") {
        g.position.set(p.width, s.y, s.x);
        g.rotation.y = -Math.PI / 2;
      }
      scene.add(g);
      box(g, 0, 0, 0, s.w, 3, s.d, "#c6a57d");
      let x = 0;
      for (const c of e.collection.filter((c) => c.location === s.id)) {
        box(g, x, 3, 0, c.w, c.h, c.d, "#a598e0");
        x += c.w + 2;
      }
    }
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      resources.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [project, reset]);
  return (
    <section className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">UMA NOVA PERSPECTIVA</span>
          <h2>Entre no seu próximo espaço.</h2>
          <p>
            As posições e dimensões acompanham a planta 2D. Arraste para
            orbitar, use a roda ou dois dedos para aproximar.
          </p>
        </div>
        <button onClick={() => setReset((v) => v + 1)}>Recentrar câmera</button>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="three-host" ref={host} />
      <p className="subtle">
        Visualização volumétrica: alturas padrão são exemplos editáveis no
        painel da planta. Paredes transparentes facilitam a leitura; porta e
        janela aparecem como volumes de referência. Sem simulação estrutural ou
        de abertura de gavetas.
      </p>
    </section>
  );
}
