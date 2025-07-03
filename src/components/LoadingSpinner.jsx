import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ size = 'default' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className={`animate-spin text-primary-500 ${sizeClasses[size]}`} />
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner 