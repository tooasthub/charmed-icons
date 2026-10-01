<p align="center">
  <img src="assets/icon.png" alt="Charmed Icons" width="128" />
</p>

<h1 align="center">Charmed Icons</h1>

<p align="center">A Zed icon theme with Catppuccin Mocha and Latte palettes.</p>

<div align="center">

[![GitHub License](https://img.shields.io/github/license/littensy/charmed-icons?style=for-the-badge)](LICENSE.md)
![GitHub Stars](https://img.shields.io/github/stars/littensy/charmed-icons?style=for-the-badge&logo=github)

</div>

## Install

This repository can be installed locally as a Zed dev extension:

1. Open Zed's Extensions page.
2. Choose **Install Dev Extension**.
3. Select this repository's directory.

Then select **Charmed Icons (Catppuccin Mocha)** or **Charmed Icons (Catppuccin Latte)** in the icon theme selector. The extension provides both variants in one family.

## System appearance settings

To switch the icon palette with your system's light or dark appearance, add this to Zed's `settings.json`:

```json
{
  "icon_theme": {
    "mode": "system",
    "dark": "Charmed Icons (Catppuccin Mocha)",
    "light": "Charmed Icons (Catppuccin Latte)"
  }
}
```

## File and folder icons

File names and suffixes retain the existing Charmed Icons associations. Folder aliases use their named icons, with separate assets for collapsed and expanded states. The project root uses the generic folder pair because Zed does not support a root-folder override in icon themes.

Zed continues to show its own Git status and diagnostic indicators. Icon themes do not define separate artwork for those states.

Zed's icon theme format supports file names and suffixes, but not language-ID associations or runtime icon customization settings. File associations are therefore based on the theme's static names and suffixes.

## Development

The checked-in `icons/mocha` and `icons/latte` sets are generated from the source SVGs in `icons/` and the palette definitions in `scripts/palettes.ts`. With Node.js 22.6 or newer, regenerate the icon files and theme JSON with:

```sh
pnpm generate
```

Check the source association lists for duplicate names with:

```sh
pnpm check-duplicates
```

Zed's [icon theme extension guide](https://zed.dev/docs/extensions/icon-themes) documents the theme format, and [icon theme settings](https://zed.dev/docs/icon-themes) explains system appearance selection.

## Requests

For icon requests, [open an issue](https://github.com/littensy/charmed-icons/issues/new). You can also reach `@littensy` on Discord.

## Gratitude

Charmed Icons draws inspiration from:

- [Catppuccin Icons](https://github.com/catppuccin/vscode-icons): soothing pastel icons.
- [Monospace Theme](https://github.com/keksiqc/monospace-theme): Google's former IDX theme.

Charmed Icons is released under the [MIT License](LICENSE.md).
