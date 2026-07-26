import { useEffect, useState, type MouseEvent } from "react";
import Button from "../../components/button";
import { ArrowUpIcon } from "../../components/icons";

const BackToTop = () => {
	const [showButton, setShowButton] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.pageYOffset;
			if (scrollTop > 700) {
				setShowButton(true);
			} else {
				setShowButton(false);
			}
		};
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const handleOnClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<Button
			type='button'
			aria-label='Back to top'
			title='Back to top'
			icon={<ArrowUpIcon className='w-5 h-5' />}
			className={`fixed z-50 right-4 bottom-4 px-3! ${showButton ? "" : "hidden!"}`}
			onClick={handleOnClick}
		/>
	);
};

export default BackToTop;
