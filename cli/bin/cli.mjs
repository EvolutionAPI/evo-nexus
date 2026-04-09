#!/usr/bin/env node

/**
 * @evoapicloud/open-claude CLI
 *
 * Usage:
 *   npx @evoapicloud/open-claude          — clone + setup in current dir
 *   npx @evoapicloud/open-claude my-workspace  — clone into my-workspace/
 *   npx @evoapicloud/open-claude --help
 */

import { execSync, spawn } from "child_process";
import { existsSync } from "fs";
import { resolve, basename } from "path";
import { createInterface } from "readline";

const REPO = "https://github.com/EvolutionAPI/open-claude.git";
const GREEN = "\x1b[92m";
const CYAN = "\x1b[96m";
const YELLOW = "\x1b[93m";
const RED = "\x1b[91m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function banner() {
  console.log(`
${GREEN}  ╔══════════════════════════════════════╗
  ║   ${BOLD}OpenClaude — Installer${RESET}${GREEN}            ║
  ║   ${DIM}Unofficial toolkit for Claude Code${RESET}${GREEN}  ║
  ╚══════════════════════════════════════╝${RESET}
`);
}

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: "inherit", ...opts });
}

function check(cmd) {
  try {
    execSync(cmd, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`  ${CYAN}>${RESET} ${question}`, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
  Usage: npx @evoapicloud/open-claude [directory]

  Clones the OpenClaude repository and runs the interactive setup wizard.

  Arguments:
    directory    Target directory (default: open-claude)

  Options:
    --help, -h   Show this help
    --version    Show version

  Examples:
    npx @evoapicloud/open-claude
    npx @evoapicloud/open-claude my-workspace
`);
    process.exit(0);
  }

  if (args.includes("--version")) {
    const { readFileSync } = await import("fs");
    const { fileURLToPath } = await import("url");
    const { dirname, join } = await import("path");
    const dir = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(dir, "..", "package.json"), "utf-8"));
    console.log(pkg.version);
    process.exit(0);
  }

  banner();

  // ── Check prerequisites ────────────────────
  console.log(`  ${BOLD}Checking prerequisites...${RESET}\n`);

  const checks = [
    { name: "git", cmd: "git --version", install: "https://git-scm.com" },
    { name: "Claude Code", cmd: "claude --version", install: "npm install -g @anthropic-ai/claude-code" },
    { name: "Node.js", cmd: "node --version", install: "https://nodejs.org" },
    { name: "Python 3", cmd: "python3 --version", install: "https://python.org" },
  ];

  let missing = [];
  for (const { name, cmd, install } of checks) {
    if (check(cmd)) {
      const version = execSync(cmd, { encoding: "utf-8" }).trim();
      console.log(`  ${GREEN}✓${RESET} ${name}: ${DIM}${version}${RESET}`);
    } else {
      console.log(`  ${RED}✗${RESET} ${name}: ${RED}not found${RESET} — ${DIM}${install}${RESET}`);
      missing.push(name);
    }
  }

  // uv (optional but recommended)
  if (check("uv --version")) {
    const version = execSync("uv --version", { encoding: "utf-8" }).trim();
    console.log(`  ${GREEN}✓${RESET} uv: ${DIM}${version}${RESET}`);
  } else {
    console.log(`  ${YELLOW}!${RESET} uv: ${DIM}not found (optional, will use pip)${RESET}`);
  }

  console.log();

  if (missing.length > 0) {
    console.log(`  ${RED}Missing required tools: ${missing.join(", ")}${RESET}`);
    console.log(`  ${YELLOW}Install them and try again.${RESET}\n`);
    process.exit(1);
  }

  // ── Clone ──────────────────────────────────
  // Filter out subcommands — "install" means install here (current dir or default name)
  const filteredArgs = args.filter(a => !["install", "init", "setup"].includes(a));
  const targetDir = filteredArgs[0] || ".";
  const targetPath = resolve(process.cwd(), targetDir);

  if (targetDir === ".") {
    // Clone into current directory
    const { readdirSync } = await import("fs");
    const files = readdirSync(targetPath).filter(f => !f.startsWith("."));
    if (files.length > 0) {
      const answer = await ask(`${YELLOW}Current directory is not empty (${files.length} items). Clone here anyway? [y/N]: ${RESET}`);
      if (!answer.toLowerCase().startsWith("y")) {
        console.log(`  ${DIM}Aborted.${RESET}\n`);
        process.exit(0);
      }
    }
    console.log(`  ${BOLD}Cloning OpenClaude into current directory...${RESET}\n`);
    run(`git clone ${REPO} .`, { cwd: targetPath });
    console.log();
  } else if (existsSync(targetPath)) {
    const answer = await ask(`${YELLOW}Directory '${targetDir}' already exists. Continue anyway? [y/N]: ${RESET}`);
    if (!answer.toLowerCase().startsWith("y")) {
      console.log(`  ${DIM}Aborted.${RESET}\n`);
      process.exit(0);
    }
  } else {
    console.log(`  ${BOLD}Cloning OpenClaude...${RESET}\n`);
    run(`git clone ${REPO} "${targetPath}"`);
    console.log();
  }

  // ── Install dependencies ───────────────────
  console.log(`  ${BOLD}Installing dependencies...${RESET}\n`);

  // Python deps
  if (check("uv --version")) {
    run("uv sync -q", { cwd: targetPath });
  } else {
    run("pip3 install -q -r requirements.txt 2>/dev/null || pip3 install -q -e .", { cwd: targetPath });
  }

  // Frontend deps
  const frontendDir = resolve(targetPath, "dashboard", "frontend");
  if (existsSync(resolve(frontendDir, "package.json"))) {
    run("npm install --silent", { cwd: frontendDir });
    console.log(`\n  ${GREEN}✓${RESET} Frontend dependencies installed`);
  }

  // ── Run setup wizard ───────────────────────
  console.log(`\n  ${BOLD}Starting setup wizard...${RESET}\n`);

  const pythonCmd = check("uv --version") ? "uv run python" : "python3";
  const setup = spawn(pythonCmd.split(" ")[0], [...pythonCmd.split(" ").slice(1), "setup.py"], {
    cwd: targetPath,
    stdio: "inherit",
  });

  setup.on("close", (code) => {
    if (code === 0) {
      // Build frontend
      console.log(`\n  ${DIM}Building dashboard frontend...${RESET}`);
      try {
        run("npm run build --silent", { cwd: frontendDir });
        console.log(`  ${GREEN}✓${RESET} Dashboard built\n`);
      } catch {
        console.log(`  ${YELLOW}!${RESET} Frontend build failed — run manually: cd ${targetDir}/dashboard/frontend && npm run build\n`);
      }

      console.log(`
  ${GREEN}${BOLD}OpenClaude installed successfully!${RESET}

  ${BOLD}Next steps:${RESET}
  ${CYAN}1.${RESET} cd ${targetDir}
  ${CYAN}2.${RESET} Edit ${BOLD}.env${RESET} with your API keys
  ${CYAN}3.${RESET} ${BOLD}make dashboard-app${RESET}    — start the dashboard
  ${CYAN}4.${RESET} Open ${BOLD}http://localhost:8080${RESET} and create your admin account
  ${CYAN}5.${RESET} ${BOLD}make help${RESET}             — see all available commands

  ${DIM}Documentation: https://openclaude.evolutionfoundation.com.br/docs${RESET}
  ${DIM}GitHub: https://github.com/EvolutionAPI/open-claude${RESET}
`);
    } else {
      console.log(`\n  ${RED}Setup failed (exit code ${code}).${RESET}`);
      console.log(`  ${DIM}Try running manually: cd ${targetDir} && make setup${RESET}\n`);
      process.exit(code);
    }
  });
}

main().catch((err) => {
  console.error(`\n  ${RED}Error: ${err.message}${RESET}\n`);
  process.exit(1);
});
