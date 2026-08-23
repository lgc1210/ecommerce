interface Props {
	description: string | null;
}

const ProductDescriptionTab = ({ description }: Props) => {
	return <p>{description || "Chưa có mô tả cho sản phẩm này."}</p>;
};

export default ProductDescriptionTab;
