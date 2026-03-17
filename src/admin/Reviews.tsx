import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';

interface Review { id: string; userName: string; userEmail: string; menuItemName: string; menuItemImage: string; rating: number; text: string; status: string; createdAt: string }

const statusColors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))}</div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, avgRating: 0 });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin?action=reviews&filter=${filter}`);
      const data = await res.json();
      setReviews(data.reviews || []); setStats(data.stats || { total: 0, pending: 0, avgRating: 0 });
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchReviews(); }, [filter]);

  const updateReviewStatus = async (id: string, status: string) => {
    await adminFetch(`/api/admin?action=reviews&id=${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    await adminFetch(`/api/admin?action=reviews&id=${id}`, { method: 'DELETE' });
    fetchReviews();
  };

  const thisWeek = reviews.filter(r => new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  const statCards = [
    { label: 'Total Reviews', value: stats.total, color: 'bg-blue-500', icon: MessageSquare },
    { label: 'Avg Rating', value: stats.avgRating.toFixed(1), color: 'bg-yellow-500', icon: Star },
    { label: 'Pending Approval', value: stats.pending, color: 'bg-orange-500', icon: ThumbsUp },
    { label: 'This Week', value: thisWeek, color: 'bg-green-500', icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-lotus-dark">Reviews</h1><p className="text-gray-600">Moderate customer reviews</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => { const Icon = s.icon; return (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm">{s.label}</p><p className="text-2xl font-bold text-lotus-dark">{s.value}</p></div><div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div></div></div>
        ); })}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-lotus-gold text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {/* Reviews */}
      {loading ? <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-lotus-gold mx-auto" /></div> : reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">No reviews found</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-lotus-gold to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">{r.userName?.[0]?.toUpperCase() || '?'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div>
                      <p className="font-medium text-lotus-dark">{r.userName}</p>
                      <p className="text-xs text-gray-400">{r.userEmail}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusColors[r.status] || 'bg-gray-100'}`}>{r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}</span>
                  </div>
                  {r.menuItemName && <p className="text-sm text-gray-500 mb-1">Re: <span className="font-medium text-lotus-dark">{r.menuItemName}</span></p>}
                  <Stars rating={r.rating} />
                  <p className="text-gray-700 text-sm mt-2">{r.text}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t">
                {r.status !== 'approved' && <button onClick={() => updateReviewStatus(r.id, 'approved')} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> Approve</button>}
                {r.status !== 'rejected' && <button onClick={() => updateReviewStatus(r.id, 'rejected')} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5" /> Reject</button>}
                <button onClick={() => deleteReview(r.id)} className="px-3 py-1.5 text-gray-400 hover:text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center gap-1 ml-auto"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
