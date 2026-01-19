/**
 * @file This module loads, parses, and validates the application configuration from `config.yml`.
 */

import fs from "node:fs";
import YAML from "yaml";
import { z } from "zod";
import { ConfigSchema, type Config } from "@/types";
import chalk from "chalk";

/**
 * Loads, validates, and exports the application's configuration.
 * @returns The validated configuration object.
 * @throws If `config.yml` is missing, malformed, or fails validation.
 */
function loadConfig(): Config {
	try {
		const rawConfig = YAML.parse(fs.readFileSync("src/config.yml", "utf8"));
		const validatedConfig = ConfigSchema.parse(rawConfig);
		return validatedConfig;
	} catch (error) {
		console.error(
			chalk.red.bold("\nОшибка в файле конфигурации (config.yml)!"),
		);
		if (error instanceof z.ZodError) {
			// Pretty-print Zod errors for better readability
			for (const issue of error.issues) {
				console.error(
					chalk.red(`- Поле '${issue.path.join(".")}': ${issue.message}`),
				);
			}
		} else if (error instanceof Error) {
			console.error(chalk.red(`- ${error.message}`));
		} else {
			console.error(chalk.red("Произошла неизвестная ошибка при чтении конфига."));
		}
		process.exit(1);
	}
}

const config = loadConfig();

export default config;
