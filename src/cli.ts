#!/usr/bin/env node
import { argv, cwd } from "node:process";
import { prettierCommand } from "./commands/prettier";

const help = `
ransel — dev toolbox

Usage:
  ransel prettier    Install & configure Prettier
  ransel help        Show this help
`;

async function main() {
  const [, , cmd, ...rest] = argv;

  switch (cmd) {
    case "prettier":
      await prettierCommand({ cwd: cwd(), args: rest });
      break;
    case "help":
    case undefined:
      console.log(help.trim());
      break;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      console.log(help.trim());
      process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
