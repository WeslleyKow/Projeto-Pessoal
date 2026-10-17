# Meu Quarto Nerd

Aplicação em português para planejar o quarto, coleções e compras. React, TypeScript, Vite e Three.js; funciona sem backend ou credenciais.

## Abrir no computador

Instale Node.js 22 ou superior. Na pasta do projeto:

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. Para produção: `npm run build`. Os arquivos para hospedagem ficam em `dist/`; `npm run preview` permite conferi-los localmente.

## Publicar na internet

O workflow `.github/workflows/pages.yml` compila e publica no GitHub Pages a cada envio à branch `main`. No GitHub, em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**. Se necessário, execute **Actions → Publicar planejador → Run workflow**. O endereço efetivo aparece no resultado de deploy. Ativar Pages pode depender do plano e da visibilidade do repositório.

Também é possível hospedar `dist/` em qualquer serviço de arquivos estáticos. O caminho de assets é relativo, inclusive para hospedagem em subpastas.

## O que está incluído

- **Planta 2D:** grade em centímetros, móveis arrastáveis, dimensões e altura editáveis, rotação de 90°, duplicação, exclusão e desfazer. Catálogo com cama, mesa em L, cadeira, guarda-roupa, estante, rack, nicho, prateleira, porta, janela e móvel personalizado.
- **Paredes:** elevações de quatro paredes, largura e altura configuráveis, prateleiras arrastáveis com largura, profundidade e altura do piso. Centralização e composição livre. Reserva editável para mesa e monitores e alertas de interferência.
- **Coleção:** nome, franquia, largura, altura, profundidade, local de exposição e foto opcional (PNG/JPEG/WebP até 1 MB). Peças aparecem como blocos dimensionados nas prateleiras da elevação e na vista 3D.
- **3D:** volumes baseados nas dimensões e posições da planta; mesa em L, cama e estantes com geometria simplificada; câmera orbital e zoom. WebGL é necessário.
- **Orçamento:** quantidade, preço unitário, link, prioridade e situação de cada compra. Totais gerais, essenciais, futuros e já comprados/instalados.
- **Layouts:** versão atual e uma versão guardada com miniaturas lado a lado; restauração da versão anterior.
- **Dados:** salvamento automático neste navegador, importação/exportação JSON do projeto completo (inclusive fotos, prateleiras, coleção e orçamento). A versão de comparação é armazenada separadamente. Exportação SVG da planta; use a impressão do navegador para PDF.

## Comece pelas medidas

A distribuição inicial segue o croqui: mesa em L no canto superior esquerdo, cama à esquerda, guarda-roupa à direita, porta em cima à direita e janela embaixo. O armário a retirar não integra a proposta.

**Todas as medidas iniciais são exemplos**, inclusive alturas, paredes e reserva de equipamentos. Elas não foram extraídas da fotografia. Informe as medidas reais do quarto, móveis, porta e janela antes de avaliar compras. Marcar “Conferi as medidas reais” é uma declaração do usuário, não uma verificação automática.

## Limites e cuidados de uso

Colisões na planta usam retângulos delimitadores; o recorte da mesa em L pode gerar alerta conservador. A faixa de 60 cm é uma referência visual e não comprova passagem suficiente. O arco de abertura da porta é ilustrativo; confira sentido de abertura, portas do guarda-roupa, gavetas e cadeira no local. O 3D usa duas paredes transparentes para facilitar a leitura; aberturas são volumes de referência. A largura da elevação é ajustada separadamente da planta: mantenha as dimensões coerentes ao editar.

O planejador avisa quando as peças excedem a largura/profundidade da prateleira ou a altura da elevação. Não calcula resistência ou capacidade de carga. Confira especificações de suportes, buchas, peças e parede com o fabricante/instalador.

Dados não são sincronizados entre dispositivos. Exporte JSON como backup; limpar o armazenamento do navegador apaga projetos. Muitas fotos podem esgotar a cota do navegador; nesse caso o aplicativo avisa da falha de salvamento e permite exportar JSON. Projetos importados são validados antes de substituir o atual.

O vídeo fornecido ultrapassou o limite de transferência de 32 MB e não foi processado. O croqui e o texto orientaram esta versão.

## Validação

```sh
npm run build
npx playwright install chromium
npm test
```

O teste inicia seu próprio Vite na porta 5174. Se houver Chromium em `/usr/bin/chromium`, ele será usado; outra instalação pode ser indicada por `CHROMIUM_PATH`. Os testes verificam prateleira, atribuição de peça, total do orçamento, persistência após recarregar, WebGL 3D, rotação, versão de layout, importação/exportação JSON e ausência de transbordamento horizontal em celular. Artefatos de teste ficam em `test-results/` (ignorado pelo Git).
