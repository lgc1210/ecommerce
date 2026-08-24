import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import Button from "../../components/button";

const NotFoundPage = () => {
	useTitle();
	const navigate = useNavigate();

	return (
		<div className='w-full h-screen'>
			<div className='w-full h-full flex flex-col gap-3 items-center justify-center'>
				<h1 className='text-5xl'>Không tìm thấy trang</h1>
				<p className='text-xl'>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xoá.</p>
				<Button
					type='button'
					variant='ghost'
					onClick={() => {
						navigate(-1);
					}}
					className='text-xl text-primary hover:underline bg-transparent! h-auto! p-0! cursor-pointer!'>
					Quay về trang chủ
				</Button>
			</div>
		</div>
	);
};

export default NotFoundPage;
