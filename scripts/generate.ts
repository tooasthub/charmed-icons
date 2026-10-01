import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import { fileExtensions, fileNames } from "../src/defaults/file-icons.ts";
import { folderNames } from "../src/defaults/folder-icons.ts";

const iconDirectory = "icons";
const themesDirectory = "icon_themes";
const iconFilenames = (await readdir(iconDirectory, { withFileTypes: true }))
	.filter(entry => entry.isFile() && entry.name.endsWith(".svg"))
	.map(entry => entry.name)
	.sort();

function iconPath(filename: string): string {
	return `./icons/${filename}`;
}

function createTheme(name: string, appearance: "dark" | "light") {
	const fileIcons: Record<string, { path: string }> = {
		default: { path: iconPath("_file.svg") },
	};

	for (const filename of iconFilenames) {
		const iconId = parse(filename).name;
		if (iconId.startsWith("folder_") || iconId.startsWith("_")) {
			continue;
		}

		fileIcons[iconId] = { path: iconPath(filename) };
	}

	const namedDirectoryIcons: Record<string, { collapsed: string; expanded: string }> = {};
	for (const [name, iconId] of Object.entries(folderNames)) {
		namedDirectoryIcons[name] = {
			collapsed: iconPath(`${iconId}.svg`),
			expanded: iconPath(`${iconId}_open.svg`),
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
			collapsed: iconPath("_folder.svg"),
			expanded: iconPath("_folder_open.svg"),
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

const darkTheme = createTheme("Charmed Icons Dark", "dark");
const lightTheme = createTheme("Charmed Icons Light", "light");
await Promise.all([validateThemePaths(darkTheme), validateThemePaths(lightTheme)]);

const themeFamily = {
	$schema: "https://zed.dev/schema/icon_themes/v0.3.0.json",
	name: "Charmed Icons",
	author: "littensy",
	themes: [darkTheme, lightTheme],
};

await mkdir(themesDirectory, { recursive: true });
await writeFile(join(themesDirectory, "charmed-icons.json"), `${JSON.stringify(themeFamily, null, 2)}\n`, "utf-8");

console.info(`Generated dark and light themes using ${iconFilenames.length} original SVGs.`);
console.info(`File mappings: ${Object.keys(fileNames).length} stems, ${Object.keys(fileExtensions).length} suffixes.`);
console.info(`Named folders: ${Object.keys(folderNames).length}.`);
