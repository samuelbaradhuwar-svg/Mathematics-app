import esbuild from "esbuild";
import fs from "fs";
import path from "path";

const root = "/tmp/build";
const shim = (f) => path.join(root, "shim", f);

const stubPlugin = {
  name: "judah-shims",
  setup(build) {
    build.onResolve({ filter: /^react-helmet$/ }, () => ({ path: shim("helmet.tsx") }));
    build.onResolve({ filter: /^sonner$/ }, () => ({ path: shim("sonner.ts") }));
    build.onResolve({ filter: /(^|\/)useAuth$/ }, () => ({ path: shim("useAuth.tsx") }));
    // Floot server calls become calls into the in-page API
    build.onResolve({ filter: /endpoints\/.*\.schema$/ }, (a) => ({ path: path.resolve(a.resolveDir, a.path) + ".ts", namespace: "api-stub" }));
    build.onLoad({ filter: /.*/, namespace: "api-stub" }, (a) => {
      const text = fs.readFileSync(a.path, "utf8");
      const out = ['import { api } from "/tmp/build/app/localApi";'];
      const re = /export const (\w+) = async \([^)]*\)[^{]*\{[\s\S]*?fetch\(`(\/_api\/[^`?$]*)[^`]*`,\s*\{\s*method: "(GET|POST)"/g;
      let m;
      while ((m = re.exec(text))) out.push(`export const ${m[1]} = (...a) => api("${m[3]}", "${m[2]}", a);`);
      return { contents: out.join("\n"), loader: "ts", resolveDir: path.dirname(a.path) };
    });
  },
};

const r = await esbuild.build({
  entryPoints: [path.join(root, "app/main.tsx")],
  bundle: true,
  minify: true,
  outfile: path.join(root, "dist/app.js"),
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  loader: { ".module.css": "local-css", ".css": "css" },
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [stubPlugin],
  legalComments: "none",
  logLevel: "info",
  metafile: true,
});
fs.writeFileSync(path.join(root, "dist/meta.json"), JSON.stringify(r.metafile));
