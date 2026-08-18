import Skeleton from "../../../shared/components/skeleton";

/** Skeleton cho toàn trang Giới thiệu (header, story, thống kê, giá trị cốt lõi) khi đang tải nội dung từ CMS. */
const AboutPageSkeleton = () => (
	<div>
		<div className='border-b border-border bg-cream-soft px-4 py-10 sm:px-6 lg:px-8'>
			<div className='mx-auto max-w-7xl space-y-3'>
				<Skeleton className='h-7 w-64' />
				<Skeleton className='h-4 w-96 max-w-full' />
			</div>
		</div>

		<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
			<div className='grid items-center gap-10 lg:grid-cols-2'>
				<Skeleton className='min-h-96 h-full w-full rounded-3xl' />
				<div className='space-y-4'>
					<Skeleton className='h-3.5 w-24' />
					<Skeleton className='h-8 w-4/5' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-2/3' />
					<Skeleton className='h-10 w-36 rounded-xl' />
				</div>
			</div>
		</section>

		<section className='border-y border-border bg-ink'>
			<div className='mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8'>
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className='flex flex-col items-center gap-2'>
						<Skeleton className='h-9 w-20 bg-cream/20' />
						<Skeleton className='h-3.5 w-24 bg-cream/20' />
					</div>
				))}
			</div>
		</section>

		<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
			<div className='mt-10 grid gap-6 sm:grid-cols-3'>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className='space-y-4 rounded-2xl border border-border bg-surface p-7 text-center'>
						<Skeleton className='mx-auto h-14 w-14 rounded-2xl' />
						<Skeleton className='mx-auto h-4 w-2/3' />
						<Skeleton className='mx-auto h-3.5 w-full' />
					</div>
				))}
			</div>
		</section>
	</div>
);

export default AboutPageSkeleton;
