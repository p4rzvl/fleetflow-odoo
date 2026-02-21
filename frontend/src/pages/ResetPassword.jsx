import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Truck, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'
import { authService } from '../services/api'

function ResetPassword() {
    const navigate = useNavigate()
    const location = useLocation()
    // Fall back to sessionStorage so the form works after a page reload
    const email = location.state?.email || sessionStorage.getItem('reset_email') || ''
    const otp = location.state?.otp || sessionStorage.getItem('reset_otp') || ''

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, label: '', color: '' }
        let score = 0
        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[a-z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++

        if (score <= 2) return { level: score, label: 'Weak', color: 'var(--status-retired)' }
        if (score <= 3) return { level: score, label: 'Fair', color: 'var(--status-maintenance)' }
        if (score <= 4) return { level: score, label: 'Good', color: 'var(--primary-blue)' }
        return { level: score, label: 'Strong', color: 'var(--primary-green)' }
    }

    const strength = getPasswordStrength(formData.password)

    const passwordChecks = [
        { label: 'At least 8 characters', met: formData.password.length >= 8 },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
        { label: 'Contains a number', met: /[0-9]/.test(formData.password) },
        { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(formData.password) }
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsSubmitting(true)
        try {
            await authService.resetPassword(email, otp, formData.password)
            // Clear the persisted OTP session data
            sessionStorage.removeItem('reset_email')
            sessionStorage.removeItem('reset_otp')
            setSuccess(true)
            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            const detail = err?.response?.data?.detail
            setError(typeof detail === 'string' ? detail : 'Failed to reset password. OTP may be invalid or expired.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // If no email passed (user navigated directly), redirect
    if (!email && !success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-logo">
                        <Truck size={48} />
                    </div>
                    <h2 className="auth-title">Session Expired</h2>
                    <p className="auth-subtitle">
                        Your reset session has expired. Please start the process again.
                    </p>
                    <Link to="/forgot-password" className="btn btn-primary auth-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                        Go to Forgot Password
                    </Link>
                </div>
            </div>
        )
    }

    // Success Screen
    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card fade-in">
                    <div className="success-icon-wrapper">
                        <CheckCircle2 size={56} />
                    </div>
                    <h2 className="auth-title" style={{ color: 'var(--primary-green)' }}>
                        Password Reset Successfully!
                    </h2>
                    <p className="auth-subtitle">
                        Your password has been updated. You'll be redirected to the login page shortly.
                    </p>
                    <Link
                        to="/login"
                        className="btn btn-primary auth-btn"
                        style={{ textDecoration: 'none', textAlign: 'center' }}
                        id="go-to-login-btn"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="auth-card fade-in" style={{ maxWidth: '440px' }}>
                <div className="auth-logo">
                    <Truck size={48} />
                </div>

                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">
                    Create a new strong password for your account
                </p>

                <form onSubmit={handleSubmit}>
                    {/* New Password */}
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div className="input-icon-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-input form-input-icon form-input-password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                id="new-password-input"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                                id="toggle-password-btn"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Strength Bar */}
                        {formData.password && (
                            <div className="password-strength fade-in">
                                <div className="strength-bar-container">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className="strength-bar-segment"
                                            style={{
                                                background: level <= strength.level ? strength.color : 'var(--gray-200)',
                                                transition: 'background 0.3s ease'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="strength-label" style={{ color: strength.color }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Password Requirements */}
                    {formData.password && (
                        <div className="password-checks fade-in">
                            {passwordChecks.map((check, index) => (
                                <div
                                    key={index}
                                    className={`password-check-item ${check.met ? 'check-met' : 'check-unmet'}`}
                                >
                                    <CheckCircle2 size={14} />
                                    <span>{check.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Confirm Password */}
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Confirm Password</label>
                        <div className="input-icon-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                className="form-input form-input-icon form-input-password"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                id="confirm-password-input"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label="Toggle confirm password visibility"
                                id="toggle-confirm-password-btn"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="field-hint field-hint-error fade-in">Passwords do not match</p>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <p className="field-hint field-hint-success fade-in">Passwords match!</p>
                        )}
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button
                        type="submit"
                        className="btn btn-primary auth-btn"
                        disabled={isSubmitting || formData.password !== formData.confirmPassword || formData.password.length < 8}
                        id="reset-password-btn"
                    >
                        {isSubmitting ? (
                            <span className="btn-loading">
                                <span className="spinner-small"></span>
                                Resetting Password...
                            </span>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    <Link to="/login">← Back to Login</Link>
                </p>
            </div>
        </div>
    )
}

export default ResetPassword
