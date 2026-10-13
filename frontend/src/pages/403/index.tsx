import useTitle from "../../hooks/useTitle";
import paths from "../../configs/constants/paths";
import { LinkButton } from "../../components/button";

const ForbiddenPage = () => {
	useTitle();
	return (
		<div className='w-full h-screen'>
			<div className='w-full h-full flex flex-col gap-4 items-center justify-center'>
				<h1 className='text-5xl'>Không đủ quyền truy cập</h1>
				<p className='text-xl'>
					Tài khoản của bạn không có quyền truy cập vào trang này.
				</p>
				<LinkButton to={paths.client.home} viewTransition variant='outline'>
					Quay về trang chủ
				</LinkButton>
			</div>
		</div>
	);
};

export default ForbiddenPage;
