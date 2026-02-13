/**
 * @file This component serves as the main application startup display,
 * combining the ASCII art logo and the version message.
 */

import { AppStartLogo } from "./AppStartLogo";
import { AppStartMessage } from "./AppStartMessage";

/**
 * Displays the complete application startup sequence,
 * including the ASCII art logo and the welcome message with version.
 */
export async function AppStart() {
	await AppStartLogo();
	await AppStartMessage();
}
