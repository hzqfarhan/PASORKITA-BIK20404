import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const buildDir = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.dirname(buildDir);
const workspaceDir = path.resolve(docsDir, '../..');
const skillDir = 'C:/Users/haziq/.codex/plugins/cache/openai-primary-runtime/presentations/26.1026.10807/skills/presentations';
const runtimeModules = 'C:/Users/haziq/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const runtimePython = 'C:/Users/haziq/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES = runtimeModules;
const { importRuntimeModule } = await import(pathToFileURL(path.join(skillDir, 'container_tools/runtime_helpers.mjs')).href);
const { Presentation, PresentationFile } = await importRuntimeModule('@oai/artifact-tool');
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);

const C = { cream: '#FAF6EF', ink: '#32272A', burgundy: '#782B46', muted: '#665A5B', line: '#D6C7BF', white: '#FFFFFF' };
const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const fontPolicy = { basis: 'design', families: ['Arial'] };
const noteSource = await fs.readFile(path.join(docsDir, 'presentation-notes.md'), 'utf8');
const pdfSource = path.join(docsDir, 'sources/assignment-brief.pdf');

function text(slide, name, value, x, y, w, h, size = 28, color = C.ink, bold = false) {
  const shape = slide.shapes.add({
    geometry: 'textbox', name,
    position: { left: x, top: y, width: w, height: h },
    fill: 'none', line: { fill: 'none', width: 0, style: 'solid' },
  });
  shape.text = value;
  shape.text.style = { typeface: 'Arial', fontSize: size, color, bold, insets: 0, verticalAlignment: 'top', autoFit: 'none', wrap: 'word' };
  return shape;
}
function slideBase(title, num, dark = false) {
  const s = presentation.slides.add();
  s.background.fill = dark ? C.burgundy : C.cream;
  if (title) text(s, 'slide-title', title, 72, 55, 1136, 66, 48, dark ? C.cream : C.burgundy, true);
  text(s, 'page-number', String(num).padStart(2, '0'), 1170, 662, 40, 26, 19, dark ? C.cream : C.muted);
  return s;
}
function notes(slide, index, additional = '') {
  const start = noteSource.indexOf('## Slide ' + index + ':');
  const next = noteSource.indexOf('\n## ', start + 4);
  const section = noteSource.slice(start, next < 0 ? undefined : next);
  slide.speakerNotes.text = section + '\n\n' + additional + '\n\nSources: ' + pdfSource + ' (pages 1-2). Lecturer message supplied in the conversation. Scope and module choices are proposed by the project team.';
}

// 1. Title
{
  const s = slideBase('', 1);
  text(s, 'course', 'BIK20404 WEB DEVELOPMENT', 72, 71, 650, 32, 22, C.muted, true);
  text(s, 'project-title', 'PASOR\nKITA', 72, 170, 640, 215, 96, C.burgundy, true);
  text(s, 'project-subtitle', 'A Campus E-commerce Marketplace\nfor the UTHM Community', 76, 414, 700, 96, 32, C.ink);
  text(s, 'project-category', 'Project Idea B: E-commerce', 76, 574, 670, 38, 25, C.burgundy, true);
  text(s, 'semester', 'Semester 1, 2026/2027', 76, 619, 670, 32, 23, C.muted);
  s.images.add({ blob: new Uint8Array(await fs.readFile(path.join(buildDir, 'hero-scene.png'))), contentType: 'image/png', alt: 'Original PASOR shopping bag illustration from the project', fit: 'contain', position: { left: 739, top: 145, width: 480, height: 438 } });
  notes(s, 1, 'Visual source: the existing original project artwork at public/assets/hero-scene.svg. No official university endorsement is implied.');
}

// 2. Background
{
  const s = slideBase('Background', 2);
  text(s, 'problem-heading', 'Problem to address', 72, 166, 530, 40, 30, C.burgundy, true);
  text(s, 'problem-body', 'Product posts across separate chats and social channels can be difficult to find and compare.', 72, 222, 540, 136, 31);
  text(s, 'solution-heading', 'Proposed solution', 688, 166, 520, 40, 30, C.burgundy, true);
  text(s, 'solution-body', 'A central campus marketplace with product details, seller profiles and pickup orders.', 688, 222, 520, 136, 31);
  text(s, 'users-heading', 'Target users', 72, 421, 530, 40, 30, C.burgundy, true);
  text(s, 'users-body', 'UTHM students, staff\nand campus sellers', 72, 477, 540, 103, 31);
  text(s, 'objectives-heading', 'Objectives', 688, 421, 520, 40, 30, C.burgundy, true);
  text(s, 'objectives-body', 'Find products by category and price.\nManage listings and pickup orders.\nKeep shared orders and reviews.', 688, 477, 520, 142, 26);
  notes(s, 2, 'The product-discovery problem is a project rationale to validate with potential users, not a claim supported by a campus survey.');
}

