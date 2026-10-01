export const CONFIG_ROOT = "charmed-icons" as const;

export enum ConfigKey {
	HidesExplorerArrows = "hidesExplorerArrows",
	OutlineFolders = "outlineFolders",
	AssociationsLanguages = "associations.languages",
	AssociationsExtensions = "associations.extensions",
	AssociationsFiles = "associations.files",
	AssociationsFolders = "associations.folders",
}

export enum IconVariant {
	Mocha = "base",
	Latte = "light",
}
