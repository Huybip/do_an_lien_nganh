import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dental-900 via-dental-800 to-mint-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 items-center justify-center text-white text-2xl mb-3">🦷</div>
          <h1 className="font-display font-bold text-2xl text-white">Vinamec</h1>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
          <h2 className="font-display font-bold text-2xl text-surface-900 mb-1">Create Account</h2>
          <p className="text-surface-500 text-sm mb-6">Join Vinamec Dental Care System</p>

          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">⚠️ {error}</div>}
          {success && <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600">✅ Registered successfully! Redirecting...</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" type="text" className="input" placeholder="Nguyễn Văn A"
                value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" type="tel" className="input" placeholder="0901234567"
                value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div>
              <label className="label">Role</label>
              <select name="role" className="input" value={form.role} onChange={handleChange}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading || success}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-dental-600 font-semibold hover:text-dental-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}