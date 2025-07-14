import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
// import { setUser } from "../redux/authSlice"
import { backEndURL } from "../Backendurl";
import DotSpinner from "../loaders/Loader";

export default function AdvancedLogin() {
  const VALID_EMAIL ="info@rtechsl.lk"
  const VALID_PASSWORD = "rtechsl.lk"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("email")
  const [errors, setErrors] = useState({})
  const [shake, setShake] = useState(false)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }
  const validateForm = () => {
    const newErrors = {}
    if (activeTab === "email") {
      if (!formData.email) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid"
      }
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setIsLoading(true);
    try {
      // Superuser login - also get JWT token from backend
      if (
        formData.email === VALID_EMAIL &&
        formData.password === VALID_PASSWORD
      ) {
        try {
          // Get JWT token from backend for the special admin
          const adminResponse = await fetch(`${backEndURL}/api/users/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });
          
          const adminResult = await adminResponse.json();
          
          if (adminResponse.ok && adminResult.token) {
            setSuccess(true);
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("email", formData.email);
            sessionStorage.setItem("restrictedUser", "true");
            sessionStorage.setItem("jwtToken", adminResult.token);
            sessionStorage.setItem("userData", JSON.stringify(adminResult.user));
            setTimeout(() => {
              const hostname = window.location.hostname;
              const port = window.location.port;
              const isInvoiceOnly =
                hostname.startsWith("in.") ||
                hostname === "in.erp.rtechsl.lk" ||
                port === "3002";
              if (isInvoiceOnly) {
                window.location.href = "/invoice";
              } else {
                window.location.href = "/user";
              }
            }, 1000);
            return;
          } else {
            setErrors({ form: "Failed to authenticate admin user." });
            return;
          }
        } catch (error) {
          setErrors({ form: "Failed to authenticate admin user." });
          return;
        }
      }
  
      // Normal user login (check database)
      const response = await fetch(`${backEndURL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const result = await response.json();
      if (response.ok && result.user && result.user.status === "active") {
        setSuccess(true);
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("email", formData.email);
        sessionStorage.setItem("restrictedUser", "false");
        sessionStorage.setItem("jwtToken", result.token);
        sessionStorage.setItem("userData", JSON.stringify(result.user));
        setTimeout(() => {
          const hostname = window.location.hostname;
          const port = window.location.port;
          const isInvoiceOnly =
            hostname.startsWith("in.") ||
            hostname === "in.erp.rtechsl.lk" ||
            port === "3002";
          if (isInvoiceOnly) {
            window.location.href = "/invoice";
          } else {
            window.location.href = "/dashboard";
          }
        }, 1000);
      } else if (result.user && result.user.status !== "active") {
        setErrors({ form: "Your status is inactive. Please contact support." });
      } else {
        setErrors({ form: "Invalid email or password." });
      }
    } catch (error) {
      setErrors({ form: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }; 

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setErrors({})
  }
  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: "url('/new.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[20%] w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob1"></div>
          <div className="absolute right-[20%] top-[30%] w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob1 animation-delay-2000"></div>
          <div className="absolute left-[30%] bottom-[20%] w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob1 animation-delay-4000"></div>
        </div>
        <div className={`max-w-md w-full space-y-8 relative ${shake ? "animate-shake" : ""}`}>
          <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-border transition-all duration-500">
            <div className="text-center">
              <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-primary shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                  />
                </svg>
              </div>
            </div>
            {success ? (
              <div className="mt-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-light">
                  <svg
                    className="h-6 w-6 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-3 text-xl font-medium text-text-primary">Login successful!</h3>
                <p className="mt-2 text-text-secondary">Redirecting you to your dashboard...</p>
                <div className="mt-4 flex justify-center">
                  <DotSpinner />
                </div>
              </div>
            ) : (
              <>
                <div className="mt-8 flex border-b border-border">
                  <button
                    onClick={() => handleTabChange("email")}
                    className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${
                      activeTab === "email"
                        ? "text-primary border-b-2 border-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Email
                  </button>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  {errors.form && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errors.form}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                        User Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-text-muted"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                            errors.email ? "border-red-500" : "border-border"
                          } rounded-md shadow-sm placeholder-text-muted bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-text-muted"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`appearance-none block w-full pl-10 pr-10 py-3 border ${
                            errors.password ? "border-red-500" : "border-border"
                          } rounded-md shadow-sm placeholder-text-muted bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <svg
                              className="h-5 w-5 text-text-muted hover:text-text-secondary"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                clipRule="evenodd"
                              />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5 text-text-muted hover:text-text-secondary"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-150 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <DotSpinner />
                          <span className="ml-3">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg
                              className="h-5 w-5 text-primary-light group-hover:text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          Sign in
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes blob1 {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob1 {
          animation: blob1 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  )
}
