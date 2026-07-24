const viewOptions = { list: "list", grid: "grid" } as const;

export type ViewOption = (typeof viewOptions)[keyof typeof viewOptions];

export default viewOptions;
