import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

type Ctx = { cwd: string; args: string[] };

function detectPM(cwd: string) {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lockb"))) return "bun";
  return "npm";
}

function run(cmd: string, args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", cwd, shell: process.platform === "win32" });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function readJSON(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJSON(path: string, data: any) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export async function prettierCommand({ cwd }: Ctx) {
  const pm = detectPM(cwd);
  console.log(`→ Using package manager: ${pm}`);

  // 1) install prettier
  const installArgs =
    pm === "pnpm"
      ? ["add", "-D", "prettier"]
      : pm === "yarn"
      ? ["add", "-D", "prettier"]
      : pm === "bun"
      ? ["add", "-d", "prettier"]
      : ["i", "-D", "prettier"];

  await run(pm, installArgs, cwd);

  // 2) .prettierrc
  const rcPath = join(cwd, ".prettierrc");
  if (!existsSync(rcPath)) {
    writeFileSync(
      rcPath,
      JSON.stringify(
        {
          semi: true,
          singleQuote: true,
          trailingComma: "es5",
          printWidth: 100,
          tabWidth: 2
        },
        null,
        2
      ) + "\n",
      "utf8"
    );
    console.log("→ Created .prettierrc");
  } else {
    console.log("✓ .prettierrc exists");
  }

  // 3) .prettierignore
  const igPath = join(cwd, ".prettierignore");
  if (!existsSync(igPath)) {
    writeFileSync(
      igPath,
      [
        "node_modules",
        "dist",
        "build",
        "coverage",
        ".next",
        ".turbo",
        "*.lock",
        "*.min.*"
      ].join("\n") + "\n",
      "utf8"
    );
    console.log("→ Created .prettierignore");
  } else {
    console.log("✓ .prettierignore exists");
  }

  // 4) package.json scripts
  const pkgPath = join(cwd, "package.json");
  const pkg = readJSON(pkgPath);
  pkg.scripts = pkg.scripts ?? {};
  pkg.scripts.format = pkg.scripts.format ?? "prettier . -w";
  pkg.scripts["format:check"] = pkg.scripts["format:check"] ?? "prettier . -c";
  writeJSON(pkgPath, pkg);
  console.log('→ Added scripts: "format", "format:check"');

  console.log("✅ Prettier installed & configured.");
}
