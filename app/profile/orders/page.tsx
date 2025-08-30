"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaymentModal from "@/components/ui/PaymentModal";
import OffersModal from "@/components/ui/OffersModal";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
	const [list, setList] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [payOpen, setPayOpen] = useState(false);
	const [payRequestId, setPayRequestId] = useState<string | null>(null);
	const [payAmount, setPayAmount] = useState(0);
	const [offersOpen, setOffersOpen] = useState(false);
	const [activeRequest, setActiveRequest] = useState<any>(null);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [tab, setTab] = useState<"tours" | "shop" | "restaurant">("tours");
	const [orders, setOrders] = useState<any[]>([]);
	const [ordersLoading, setOrdersLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();

	// loaders
	const fetchList = async () => {
		setLoading(true);
		const res = await fetch("/api/tours/my");
		if (!res.ok) {
			setLoading(false);
			return;
		}
		const d = await res.json();
		setList(d.requests || []);
		setLoading(false);
	};

	const fetchOrders = async (type?: string) => {
		setOrdersLoading(true);
		const res = await fetch(`/api/orders`);
		if (!res.ok) {
			setOrdersLoading(false);
			return;
		}
		const d = await res.json();
		let list = d.orders || [];
		if (type) {
			list = list.filter(
				(o: any) => String(o.seller?.userType) === String(type)
			);
		}
		setOrders(list || []);
		setOrdersLoading(false);
	};

	useEffect(() => {
		fetchList();
		// initial orders load
		fetchOrders();
		// if ?pay=<id> present, open the payment modal after list loads
		const payId = searchParams?.get("pay");
		if (payId) {
			setTimeout(() => {
				const found = (list || []).find((x) => x._id === payId);
				const amt = found
					? found.veteranOffer ??
					  found.newbieOffer ??
					  found.estimatePrice ??
					  0
					: 0;
				setPayRequestId(payId);
				setPayAmount(amt);
				setPayOpen(true);
			}, 300);
		}
	}, []);
	useEffect(() => {
		let mounted = true;
		const init = async () => {
			try {
				const me = await fetch("/api/auth/me", { cache: "no-store" });
				if (me.ok) {
					const d = await me.json();
					if (mounted) setCurrentUser(d.user || null);
				}
			} catch (e) {}
			const iv = setInterval(() => fetchList(), 5000);
			return () => {
				mounted = false;
				clearInterval(iv);
			};
		};
		init();
	}, []);

	useEffect(() => {
		if (tab === "tours") return;
		const type = tab === "shop" ? "local_shop" : "restaurant";
		fetchOrders(type);
	}, [tab]);

	return (
		<div className="p-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">My Orders</h1>
				<div className="flex gap-2">
					<button
						className={`px-3 py-1 rounded ${
							tab === "tours" ? "bg-primary text-white" : "border"
						}`}
						onClick={() => setTab("tours")}
					>
						Tours
					</button>
					<button
						className={`px-3 py-1 rounded ${
							tab === "shop" ? "bg-primary text-white" : "border"
						}`}
						onClick={() => setTab("shop")}
					>
						Shop
					</button>
					<button
						className={`px-3 py-1 rounded ${
							tab === "restaurant"
								? "bg-primary text-white"
								: "border"
						}`}
						onClick={() => setTab("restaurant")}
					>
						Restaurant
					</button>
				</div>
			</div>
			{loading && <div>Loading…</div>}
			{tab === "tours" ? (
				<div className="space-y-4 mt-4">
					{list.map((t: any) => {
						const getId = (u: any) =>
							u ? u._id ?? u.id ?? u : null;
						const lastOffer = (t.offers || []).slice(-1)[0];
						const lastWho = lastOffer ? lastOffer.who : null;
						const newbieId = getId(t.newbie);
						const vetId = getId(t.veteran);
						const isNewbie =
							currentUser &&
							String(currentUser.id) === String(newbieId);
						const isVeteran =
							currentUser &&
							String(currentUser.id) === String(vetId);
						const actionable =
							t.status === "requested" || t.status === "offered";
						const myTurn = (() => {
							if (!actionable) return false;
							if (!lastWho) return isNewbie; // if no offers yet, newbie starts
							if (lastWho === "newbie") return isVeteran;
							if (lastWho === "veteran") return isNewbie;
							return false;
						})();

						return (
							<div
								key={t._id}
								data-request={t._id}
								className="border rounded p-3"
							>
								<div className="flex justify-between items-center">
									<div>
										<div className="font-medium">
											{t.place?.name || "Place"}
										</div>
										<div className="text-sm text-muted-foreground">{`${new Date(
											t.startTime
										).toLocaleString(undefined, {
											dateStyle: "medium",
											timeStyle: "short",
										})} - ${new Date(
											t.endTime
										).toLocaleString(undefined, {
											dateStyle: "medium",
											timeStyle: "short",
										})}`}</div>
									</div>
									<div className="text-sm flex items-center gap-2">
										<span className="capitalize">
											{t.status}
										</span>
										{t.status === "confirmed" && (
											<Badge variant="secondary">
												Confirmed
											</Badge>
										)}
									</div>
								</div>

								<div className="mt-2">
									<div className="mb-2 font-medium">
										Offer history
									</div>
									{Array.isArray(t.offers) &&
									t.offers.length ? (
										<div className="space-y-1">
											{t.offers.map(
												(o: any, i: number) => (
													<div
														key={i}
														className="text-sm"
													>
														<strong>{o.who}</strong>
														: ৳{o.amount} •{" "}
														{new Date(
															o.at
														).toLocaleString()}
													</div>
												)
											)}
										</div>
									) : (
										<div className="text-sm text-muted-foreground">
											No offers yet
										</div>
									)}
								</div>

								{myTurn && (
									<div className="mt-3 flex items-center justify-end gap-2">
										<button
											className="btn"
											onClick={() => {
												setActiveRequest(t);
												setOffersOpen(true);
											}}
										>
											View Offers
										</button>
									</div>
								)}
								{t.status === "completed" && (
									<div className="mt-3 flex items-center justify-end gap-2">
										<Badge variant="secondary">Paid</Badge>
									</div>
								)}

								{t.status === "confirmed" && isNewbie && (
									<div className="mt-3 flex items-center justify-end gap-2">
										<button
											className="btn"
											onClick={() => {
												const amt =
													t.veteranOffer ??
													t.newbieOffer ??
													t.estimatePrice ??
													0;
												setPayAmount(amt);
												setPayRequestId(t._id);
												setPayOpen(true);
											}}
										>
											Pay
										</button>
										<PaymentModal
											open={payOpen}
											onOpenChange={(v: boolean) => {
												setPayOpen(v);
												if (!v) {
													setPayRequestId(null);
													// remove pay param from url
													try {
														const url = new URL(
															window.location.href
														);
														url.searchParams.delete(
															"pay"
														);
														history.replaceState(
															{},
															"",
															url.pathname +
																url.search
														);
													} catch (e) {}
												}
											}}
											requestId={payRequestId}
											amount={payAmount}
											onPaid={(d) => {
												fetchList();
											}}
										/>
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<div className="space-y-4 mt-4">
					{ordersLoading && <div>Loading…</div>}
					{!ordersLoading && orders.length === 0 && (
						<div>No orders</div>
					)}
					{orders.map((o: any) => (
						<div key={o._id} className="border rounded p-3">
							<div className="flex justify-between items-center">
								<div>
									<div className="font-medium">
										Order {o._id}
									</div>
									<div className="text-sm text-muted-foreground">
										{o.items?.length || 0} items • ৳
										{o.total}
									</div>
								</div>
								<div className="text-sm flex items-center gap-2">
									<span className="capitalize">
										{o.status}
									</span>
									{(o.status === "paid" ||
										o.status === "completed") && (
										<Badge variant="secondary">Paid</Badge>
									)}
								</div>
							</div>
							<div className="mt-2 text-sm">
								{o.items?.map((it: any) => (
									<div
										key={it.product}
										className="flex justify-between"
									>
										<div>
											{it.name} x {it.quantity}
										</div>
										<div>৳{it.price * it.quantity}</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			<OffersModal
				open={offersOpen}
				onOpenChange={(v: boolean) => {
					setOffersOpen(v);
					if (!v) setActiveRequest(null);
				}}
				request={activeRequest}
				currentUser={currentUser}
				onUpdated={(tr: any) => {
					setList((arr) =>
						arr.map((x) => (x._id === tr._id ? tr : x))
					);
				}}
			/>
		</div>
	);
}
