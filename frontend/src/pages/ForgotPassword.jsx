import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Truck, ArrowLeft, Mail, ShieldCheck } from 'lucide-react'
import { authService } from '../services/api'

function ForgotPassword() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1 = enter email, 2 = enter OTP
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [resendTimer, setResendTimer] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const otpRefs = useRef([])

    // Countdown timer for resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer(prev => prev - 1)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [resendTimer])

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        try {
            await authService.forgotPassword(email)
            setStep(2)
            setResendTimer(60)
        } catch (err) {
            const detail = err?.response?.data?.detail
            setError(typeof detail === 'string' ? detail : 'Failed to send OTP. Check your email.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        setError('')

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index, e) => {
        // On backspace, move to previous input
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').trim()
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('')
            setOtp(digits)
            otpRefs.current[5]?.focus()
        }
    }

    const handleResendOtp = async () => {
        if (resendTimer > 0) return
        setResendTimer(60)
        setOtp(['', '', '', '', '', ''])
        setError('')
        otpRefs.current[0]?.focus()
        try { await authService.forgotPassword(email) } catch (_) { }
    }

    const handleVerifyOtp = (e) => {
        e.preventDefault()
        const otpValue = otp.join('')
        if (otpValue.length !== 6) {
            setError('Please enter the complete 6-digit OTP')
            return
        }
        // Persist to sessionStorage so ResetPassword works even after page reload
        sessionStorage.setItem('reset_email', email)
        sessionStorage.setItem('reset_otp', otpValue)
        // Navigate to reset password page with email and OTP in state
        navigate('/reset-password', { state: { email, otp: otpValue } })
    }

    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
        : ''

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '440px' }}>
                <div className="auth-logo">
                    <Truck size={48} />
                </div>

                {/* Step 1: Enter Email */}
                {step === 1 && (
                    <div className="auth-step-content fade-in">
                        <h2 className="auth-title">Forgot Password?</h2>
                        <p className="auth-subtitle">
                            No worries! Enter your email address and we'll send you a verification code.
                        </p>

                        <form onSubmit={handleEmailSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-icon-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        className="form-input form-input-icon"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError('') }}
                                        required
                                        id="forgot-email-input"
                                    />
                                </div>
                            </div>

                            {error && <p className="auth-error">{error}</p>}

                            <button
                                type="submit"
                                className="btn btn-primary auth-btn"
                                disabled={isSubmitting}
                                id="send-otp-btn"
                            >
                                {isSubmitting ? (
                                    <span className="btn-loading">
                                        <span className="spinner-small"></span>
                                        Sending OTP...
                                    </span>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>
                        </form>

                        <p className="auth-footer">
                            Remember your password? <Link to="/login">Back to Login</Link>
                        </p>
                    </div>
                )}

                {/* Step 2: Enter OTP */}
                {step === 2 && (
                    <div className="auth-step-content fade-in">
                        <div className="otp-icon-wrapper">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="auth-title">Verify OTP</h2>
                        <p className="auth-subtitle">
                            We've sent a 6-digit verification code to<br />
                            <strong style={{ color: 'var(--primary-blue)' }}>{maskedEmail}</strong>
                        </p>

                        <form onSubmit={handleVerifyOtp}>
                            <div className="otp-container" onPaste={handleOtpPaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        className={`otp-input ${digit ? 'otp-filled' : ''} ${error ? 'otp-error' : ''}`}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        autoFocus={index === 0}
                                        id={`otp-input-${index}`}
                                    />
                                ))}
                            </div>

                            {error && <p className="auth-error" style={{ textAlign: 'center' }}>{error}</p>}

                            <button
                                type="submit"
                                className="btn btn-primary auth-btn"
                                disabled={isSubmitting}
                                id="verify-otp-btn"
                            >
                                {isSubmitting ? (
                                    <span className="btn-loading">
                                        <span className="spinner-small"></span>
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify & Continue'
                                )}
                            </button>
                        </form>

                        <div className="otp-resend">
                            {resendTimer > 0 ? (
                                <p className="resend-timer">
                                    Resend code in <strong>{resendTimer}s</strong>
                                </p>
                            ) : (
                                <button className="resend-btn" onClick={handleResendOtp} id="resend-otp-btn">
                                    Didn't receive the code? <strong>Resend OTP</strong>
                                </button>
                            )}
                        </div>

                        <button
                            className="back-link"
                            onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError('') }}
                            id="back-to-email-btn"
                        >
                            <ArrowLeft size={16} />
                            Change email address
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ForgotPassword
