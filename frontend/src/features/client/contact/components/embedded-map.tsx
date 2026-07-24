import type { MouseEvent } from "react";
import Button from "../../../../components/button";

const EmbeddedMap = () => {
	const STORE_ADDRESS = "245 Phú Định, Phường Phú Định, Hồ Chí Minh";

	const mapUrl = "https://maps.app.goo.gl/BU8HGnr2QdynNqLS7";

	const iframeUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.1574972160784!2d106.62523027682327!3d10.722332960185494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752db478cc5cef%3A0xe4120bd3fe5370bb!2zMjQ1IFBow7ogxJDhu4tuaCwgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1784909834320!5m2!1sen!2s`;

	const handleOpenMap = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		window.open(mapUrl, "_blank", "noopener,noreferrer");
	};

	return (
		<div className='w-full max-w-2xl mx-auto px-4 py-3 font-sans'>
			<h3 className='text-2xl font-semibold text-slate-800 mb-2'>Vị trí cửa hàng</h3>
			<p className='text-sm text-slate-500 mb-5 flex items-center gap-1'>{STORE_ADDRESS}</p>

			{/* ĐÃ SỬA CHUẨN: Đổi h-100 thành h-[400px] để khung có chiều cao hiển thị bản đồ */}
			<div className='relative w-full h-100 rounded-xl overflow-hidden shadow-md border border-slate-200'>
				<iframe
					src={iframeUrl}
					width='600'
					height='450'
					allowFullScreen
					loading='lazy'
					referrerPolicy='strict-origin-when-cross-origin'
					className='border-0'></iframe>
			</div>

			{/* Nút bấm chỉ đường thông minh */}
			<div className='mt-4 flex justify-center'>
				<Button type='button' size='sm' variant='outline' className='rounded-lg!' onClick={handleOpenMap}>
					Xem bằng Google Maps
				</Button>
			</div>
		</div>
	);
};

export default EmbeddedMap;
