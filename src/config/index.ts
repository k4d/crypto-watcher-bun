/**
 * @file This module loads and parses the application configuration from `config.yml`.
 */

import fs from "node:fs";
import YAML from "yaml";

/**
 * The application's configuration object.
 * This is loaded from `config.yml` at the project root and is used throughout the application.
 * The path is relative to the directory where the 'bun' command is executed.
 */
const config = YAML.parse(fs.readFileSync("src/config.yml", "utf8"));

export default config;
