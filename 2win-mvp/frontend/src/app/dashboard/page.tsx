"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface BodyPart {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  temperature?: number;
  pain?: number;
  description: string;
}

interface Prediction {
  disease: string;
  risk: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const router = useRouter();
  const RENDER_API_BASE_URL = "http://localhost:8000";

  // Real data states
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [medicalAlerts, setMedicalAlerts] = useState<any[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

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
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Fetch health metrics
  useEffect(() => {
    const fetchHealthMetrics = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${RENDER_API_BASE_URL}/api/health/metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHealthMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching health metrics:', error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    if (user) {
      fetchHealthMetrics();
      // Refresh every 30 seconds
      const interval = setInterval(fetchHealthMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch body scan data
  useEffect(() => {
    const fetchBodyScan = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${RENDER_API_BASE_URL}/api/health/body-scan`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBodyParts(data);
        }
      } catch (error) {
        console.error('Error fetching body scan:', error);
      }
    };

    if (user) {
      fetchBodyScan();
    }
  }, [user]);

  // Fetch predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${RENDER_API_BASE_URL}/api/health/predictions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPredictions(data);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setLoadingPredictions(false);
      }
    };

    if (user) {
      fetchPredictions();
      // Refresh every 5 minutes
      const interval = setInterval(fetchPredictions, 300000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch medical alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${RENDER_API_BASE_URL}/api/health/alerts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Format alerts for display
          const formattedAlerts = data.map((alert: any) => ({
            ...alert,
            time: formatTimeAgo(new Date(alert.timestamp))
          }));
          setMedicalAlerts(formattedAlerts);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoadingAlerts(false);
      }
    };

    if (user) {
      fetchAlerts();
      // Refresh every minute
      const interval = setInterval(fetchAlerts, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Helper function to format time
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'healthy':
      case 'low':
        return 'text-green-400 bg-green-900/20 border-green-500/50';
      case 'warning':
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50';
      case 'critical':
      case 'high':
        return 'text-red-400 bg-red-900/20 border-red-500/50';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/50';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'from-green-500 to-green-600';
    if (risk < 70) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading health dashboard...</p>
        </div>
      </div>
    );
  }

  const isLoading = loadingMetrics || loadingPredictions || loadingAlerts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black gradient-text mb-2">Health Dashboard</h1>
            <p className="text-slate-300">Welcome back, {user?.name || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Medical Alerts */}
        {medicalAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {medicalAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border flex items-center justify-between ${alert.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-300' :
                  alert.type === 'info' ? 'bg-blue-900/20 border-blue-500/50 text-blue-300' :
                    'bg-green-900/20 border-green-500/50 text-green-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {alert.type === 'warning' ? '⚠️' : alert.type === 'info' ? 'ℹ️' : '✅'}
                  </span>
                  <span>{alert.message}</span>
                </div>
                <span className="text-sm opacity-75">{alert.time}</span>
              </div>
            ))}
          </div>
        )}

        {loadingAlerts && (
          <div className="mb-6 p-4 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-500"></div>
              <span className="text-slate-300">Loading medical alerts...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Interactive Human Body */}
          <div className="xl:col-span-1">
            <div className="glass p-6 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Body Health Map</h2>

              {/* Simple SVG Body Representation */}
              <div className="relative bg-slate-800/30 rounded-xl p-8 mb-6">
                <svg viewBox="0 0 200 300" className="w-full h-full">
                  {/* Head */}
                  <circle
                    cx="100"
                    cy="30"
                    r="20"
                    className={`cursor-pointer transition-all ${bodyParts.find(p => p.id === 'head')?.status === 'healthy' ? 'fill-green-500' :
                      bodyParts.find(p => p.id === 'head')?.status === 'warning' ? 'fill-yellow-500' :
                        'fill-red-500'
                      }`}
                    onClick={() => setSelectedBodyPart('head')}
                    opacity="0.7"
                  />

                  {/* Body */}
                  <rect
                    x="80"
                    y="50"
                    width="40"
                    height="60"
                    className={`cursor-pointer transition-all ${bodyParts.find(p => p.id === 'chest')?.status === 'healthy' ? 'fill-green-500' :
                      bodyParts.find(p => p.id === 'chest')?.status === 'warning' ? 'fill-yellow-500' :
                        'fill-red-500'
                      }`}
                    onClick={() => setSelectedBodyPart('chest')}
                    opacity="0.7"
                  />

                  {/* Abdomen */}
                  <rect
                    x="80"
                    y="110"
                    width="40"
                    height="40"
                    className={`cursor-pointer transition-all ${bodyParts.find(p => p.id === 'abdomen')?.status === 'healthy' ? 'fill-green-500' :
                      bodyParts.find(p => p.id === 'abdomen')?.status === 'warning' ? 'fill-yellow-500' :
                        'fill-red-500'
                      }`}
                    onClick={() => setSelectedBodyPart('abdomen')}
                    opacity="0.7"
                  />

                  {/* Arms */}
                  <rect
                    x="60"
                    y="60"
                    width="15"
                    height="50"
                    className={`cursor-pointer transition-all ${bodyParts.find(p => p.id === 'left-arm')?.status === 'healthy' ? 'fill-green-500' :
                      bodyParts.find(p => p.id === 'left-arm')?.status === 'warning' ? 'fill-yellow-500' :
                        'fill-red-500'
                      }`}
                    onClick={() => setSelectedBodyPart('left-arm')}
                    opacity="0.7"
                  />
                  <rect
                    x="125"
                    y="60"
                    width="15"
                    height="50"
                    className={`cursor-pointer transition-all ${bodyParts.find(p => p.id === 'right-arm')?.status === 'healthy' ? 'fill-green-500' :
                      bodyParts.find(p => p.id === 'right-arm')?.status === 'warning' ? 'fill-yellow-500' :
                        'fill-red-500'
                      }`}
                    onClick={() => setSelectedBodyPart('right-arm')}
                    opacity="0.7"
                  />

                  {/* Legs */}
                  <rect
                    x="85"
                    y="150"
                    width="12"
                    height="60"
                    className={`cursor-pointer transition-all ${bodyParts.find(p => p.id === 'left-leg')?.status === 'healthy' ? 'fill-green-500' :
                      bodyParts.find(p => p.id === 'left-leg')?.status === 'warning' ? 'fill-yellow-500' :
                        'fill-red-500'
                      }`}
                    onClick={() => setSelectedBodyPart('left-leg')}
                    opacity="0.7"
                  />
                  <rect
                    x="103"
                    y="150"
                    width="12"
                    height="60"
                    className={`cursor-pointer transition-all ${bodyParts.find(p => p.id === 'right-leg')?.status === 'healthy' ? 'fill-green-500' :
                      bodyParts.find(p => p.id === 'right-leg')?.status === 'warning' ? 'fill-yellow-500' :
                        'fill-red-500'
                      }`}
                    onClick={() => setSelectedBodyPart('right-leg')}
                    opacity="0.7"
                  />
                </svg>
              </div>

              {/* Selected Body Part Details */}
              {selectedBodyPart && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">
                      {bodyParts.find(p => p.id === selectedBodyPart)?.name}
                    </h3>
                    <button
                      onClick={() => setSelectedBodyPart(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-300 text-sm">
                    {bodyParts.find(p => p.id === selectedBodyPart)?.description}
                  </p>
                  {bodyParts.find(p => p.id === selectedBodyPart)?.temperature && (
                    <div className="mt-2">
                      <span className="text-slate-400 text-sm">Temperature: </span>
                      <span className="text-cyan-400">
                        {bodyParts.find(p => p.id === selectedBodyPart)?.temperature}°F
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 flex justify-around text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-slate-400">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-slate-400">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-slate-400">Critical</span>
                </div>
              </div>
            </div>
          </div>

          {/* Disease Prediction Panel */}
          <div className="xl:col-span-1">
            <div className="glass p-6 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Disease Risk Analysis</h2>

              <div className="space-y-6">
                {loadingPredictions ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-slate-300">Loading predictions...</p>
                  </div>
                ) : predictions.length > 0 ? (
                  predictions.map((prediction, index) => (
                    <div key={index} className="border border-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-white">{prediction.disease}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(prediction.level)}`}>
                          {prediction.level.toUpperCase()}
                        </span>
                      </div>

                      {/* Risk Score */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Risk Score</span>
                          <span className="text-white font-medium">{prediction.risk}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full bg-gradient-to-r ${getRiskColor(prediction.risk)}`}
                            style={{ width: `${prediction.risk}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Contributing Factors */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Contributing Factors:</h4>
                        <ul className="space-y-1">
                          {prediction.factors.map((factor, idx) => (
                            <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                              <span className="text-yellow-400">•</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {prediction.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    No predictions available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Health Metrics */}
          <div className="xl:col-span-1">
            <div className="glass p-6 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Real-time Metrics</h2>

              <div className="space-y-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="border border-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-white">{metric.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-bold text-cyan-400">
                            {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                          </span>
                          <span className="text-slate-400 text-sm">{metric.unit}</span>
                          <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
                        {metric.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Mini Chart Placeholder */}
                    <div className="mt-3 h-12 bg-slate-800/30 rounded flex items-end justify-around p-2">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-cyan-500/50 rounded-t"
                          style={{ height: `${Math.random() * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity Summary */}
              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                <h3 className="font-medium text-white mb-3">Today's Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">6,543</div>
                    <div className="text-xs text-slate-400">Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">7.2</div>
                    <div className="text-xs text-slate-400">Hours Sleep</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">2.1</div>
                    <div className="text-xs text-slate-400">Liters Water</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">85</div>
                    <div className="text-xs text-slate-400">Minutes Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 glass p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm text-white">View Reports</p>
            </button>
            <button className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors text-center">
              <div className="text-2xl mb-2">👨‍⚕️</div>
              <p className="text-sm text-white">Consult Doctor</p>
            </button>
            <button className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors text-center">
              <div className="text-2xl mb-2">💊</div>
              <p className="text-sm text-white">Medications</p>
            </button>
            <button className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-sm text-white">Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
