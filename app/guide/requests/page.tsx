"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GuideRequestsPage() {
    const [user, setUser] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const me = await fetch('/api/auth/me', { cache: 'no-store' });
                if (!me.ok) { setUser(null); setLoading(false); return; }
                const m = await me.json();
                setUser(m.user || null);

                const res = await fetch('/api/tours/requests');
                const d = await res.json();
                setRequests(d.requests || []);
            } catch (e) {
                setError('Failed to load');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    async function updateStatus(id: string, status: string) {
        try {
            const res = await fetch(`/api/tours/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const d = await res.json();
            if (res.ok) {
                setRequests((r) => r.map(x => x._id === id ? (d.tourRequest || x) : x));
            } else {
                alert(d.error || 'Failed to update');
            }
        } catch (e) {
            alert('Failed to update');
        }
    }

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Please sign in as a guide to view requests.</div>;
    if (user.userType !== 'veteran') return <div>Only tour guides can view this page.</div>;

    const my = requests.filter(r => r.veteran && r.veteran._id === user.id);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Tour Requests</h1>
            {my.length === 0 && <div>No requests yet.</div>}
            <div className="grid gap-3">
                {my.map(r => (
                    <Card key={r._id}>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{r.newbie?.name || r.newbie}</div>
                                    <div className="text-sm text-muted-foreground">{r.place?.name || 'Place'}</div>
                                    <div className="text-sm text-muted-foreground">{new Date(r.time).toLocaleString()}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm">Status: <strong>{r.status}</strong></div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => updateStatus(r._id, 'offered')}>Offer</Button>
                                        <Button onClick={() => updateStatus(r._id, 'confirmed')}>Confirm</Button>
                                        <Button onClick={() => updateStatus(r._id, 'cancelled')}>Cancel</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
