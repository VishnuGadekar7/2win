"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const RENDER_API_BASE_URL = "https://twowin-8mg4.onrender.com";

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${RENDER_API_BASE_URL}/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black gradient-text">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div
            className="glass p-6 rounded-2xl shadow-xl cursor-pointer hover:bg-slate-800/70 transition-colors"
            onClick={() => router.push('/profile')}
          >
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl mr-4">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">View Profile</h2>
                <p className="text-slate-300">Update your personal information</p>
              </div>
            </div>
          </div>

          {/* Health Stats Card */}
          <div className="glass p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Health Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Daily Steps</p>
                <div className="w-full bg-slate-800 rounded-full h-4 mt-1">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-4 rounded-full"
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <p className="text-right text-sm text-slate-400 mt-1">6,500 / 10,000</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Water Intake</p>
                <div className="w-full bg-slate-800 rounded-full h-4 mt-1">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full"
                    style={{ width: '80%' }}
                  ></div>
                </div>
                <p className="text-right text-sm text-slate-400 mt-1">2.4L / 3L</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors text-center">
                <div className="text-2xl mb-2">🏋️</div>
                <p className="text-sm">Workout</p>
              </button>
              <button className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors text-center">
                <div className="text-2xl mb-2">🍎</div>
                <p className="text-sm">Nutrition</p>
              </button>
              <button className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors text-center">
                <div className="text-2xl mb-2">😴</div>
                <p className="text-sm">Sleep</p>
              </button>
              <button className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors text-center">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm">Analytics</p>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass p-6 rounded-2xl shadow-xl mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { id: 1, type: 'workout', title: 'Morning Run', time: '2 hours ago', duration: '30 min', calories: '320 cal' },
              { id: 2, type: 'meal', title: 'Lunch', time: '5 hours ago', calories: '650 cal' },
              { id: 3, type: 'water', title: 'Water Intake', time: '3 hours ago', amount: '500ml' },
            ].map((activity) => (
              <div key={activity.id} className="flex items-center p-4 bg-slate-800/50 rounded-xl">
                <div className="p-3 bg-slate-700/50 rounded-lg mr-4">
                  {activity.type === 'workout' && '🏃'}
                  {activity.type === 'meal' && '🍽️'}
                  {activity.type === 'water' && '💧'}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{activity.title}</h3>
                  <p className="text-sm text-slate-400">{activity.time}</p>
                </div>
                <div className="text-right">
                  {activity.duration && <p className="text-sm">{activity.duration}</p>}
                  {activity.calories && <p className="text-sm text-cyan-400">{activity.calories}</p>}
                  {activity.amount && <p className="text-sm text-blue-400">{activity.amount}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
