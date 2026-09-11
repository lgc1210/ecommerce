import apiClient from "../configs/apis";

export const downloadExport = async (
	resource: string,
	params: Record<string, string | number | boolean | undefined>,
) => {
	const response = await apiClient.get(`/exports/${resource}`, {
		params,
		responseType: "blob",
		headers: { Accept: "text/csv" },
	});
	const disposition = response.headers["content-disposition"] as string | undefined;
	const filename = disposition?.match(/filename="([^"]+)"/)?.[1] ?? `${resource}.csv`;
	const url = URL.createObjectURL(response.data);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};
