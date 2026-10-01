import type { Palette } from "./palettes";
import type { IconDefinitions } from "~/types";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import { IconVariant } from "~/constants";
import { createTheme } from "~/themes";
import { lattePalette, mochaPalette, sourcePalette } from "./palettes";

const iconFilenames = await readdir("icons");

function replaceSvgColors(content: string, palette: Palette): string {
	for (const [key, sourceColor] of Object.entries(sourcePalette)) {
		content = content.replaceAll(sourceColor, palette[key as keyof Palette]);
	}
	return content;
}

async function applyPalette(variant: IconVariant, palette: Palette) {
	return Promise.all(iconFilenames.map(async (filename) => {
		const content = await readFile(join("dist", "themes", variant, "icons", filename), "utf-8");
		const modified = replaceSvgColors(content, palette);

		await writeFile(join("dist", "themes", variant, "icons", filename), modified, "utf-8");
	}));
}

async function generateIconVariant(variant: IconVariant, palette: Partial<Palette>) {
	await rm(join("dist", "themes", variant), { recursive: true, force: true });
	await mkdir(join("dist", "themes", variant, "icons"), { recursive: true });
	await cp("icons", join("dist", "themes", variant, "icons"), { recursive: true });

	await applyPalette(variant, palette);
}

async function createThemeFiles() {
	const iconDefinitions = iconFilenames.reduce<IconDefinitions>((acc, filename) => {
		acc[parse(filename).name] = { iconPath: `./icons/${filename}` };
		return acc;
	}, {});

	const iconDefinitionsJson = JSON.stringify(iconDefinitions);
	const baseThemeJson = JSON.stringify(createTheme({}, iconDefinitions));

	for (const variant of Object.values(IconVariant)) {
		await writeFile(join("dist", "themes", variant, "iconDefinitions.json"), iconDefinitionsJson, "utf-8");
		await writeFile(join("dist", "themes", variant, "theme.json"), baseThemeJson, "utf-8");
	}
}

await Promise.all([
	generateIconVariant(IconVariant.Mocha, mochaPalette),
	generateIconVariant(IconVariant.Latte, lattePalette),
]);

await createThemeFiles();
