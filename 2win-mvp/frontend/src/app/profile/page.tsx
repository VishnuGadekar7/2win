"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DeviceManager from "@/components/DeviceManager";
import { useAuth } from "@/context/AuthContext";

function computeBMI(weight?: number, height?: number): number | null {
  if (!weight || !height || height === 0) return null;
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
  if (bmi < 25) return { label: "Normal", color: "text-emerald-400" };
  if (bmi < 30) return { label: "Overweight", color: "text-orange-400" };
  return { label: "Obese", color: "text-red-400" };
}

export default function ProfilePage() {
  const { user: authUser, token, isLoading: authLoading, refreshUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    height: "",
    weight: "",
    age: "",
  });
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          height: userData.height?.toString() || "",
          weight: userData.weight?.toString() || "",
          age: userData.age?.toString() || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, API_URL, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          age: formData.age ? parseInt(formData.age) : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();
      setUser(updatedUser);
      setEditing(false);
      await refreshUser();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(260_10%_4%)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/40 text-sm font-bold uppercase tracking-widest">Loading profile...</p>
        </div>
      </div>
    );
  }

  const bmi = computeBMI(user?.weight, user?.height);
  const bmiInfo = bmi ? bmiCategory(bmi) : null;

  return (
    <div className="min-h-screen bg-[hsl(260_10%_4%)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="text-primary hover:text-primary/80 flex items-center font-bold text-sm"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={() => (editing ? setEditing(false) : setEditing(true))}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-background rounded-xl transition-colors font-bold text-xs uppercase tracking-widest"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="glass p-8 rounded-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-black text-primary">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/30 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/30 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-foreground/40"
                      disabled
                    />
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-white tracking-tighter">
                    {user?.name || "User"}
                  </h1>
                  <p className="text-foreground/40 mt-1">{user?.email}</p>
                </>
              )}
            </div>
          </div>

          {/* Bio-stats Grid: Height, Weight, Age + BMI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Height */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 mb-3">
                Height
              </h3>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
                    placeholder="175"
                  />
                  <span className="text-foreground/30 text-xs font-bold">cm</span>
                </div>
              ) : (
                <p className="text-2xl font-black text-white">
                  {user?.height ? `${user.height} cm` : "—"}
                </p>
              )}
            </div>

            {/* Weight */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 mb-3">
                Weight
              </h3>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
                    placeholder="70"
                  />
                  <span className="text-foreground/30 text-xs font-bold">kg</span>
                </div>
              ) : (
                <p className="text-2xl font-black text-white">
                  {user?.weight ? `${user.weight} kg` : "—"}
                </p>
              )}
            </div>

            {/* Age */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 mb-3">
                Age
              </h3>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
                    placeholder="25"
                  />
                  <span className="text-foreground/30 text-xs font-bold">yrs</span>
                </div>
              ) : (
                <p className="text-2xl font-black text-white">
                  {user?.age ? `${user.age} years` : "—"}
                </p>
              )}
            </div>

            {/* BMI — Computed & Color-coded */}
            <div className="glass p-6 rounded-xl border-primary/10">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 mb-3">
                BMI
              </h3>
              {bmi !== null ? (
                <div>
                  <p className="text-2xl font-black text-white">{bmi}</p>
                  <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${bmiInfo?.color}`}>
                    {bmiInfo?.label}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-black text-foreground/20">—</p>
              )}
              <p className="text-[9px] text-foreground/20 mt-2 leading-relaxed">
                Used for health predictions
              </p>
            </div>
          </div>

          {editing && (
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-6 py-2.5 border border-white/10 text-foreground/40 rounded-xl hover:bg-white/5 transition-colors font-bold text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-background rounded-xl transition-colors font-bold text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Device Management Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-black text-white mb-6 tracking-tighter">
            Device Management
          </h2>
          <DeviceManager />
        </div>
      </div>
    </div>
  );
}