import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminTitle from "../../../components/admin-title";
import Button from "../../../components/button";
import Popup from "../../../components/popup";
import { PencilIcon, PlusIcon, StarIcon, TrashIcon } from "../../../components/icons";
import paths from "../../../configs/constants/paths";
import permissions from "../../../configs/constants/permissions";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import {
	useCreateSku,
	useDeleteProduct,
	useDeleteSku,
	useProductQuery,
	useUpdateProduct,
	useUpdateSku,
} from "../../../features/admin/product/hooks";
import type {
	CreateProductPayload,
	ProductSku,
	SkuPayload,
	UpdateProductPayload,
} from "../../../features/admin/product/types";
import StatusBadge from "../../../features/admin/product/components/status-badge";
import ProductFormModal from "../../../features/admin/product/components/product-form-modal";
import SkuFormModal from "../../../features/admin/product/components/sku-form-modal";
import SkuCard from "../../../features/admin/product/components/sku-card";

/**
 * Trang chi tiết sản phẩm — nơi duy nhất quản lý biến thể (SKU) và ảnh, vì
 * backend yêu cầu productId (và skuId khi thêm ảnh) đã tồn tại trước.
 * Route "/admin/product/:id" yêu cầu "catalog:read" để xem; các hành động ghi
 * cụ thể được ẩn theo đúng permission tương ứng ở backend:
 * - Sửa/xóa sản phẩm, SKU, ảnh -> "catalog:write"
 * - Sửa tồn kho -> "inventory:update" (permission riêng, tách khỏi catalog:write)
 */
const AdminProductDetailPage = () => {
	const { id } = useParams();
	const productId = Number(id);
	const navigate = useNavigate();
	const { can } = useAuth();
	const canWriteCatalog = can(permissions.catalog.write);
	const canUpdateInventory = can(permissions.inventory.update);

	const { data: product, isLoading } = useProductQuery(productId);
	const updateProduct = useUpdateProduct();
	const deleteProduct = useDeleteProduct();
	const createSku = useCreateSku();
	const updateSku = useUpdateSku();
	const deleteSku = useDeleteSku();

	const [isEditingProduct, setIsEditingProduct] = useState(false);
	const [skuFormState, setSkuFormState] = useState<{ sku?: ProductSku } | null>(null);
	const [deletingSku, setDeletingSku] = useState<ProductSku | null>(null);
	const [isDeletingProduct, setIsDeletingProduct] = useState(false);

	if (isLoading) {
		return <p className='py-10 text-center text-muted'>Đang tải...</p>;
	}

	if (!product) {
		return <p className='py-10 text-center text-muted'>Không tìm thấy sản phẩm.</p>;
	}

	const handleUpdateProduct = (payload: CreateProductPayload | UpdateProductPayload) => {
		updateProduct.mutate({ id: productId, ...payload } as UpdateProductPayload, {
			onSuccess: () => setIsEditingProduct(false),
		});
	};

	const handleSubmitSku = (payload: SkuPayload) => {
		if (skuFormState?.sku) {
			updateSku.mutate(
				{ productId, skuId: skuFormState.sku.id, ...payload },
				{ onSuccess: () => setSkuFormState(null) },
			);
		} else {
			createSku.mutate({ productId, ...payload }, { onSuccess: () => setSkuFormState(null) });
		}
	};

	const handleConfirmDeleteSku = () => {
		if (!deletingSku) return;
		deleteSku.mutate({ productId, skuId: deletingSku.id }, { onSuccess: () => setDeletingSku(null) });
	};

	const handleConfirmDeleteProduct = () => {
		deleteProduct.mutate(productId, {
			onSuccess: () => {
				setIsDeletingProduct(false);
				navigate(paths.admin.product);
			},
		});
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start justify-between gap-3'>
				<AdminTitle title={product.name} description={product.category?.name ?? "Chưa phân loại danh mục"} />
				{canWriteCatalog && (
					<div className='flex items-center gap-2'>
						<Button
							size='sm'
							variant='outline'
							icon={<PencilIcon className='h-4 w-4' />}
							onClick={() => setIsEditingProduct(true)}>
							Sửa thông tin
						</Button>
						<Button
							size='sm'
							variant='outline'
							icon={<TrashIcon className='h-4 w-4' />}
							className='border-red-200 text-red-600 hover:border-red-400 hover:text-red-700'
							onClick={() => setIsDeletingProduct(true)}>
							Xóa sản phẩm
						</Button>
					</div>
				)}
			</div>

			{/* Thông tin cơ bản */}
			<div className='rounded-2xl border border-border bg-surface p-5'>
				<div className='flex flex-wrap items-center gap-3'>
					<StatusBadge isActive={product.isActive} />
					<span className='text-xs text-muted'>Slug: /{product.slug}</span>
					{product.averageRating !== null && (
						<span className='flex items-center gap-1 text-xs text-muted'>
							<StarIcon className='h-3.5 w-3.5 text-amber-500' />
							{product.averageRating} ({product.reviews.length} đánh giá)
						</span>
					)}
				</div>
				{product.description && <p className='mt-3 whitespace-pre-line text-sm text-ink/80'>{product.description}</p>}
			</div>

			{/* Biến thể (SKU) */}
			<div className='space-y-3'>
				<div className='flex items-center justify-between'>
					<h2 className='text-lg font-bold text-ink'>Biến thể ({product.skus.length})</h2>
					{canWriteCatalog && (
						<Button
							size='sm'
							variant='outline'
							icon={<PlusIcon className='h-4 w-4' />}
							onClick={() => setSkuFormState({})}>
							Thêm biến thể
						</Button>
					)}
				</div>

				{product.skus.length === 0 ? (
					<div className='rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted'>
						Chưa có biến thể nào.
					</div>
				) : (
					<div className='grid gap-4 md:grid-cols-2'>
						{product.skus.map((sku) => (
							<SkuCard
								key={sku.id}
								productId={productId}
								sku={sku}
								canWriteCatalog={canWriteCatalog}
								canUpdateInventory={canUpdateInventory}
								onEdit={() => setSkuFormState({ sku })}
								onDelete={() => setDeletingSku(sku)}
							/>
						))}
					</div>
				)}
			</div>

			{isEditingProduct && (
				<ProductFormModal
					product={product}
					onClose={() => setIsEditingProduct(false)}
					onSubmit={handleUpdateProduct}
					isSubmitting={updateProduct.isPending}
				/>
			)}

			{skuFormState && (
				<SkuFormModal
					sku={skuFormState.sku}
					onClose={() => setSkuFormState(null)}
					onSubmit={handleSubmitSku}
					isSubmitting={createSku.isPending || updateSku.isPending}
				/>
			)}

			{deletingSku && (
				<Popup
					title='Xóa biến thể'
					description={`Bạn có chắc muốn xóa biến thể "${deletingSku.sku}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa biến thể'
					isConfirming={deleteSku.isPending}
					onConfirm={handleConfirmDeleteSku}
					onClose={() => setDeletingSku(null)}
				/>
			)}

			{isDeletingProduct && (
				<Popup
					title='Xóa sản phẩm'
					description={`Bạn có chắc muốn xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa sản phẩm'
					isConfirming={deleteProduct.isPending}
					onConfirm={handleConfirmDeleteProduct}
					onClose={() => setIsDeletingProduct(false)}
				/>
			)}
		</div>
	);
};

export default AdminProductDetailPage;
