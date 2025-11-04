
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, UserPlus, LogIn, ArrowLeft, Sun, Moon } from 'lucide-react';

const Login = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { isSignUp?: boolean; prefillEmail?: string; from?: { pathname: string } } | undefined;
  
  // Set initial states based on location state
  const [isSignUp, setIsSignUp] = useState(locationState?.isSignUp || false);
  const [email, setEmail] = useState(locationState?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // @ts-ignore
  const from = locationState?.from?.pathname || '/dashboard';

  // If user is already logged in, redirect to dashboard
  if (user && !loading) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter your display name');
          setIsSubmitting(false);
          return;
        }
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-sky-900' 
        : 'bg-white'
    }`}>
      {/* Navigation Header */}
      <nav className={`fixed top-0 w-full backdrop-blur-md border-b z-50 ${
        theme === 'dark' 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                SpiderWebsCoded
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-white" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>
              
              <Link to="/">
                <Button variant="ghost" className={`${
                  theme === 'dark' 
                    ? 'text-white hover:text-blue-300 hover:bg-white/10' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Card */}
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <Card className={`w-full max-w-md backdrop-blur-md border-2 shadow-2xl rounded-2xl transition-all duration-300 hover:shadow-3xl ${
          theme === 'dark'
            ? 'bg-white/10 border-white/20'
            : 'bg-white border-gray-200'
        }`}>
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className={`text-base ${theme === 'dark' ? 'text-blue-100' : 'text-gray-600'}`}>
              {isSignUp 
                ? 'Fill in your details to create a new account' 
                : 'Enter your credentials to access your account'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className={
                  theme === 'dark' 
                    ? 'bg-red-500/20 border-red-500/50 text-white' 
                    : ''
                }>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Display Name</Label>
                  <Input 
                    id="displayName" 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    required={isSignUp}
                    className={
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                    }
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className={
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                  }
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Loading...'
                  : isSignUp
                    ? (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create Account
                      </>
                    )
                    : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                      </>
                    )
                }
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className={`w-full transition-colors ${
                  theme === 'dark'
                    ? 'text-blue-100 hover:text-white hover:bg-white/10'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isSubmitting}
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
