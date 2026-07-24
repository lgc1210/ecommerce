import useTitle from "../../hooks/useTitle";

const ForbiddenPage = () => {
	useTitle();
	return (
		<div className='w-full h-screen'>
			<div className='w-full h-full flex flex-col gap-3 items-center justify-center'>
				<h1 className='text-5xl'>Không đủ quyền truy cập</h1>
				<p className='text-xl'>Tài khoản của bạn không có quyền truy cập vào trang này.</p>
			</div>
		</div>
	);
};

export default ForbiddenPage;
