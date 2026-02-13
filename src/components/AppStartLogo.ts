/**
 * @file Component for logging the initial application startup message.
 */
import chalk from "chalk";
import figlet from "figlet";

const fontResource = Bun.file("./node_modules/figlet/fonts/Slant.flf");

/**
 * Logs the initial application startup message, including the version number.
 */
export async function AppStartLogo() {
	const asciiText = "Z Crypto Watcher";
	const fontData = await fontResource.text();
	figlet.parseFont("Slant", fontData);

	const asciiArt = figlet.textSync(asciiText, {
		font: "Slant",
		horizontalLayout: "default",
		verticalLayout: "default",
		width: 80,
		whitespaceBreak: true,
	});
	console.log(chalk.blue(asciiArt));
}
