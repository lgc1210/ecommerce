export const getAvatarInitials = (name: string = "", twoLetters: boolean = true): string => {
	if (!name || typeof name !== "string") return "";

	const cleanedName = name.trim();
	if (!cleanedName) return "";

	const words = cleanedName.split(/\s+/);

	if (words.length === 1 || !twoLetters) {
		return words[0].charAt(0).toUpperCase();
	}

	const firstInitial = words[0].charAt(0);
	const lastInitial = words[words.length - 1].charAt(0);

	return `${firstInitial}${lastInitial}`.toUpperCase();
};
