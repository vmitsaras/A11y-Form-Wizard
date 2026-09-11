import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const examplesDir = join(rootDir, "examples");
const distDir = join(rootDir, "dist");
const docsDir = join(rootDir, "docs");
const docsAssetsDir = join(docsDir, "assets");
const docsThemesDir = join(docsAssetsDir, "themes");
const docsExamplesDir = join(docsDir, "examples");
const docsDistDir = join(docsDir, "dist");

const requiredFiles = [
  join(examplesDir, "index.html"),
  join(examplesDir, "docs.css"),
  join(examplesDir, "basic", "index.html"),
  join(distDir, "index.js"),
  join(distDir, "styles.css"),
];

const missingFiles = requiredFiles.filter((filePath) => !existsSync(filePath));

if (missingFiles.length > 0) {
  throw new Error(
    `Cannot generate GitHub Pages output. Missing required files:\n${missingFiles
      .map((filePath) => `- ${filePath}`)
      .join("\n")}`
  );
}

function writeRewrittenHtml(sourcePath, destinationPath, replacements) {
  let html = readFileSync(sourcePath, "utf8");

  replacements.forEach(([source, destination]) => {
    html = html.replaceAll(source, destination);
  });

  mkdirSync(dirname(destinationPath), { recursive: true });
  writeFileSync(destinationPath, html);
}

rmSync(docsDir, { recursive: true, force: true });
mkdirSync(docsAssetsDir, { recursive: true });
mkdirSync(docsThemesDir, { recursive: true });
mkdirSync(docsExamplesDir, { recursive: true });
mkdirSync(docsDistDir, { recursive: true });

writeRewrittenHtml(
  join(examplesDir, "index.html"),
  join(docsDir, "index.html"),
  [["../dist/", "./dist/"]]
);

writeRewrittenHtml(
  join(examplesDir, "basic", "index.html"),
  join(docsDir, "basic", "index.html"),
  [["../../dist/", "../dist/"]]
);

copyFileSync(
  join(examplesDir, "basic", "README.md"),
  join(docsDir, "basic", "README.md")
);

readdirSync(examplesDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && entry.name !== "index.html")
  .sort((a, b) => a.name.localeCompare(b.name))
  .forEach((entry) => {
    writeRewrittenHtml(
      join(examplesDir, entry.name),
      join(docsExamplesDir, entry.name),
      [
        ["../src/themes/", "../assets/themes/"],
      ]
    );
  });

copyFileSync(join(examplesDir, "docs.css"), join(docsAssetsDir, "docs.css"));

readdirSync(join(rootDir, "src", "themes"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
  .sort((a, b) => a.name.localeCompare(b.name))
  .forEach((entry) => {
    copyFileSync(
      join(rootDir, "src", "themes", entry.name),
      join(docsThemesDir, entry.name)
    );
  });

["index.js", "styles.css"].forEach((fileName) => {
  copyFileSync(join(distDir, fileName), join(docsDistDir, fileName));
});

const sourceMapPath = join(distDir, "index.js.map");
if (existsSync(sourceMapPath)) {
  copyFileSync(sourceMapPath, join(docsDistDir, "index.js.map"));
}

writeFileSync(join(docsDir, ".nojekyll"), "");

if (!existsSync(join(docsDir, "index.html"))) {
  throw new Error("GitHub Pages generation did not produce docs/index.html.");
}

console.log("Generated GitHub Pages output in docs/.");
