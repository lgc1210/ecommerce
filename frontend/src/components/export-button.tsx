import { useState } from "react";
import { toast } from "react-toastify";
import Button from "./button";
import { DownloadIcon } from "./icons";
import { downloadExport } from "../utils/export-data";

interface ExportButtonProps {
	resource: string;
	params?: Record<string, string | number | boolean | undefined>;
}

const ExportButton = ({ resource, params }: ExportButtonProps) => {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			await downloadExport(resource, params ?? {});
			toast.success("Đã xuất dữ liệu thành công.");
		} catch {
			toast.error("Không thể xuất dữ liệu. Vui lòng thử lại.");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Button
			type='button'
			size='sm'
			variant='outline'
			icon={<DownloadIcon className='h-4 w-4' />}
			onClick={handleExport}
			disabled={isExporting}>
			{isExporting ? "Đang xuất..." : "Xuất CSV"}
		</Button>
	);
};

export default ExportButton;