// 3. List of modules
{
  const s = slideBase('List of modules', 3);
  const modules = [
    ['01', 'Accounts and profiles', 'Register, sign in and manage\nbuyer/seller profiles'],
    ['02', 'Product catalogue', 'Create, view, update and delete\nproduct listings'],
    ['03', 'Search and saved items', 'Filter by category, price and campus,\nand save products'],
    ['04', 'Orders and campus pickup', 'Place an order and\ntrack its status'],
    ['05', 'Ratings and reviews', 'Review products after\na completed order'],
    ['06', 'Administration', 'Manage categories and moderate\nlistings and reviews'],
  ];
  modules.forEach(([number, title, body], i) => {
    const x = i % 2 ? 688 : 72;
    const y = 169 + Math.floor(i / 2) * 151;
    text(s, 'module-' + number + '-number', number, x, y, 52, 38, 27, C.muted);
    text(s, 'module-' + number + '-title', title, x + 66, y, 462, 42, 29, C.burgundy, true);
    text(s, 'module-' + number + '-body', body, x + 66, y + 53, 462, 80, 26);
  });
  text(s, 'scope', 'Initial scope: product sales, campus pickup and payment on pickup', 72, 641, 1080, 40, 23, C.muted);
  notes(s, 3, 'All six modules describe planned backend-backed functions. The current prototype uses local demo state. Live chat, services/rentals, online payments, university SSO and business verification are extensions.');
}

// 4. Editable system architecture appendix
{
  const s = slideBase('System architecture', 4);
  text(s, 'appendix-label', 'Proposed implementation', 72, 132, 1060, 36, 25, C.muted);
  const boxes = [];
  const xs = [72, 479, 886];
  const widths = [322, 322, 322];
  const headings = ['Browser', 'Application server', 'Database'];
  const bodies = [
    'HTML, CSS and JavaScript\n\nResponsive pages\nForms and navigation',
    'Node.js + Express\nEJS page rendering\n\nAuthentication and CRUD\nOrder rules and moderation',
    'MySQL\n\nUsers, Products, Categories\nOrders, OrderItems\nReviews, Favorites',
  ];
  xs.forEach((x, i) => {
    const box = s.shapes.add({ geometry: 'rect', name: 'architecture-layer-' + i, position: { left: x, top: 257, width: widths[i], height: 277 }, fill: C.white, line: { fill: C.line, style: 'solid', width: 1.5 } });
    boxes.push(box);
    text(s, 'architecture-heading-' + i, headings[i], x + 20, 280, widths[i] - 40, 44, 28, C.burgundy, true);
    text(s, 'architecture-body-' + i, bodies[i], x + 20, 345, widths[i] - 40, 172, 23);
  });
  for (let i = 0; i < 2; i++) {
    s.shapes.connect(boxes[i], boxes[i + 1], { kind: 'straight', fromSide: 'right', toSide: 'left', line: { fill: C.burgundy, width: 2, style: 'solid' }, head: { type: 'arrow', width: 'med', length: 'med' }, tail: { type: 'arrow', width: 'med', length: 'med' } });
  }
  text(s, 'http-label', 'HTTP requests and responses', 72, 202, 720, 34, 22, C.muted);
  text(s, 'sql-label', 'Parameterised database queries', 812, 202, 396, 34, 22, C.muted);
  text(s, 'security-heading', 'Server-side protection', 72, 571, 1120, 38, 28, C.burgundy, true);
  text(s, 'security-body', 'Password hashing, session and ownership checks, input validation and parameterised SQL', 72, 622, 1100, 44, 23, C.ink);
  notes(s, 4, 'Architecture appendix: keep as backup for the preliminary lab, whose lecturer instruction requests three slides. Initial deployment is localhost. EJS executes on the server. Product images use validated local storage accessed through the application. Technical definitions: https://nodejs.org/learn/getting-started/introduction-to-nodejs ; https://expressjs.com/ ; https://nextjs.org/docs .');
}

await fs.mkdir(path.join(buildDir, 'renders'), { recursive: true });
for (const [i, s] of presentation.slides.items.entries()) {
  const png = await presentation.export({ slide: s, format: 'png', scale: 1.5 });
  await fs.writeFile(path.join(buildDir, 'renders', 'slide-' + (i + 1) + '.png'), new Uint8Array(await png.arrayBuffer()));
  const layout = await s.export({ format: 'layout' });
  await fs.writeFile(path.join(buildDir, 'renders', 'slide-' + (i + 1) + '.json'), new Uint8Array(await layout.arrayBuffer()));
}
const candidatePath = path.join(buildDir, 'candidate.pptx');
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
await fs.mkdir(path.join(docsDir, 'slides'), { recursive: true });
// This Windows workspace permits file copies but rejects hard links. Keep the
// finalizer's no-overwrite publication and byte verification using a scoped copy.
const finalTarget = path.join(docsDir, 'slides/pasor-kita-project-proposal.pptx');
const originalLink = fs.link;
fs.link = async (source, target) => {
  try { return await originalLink(source, target); }
  catch (error) {
    if (!['EPERM', 'ENOTSUP'].includes(error.code)
      || path.resolve(target) !== path.resolve(finalTarget)
      || path.dirname(source) !== path.dirname(finalTarget)
      || !path.basename(source).startsWith('.pasor-kita-project-proposal.pptx.')
      || !source.endsWith('.validated')) throw error;
    return fs.copyFile(source, target, constants.COPYFILE_EXCL);
  }
};
const result = await finalizePresentation({
  workspaceDir, candidatePath, finalPath: path.join(docsDir, 'slides/pasor-kita-project-proposal.pptx'),
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  explicitTotalSlideCount: 4,
  requiredNativeTableOwnerSlides: [], requiredNativeChartOwnerSlides: [],
  fontPolicy, verifyArtifactToolImport: true,
  receiptPath: path.join(buildDir, 'validation.json'),
});
fs.link = originalLink;
console.log(JSON.stringify({ finalPath: finalTarget, slideCount: presentation.slides.items.length, checks: { packageIntegrity: result.packageIntegrity?.passed, firstPartyImport: result.firstPartyImport?.performed, sha256: result.finalSha256 } }, null, 2));
