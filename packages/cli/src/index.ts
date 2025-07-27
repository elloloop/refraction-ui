import { Command } from "commander";
import { loadConfig } from "./lib/config";
import { safeWrite, findConfig } from "./lib/fs-utils";
import pkg from "../package.json";
import { registerInit } from "./commands/init";

export async function run(argv: string[] = process.argv) {
  const program = new Command();
  program
    .name("refraction")
    .description("Refraction UI command line interface")
    .version(pkg.version)
    .option("--dry-run", "preview actions without writing")
    .option("--verbose", "output additional logs");

  program
    .command("config")
    .description("Show resolved configuration")
    .action(async () => {
      try {
        const config = await loadConfig();
        console.log(JSON.stringify(config, null, 2));
      } catch (error) {
        console.error(
          "Error loading configuration:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  program
    .command("touch <file>")
    .description("create a file safely")
    .action(async (file: string) => {
      try {
        await safeWrite(file, "", {
          overwrite: false,
          dryRun: program.opts().dryRun,
        });
        console.log("Created", file);
      } catch (error) {
        console.error(
          "Error creating file:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  program
    .command("find-config")
    .description("Find the nearest configuration file")
    .action(async () => {
      try {
        const configPath = await findConfig();
        if (configPath) {
          console.log("Found config at:", configPath);
        } else {
          console.log("No configuration file found");
        }
      } catch (error) {
        console.error(
          "Error finding config:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  registerInit(program);

  try {
    await program.parseAsync(argv);
  } catch (error) {
    console.error("CLI Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}
