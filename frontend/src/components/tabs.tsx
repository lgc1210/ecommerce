import { createContext, useContext, type ReactNode } from "react";

interface TabsContextValue {
	activeValue: string;
	onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps<T extends string> {
	/** Value của tab đang active, do component cha tự giữ state (controlled). */
	value: T;
	onChange: (value: T) => void;
	children: ReactNode;
	className?: string;
}

/**
 * Component tab dùng chung, chỉ chịu trách nhiệm render dải tab-trigger (giống
 * <Tabs>/<TabItem> của các thư viện UI phổ biến). Nội dung từng tab KHÔNG nằm
 * trong <TabItem> — component cha tự quyết định render gì dựa trên state `value`,
 * để tránh ép nội dung phức tạp (form, danh sách, ...) vào bên trong component tab.
 *
 * Ví dụ dùng:
 * ```tsx
 * type Tab = "profile" | "addresses";
 * const [tab, setTab] = useState<Tab>("profile");
 *
 * <Tabs value={tab} onChange={setTab}>
 *   <TabItem value="profile" icon={<UserIcon className="h-4 w-4" />}>Thông tin tài khoản</TabItem>
 *   <TabItem value="addresses" icon={<MapPinIcon className="h-4 w-4" />}>Sổ địa chỉ</TabItem>
 * </Tabs>
 *
 * {tab === "profile" ? <ProfileTab /> : <AddressesTab />}
 * ```
 */
function Tabs<T extends string>({ value, onChange, children, className = "" }: TabsProps<T>) {
	return (
		<TabsContext.Provider value={{ activeValue: value, onChange: onChange as (value: string) => void }}>
			<div className={`flex gap-2 border-b border-border ${className}`}>{children}</div>
		</TabsContext.Provider>
	);
}

interface TabItemProps<T extends string> {
	value: T;
	icon?: ReactNode;
	children: ReactNode;
}

function TabItem<T extends string>({ value, icon, children }: TabItemProps<T>) {
	const context = useContext(TabsContext);
	if (!context) throw new Error("TabItem phải được đặt bên trong <Tabs>.");

	const isActive = context.activeValue === value;

	return (
		<button
			type='button'
			onClick={() => context.onChange(value)}
			className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors cursor-default ${
				isActive ? "border-primary text-primary-dark" : "border-transparent text-muted hover:text-ink"
			}`}>
			{icon}
			{children}
		</button>
	);
}

export { Tabs, TabItem };
