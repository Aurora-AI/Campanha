import { spawnSync } from "node:child_process";
import path from "node:path";

const [kind, ...rest] = process.argv.slice(2);
if (!kind || (kind !== "docs" && kind !== "frontend")) {
  console.error('Usage: node scripts/guard/run.mjs <docs|frontend> [--init]');
  process.exit(1);
}

const isWin = process.platform === "win32";

const scriptPath = (() => {
  if (kind === "docs") return isWin ? "scripts\\guard\\verify_docs.ps1" : "scripts/guard/verify_docs.sh";
  return isWin ? "scripts\\guard\\verify_frontend_contracts.ps1" : "scripts/guard/verify_frontend_contracts.sh";
})();

const absScriptPath = path.resolve(process.cwd(), scriptPath);

const command = isWin ? "powershell" : "bash";
const args = isWin
  ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", absScriptPath, ...rest]
  : [absScriptPath, ...rest];

const result = spawnSync(command, args, { stdio: "inherit" });
process.exit(result.status ?? 1);

