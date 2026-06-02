import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'src', 'index.full.html');
const htmlDir = path.join(root, 'html');
const chunkSize = 10000;
const version = process.env.PAGES_VERSION || Date.now().toString(36);

const source = fs.readFileSync(sourcePath, 'utf8');
fs.rmSync(htmlDir, { recursive: true, force: true });
fs.mkdirSync(htmlDir, { recursive: true });

const count = Math.ceil(source.length / chunkSize);
for (let i = 0; i < count; i++) {
  const chunk = source.slice(i * chunkSize, (i + 1) * chunkSize);
  fs.writeFileSync(path.join(htmlDir, `part-${String(i).padStart(2, '0')}.html`), chunk);
}

const loader = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Woinemer Onboarding</title>
</head>
<body>
  <noscript>Bitte JavaScript aktivieren.</noscript>
  <p id="boot-status" style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:24px;color:#334155">Woinemer Onboarding wird geladen ...</p>
  <script>
  (async () => {
    try {
      const count = ${count};
      const version = '${version}';
      const parts = await Promise.all(Array.from({ length: count }, (_, i) =>
        fetch('/onboarding/html/part-' + String(i).padStart(2, '0') + '.html?v=' + version, { cache: 'reload' }).then(r => {
          if (!r.ok) throw new Error('Frontend-Teil ' + i + ' konnte nicht geladen werden: ' + r.status);
          return r.text();
        })
      ));
      const html = parts.join('');
      if (!html.includes('setButtonLoading')) throw new Error('Frontend-Payload unvollstaendig');
      document.open();
      document.write(html);
      document.close();
    } catch (e) {
      document.body.innerHTML = '<p style="font-family:sans-serif;color:#b00020;padding:24px">Frontend konnte nicht geladen werden. Bitte Seite neu laden.</p>';
      console.error(e);
    }
  })();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), loader);

const rebuilt = fs.readdirSync(htmlDir).sort().map((file) => {
  return fs.readFileSync(path.join(htmlDir, file), 'utf8');
}).join('');

if (rebuilt !== source) {
  throw new Error('Generated chunks do not reconstruct src/index.full.html');
}

console.log(JSON.stringify({
  sourceBytes: source.length,
  chunks: count,
  version,
}, null, 2));
