import type { CSSProperties } from "react";

interface SkeletonProps {
	className?: string;
	style?: CSSProperties;
}

/** Khối skeleton dùng chung, style đồng bộ với animate-pulse đã dùng trong StatCard. */
const Skeleton = ({ className = "", style }: SkeletonProps) => <div className={`animate-pulse rounded-md bg-cream-soft ${className}`} style={style} />;

export default Skeleton;
