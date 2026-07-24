interface AdminTitleProps {
	title: string;
	description?: string;
}

const AdminTitle = ({ title, description }: AdminTitleProps) => {
	return (
		<div>
			<h2 className='text-xl font-bold text-ink'>{title}</h2>
			<p className='mt-1 text-sm text-muted'>{description}</p>
		</div>
	);
};

export default AdminTitle;
