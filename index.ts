import { Command } from "commander";
import "dotenv/config";
import {
  createRdp,
  getStatus,
  restartInstance,
  startInstance,
  stopInstance,
} from "./utils";

const program = new Command();

async function main() {
  program
    .command("status")
    .description("get an instance status")
    .action(getStatus);

  program
    .command("start")
    .description("start an instance")
    .action(startInstance);

  program.command("stop").description("stop instances").action(stopInstance);

  program
    .command("restart")
    .description("restart instances")
    .action(restartInstance);

  program
    .command("create-rdp")
    .description("create rdp file")
    .action(createRdp);

  program.parse(process.argv);
}

main().catch(console.error);
