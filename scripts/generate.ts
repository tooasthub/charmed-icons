import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import { fileExtensions, fileNames } from "../src/defaults/file-icons.ts";
import { folderNames } from "../src/defaults/folder-icons.ts";
import { lattePalette, mochaPalette, sourcePalette } from "./palettes.ts";

const iconDirectory = "icons";
const themesDirectory = "icon_themes";
const iconFilenames = (await readdir(iconDirectory, { withFileTypes: true }))
	.filter(entry => entry.isFile() && entry.name.endsWith(".svg"))
	.map(entry => entry.name)
	.sort();

function replaceSvgColors(content: string, palette: typeof mochaPalette): string {
	for (const [key, sourceColor] of Object.entries(sourcePalette)) {
		content = content.replaceAll(sourceColor, palette[key as keyof typeof palette]);
	}
	return content;
}

function iconPath(theme: "mocha" | "latte", filename: string): string {
	return `./icons/${theme}/${filename}`;
}

async function generateIconSet(theme: "mocha" | "latte", palette: typeof mochaPalette) {
	const outputDirectory = join(iconDirectory, theme);
	await rm(outputDirectory, { recursive: true, force: true });
	await mkdir(outputDirectory, { recursive: true });

	await Promise.all(iconFilenames.map(async (filename) => {
		const source = await readFile(join(iconDirectory, filename), "utf-8");
		await writeFile(join(outputDirectory, filename), replaceSvgColors(source, palette), "utf-8");
	}));
}

function createTheme(name: string, appearance: "dark" | "light", theme: "mocha" | "latte") {
	const fileIcons: Record<string, { path: string }> = {
		default: { path: iconPath(theme, "_file.svg") },
	};

	for (const filename of iconFilenames) {
		const iconId = parse(filename).name;
		if (iconId.startsWith("folder_") || iconId.startsWith("_")) {
			continue;
		}

		fileIcons[iconId] = { path: iconPath(theme, filename) };
	}

	const namedDirectoryIcons: Record<string, { collapsed: string; expanded: string }> = {};
	for (const [name, iconId] of Object.entries(folderNames)) {
		namedDirectoryIcons[name] = {
			collapsed: iconPath(theme, `${iconId}.svg`),
			expanded: iconPath(theme, `${iconId}_open.svg`),
		};
	}

	const missingIconIds = [...new Set([...Object.values(fileNames), ...Object.values(fileExtensions)])]
		.filter(iconId => !(iconId in fileIcons));
	if (missingIconIds.length > 0) {
		throw new Error(`File mappings reference missing icons: ${missingIconIds.join(", ")}`);
	}

	return {
		name,
		appearance,
		directory_icons: {
			collapsed: iconPath(theme, "_folder.svg"),
			expanded: iconPath(theme, "_folder_open.svg"),
		},
		named_directory_icons: namedDirectoryIcons,
		file_stems: fileNames,
		file_suffixes: fileExtensions,
		file_icons: fileIcons,
	};
}

async function validateThemePaths(theme: ReturnType<typeof createTheme>) {
	const paths = [
		theme.directory_icons.collapsed,
		theme.directory_icons.expanded,
		...Object.values(theme.named_directory_icons).flatMap(({ collapsed, expanded }) => [collapsed, expanded]),
		...Object.values(theme.file_icons).map(({ path }) => path),
	];

	const missingPaths: string[] = [];
	for (const path of paths) {
		try {
			await readFile(path.slice(2));
		}
		catch {
			missingPaths.push(path);
		}
	}

	if (missingPaths.length > 0) {
		throw new Error(`Theme references missing icon files: ${missingPaths.join(", ")}`);
	}
}

await Promise.all([
	generateIconSet("mocha", mochaPalette),
	generateIconSet("latte", lattePalette),
]);

const mochaTheme = createTheme("Charmed Icons (Catppuccin Mocha)", "dark", "mocha");
const latteTheme = createTheme("Charmed Icons (Catppuccin Latte)", "light", "latte");
await Promise.all([validateThemePaths(mochaTheme), validateThemePaths(latteTheme)]);

const themeFamily = {
	$schema: "https://zed.dev/schema/icon_themes/v0.3.0.json",
	name: "Charmed Icons",
	author: "littensy",
	themes: [mochaTheme, latteTheme],
};

await mkdir(themesDirectory, { recursive: true });
await writeFile(join(themesDirectory, "charmed-icons.json"), `${JSON.stringify(themeFamily, null, 2)}\n`, "utf-8");

console.info(`Generated Mocha and Latte icon sets (${iconFilenames.length} SVGs each).`);
console.info(`File mappings: ${Object.keys(fileNames).length} stems, ${Object.keys(fileExtensions).length} suffixes.`);
console.info(`Named folders: ${Object.keys(folderNames).length}.`);
