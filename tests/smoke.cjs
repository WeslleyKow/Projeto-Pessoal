const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const { mkdirSync } = require("node:fs");
mkdirSync("test-results", { recursive: true });
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    "5174",
    "--strictPort",
  ],
  { stdio: "ignore" },
);
process.on("exit", () => server.kill());
const assert = require("node:assert/strict");
(async () => {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch("http://127.0.0.1:5174")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (require("node:fs").existsSync("/usr/bin/chromium")
        ? "/usr/bin/chromium"
        : undefined),
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://127.0.0.1:5174/");
  await page.getByRole("heading", { name: "Meu Quarto Nerd" }).waitFor();
  await page
    .locator("nav")
    .getByRole("button", { name: "Paredes", exact: true })
    .click();
  await page.getByRole("button", { name: "Adicionar prateleira" }).click();
  await page.getByRole("button", { name: "Prateleira 1 · 60 cm" }).waitFor();
  await page
    .locator("nav")
    .getByRole("button", { name: "Coleção", exact: true })
    .click();
  await page.getByRole("button", { name: "Adicionar peça" }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Naruto");
  await page
    .getByLabel("Local de exposição")
    .selectOption({ label: "Prateleira 1 · Superior" });
  await page
    .locator("nav")
    .getByRole("button", { name: "Orçamento", exact: true })
    .click();
  await page.getByRole("button", { name: "Adicionar compra" }).click();
  await page.getByLabel("Nome da compra").fill("Suportes");
  await page.getByLabel("Quantidade").fill("2");
  await page.getByLabel("Valor unitário").fill("45");
  assert.match(await page.locator(".stats").innerText(), /90,00/);
  await page.reload();
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("quarto-project")).extras.collection[0]
          .name,
    ),
    "Naruto",
  );
  await page
    .locator("nav")
    .getByRole("button", { name: "3D", exact: true })
    .click();
  await page.locator(".three-host canvas").waitFor();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator("[role=alert]").count(), 0);
  await page
    .locator("nav")
    .getByRole("button", { name: "Planta 2D", exact: true })
    .click();
  await page.getByRole("button", { name: "Girar 90°" }).click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("quarto-project")).items[0].r,
    ),
    90,
  );
  await page
    .locator("nav")
    .getByRole("button", { name: "Layouts", exact: true })
    .click();
  await page.getByRole("button", { name: "Guardar versão" }).click();
  await page.getByRole("button", { name: "Restaurar versão" }).waitFor();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar projeto" }).click();
  const download = await dl;
  await download.saveAs("test-results/export.json");
  await page
    .locator("input[type=file]")
    .last()
    .setInputFiles("test-results/export.json");
  await page.getByText("Projeto importado", { exact: true }).waitFor();
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("heading", { name: "Meu Quarto Nerd" }).waitFor();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  assert.equal(overflow, false, "horizontal mobile overflow");
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: shelves, collection assignment, budget total, reload persistence, WebGL 3D, rotation, layout snapshot, JSON roundtrip, mobile overflow, no runtime errors",
  );
  await browser.close();
  server.kill();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
