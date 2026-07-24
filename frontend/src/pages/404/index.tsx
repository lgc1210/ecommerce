import useTitle from "../../hooks/useTitle";

const NotFoundPage = () => {
	useTitle();

	return (
		<div className='w-full h-screen'>
			<div className='w-full h-full flex flex-col gap-3 items-center justify-center'>
				<h1 className='text-5xl'>Không tìm thấy trang</h1>
				<p className='text-xl'>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xoá.</p>
			</div>
		</div>
	);
};

export default NotFoundPage;
