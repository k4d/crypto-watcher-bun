// This module loads and parses the application configuration from `config.yml`.

import fs from "node:fs";
import YAML from "yaml";

// Load configuration from YAML file
// Reads 'config.yml' from the project root, parses it, and exports the config object.
// The path is relative to the project root where the 'bun' command is executed.
const config = YAML.parse(fs.readFileSync("src/config.yml", "utf8"));

export default config;
