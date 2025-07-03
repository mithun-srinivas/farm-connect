import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Save, ArrowLeft } from 'lucide-react'

const AddCustomer = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    goods_purchased: '',
    price: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate form data
      if (!formData.customer_name || !formData.phone || !formData.address || !formData.goods_purchased || !formData.price) {
        throw new Error('All fields are required')
      }

      if (parseFloat(formData.price) <= 0) {
        throw new Error('Price must be greater than 0')
      }

      // Validate phone number format (basic validation)
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Please enter a valid phone number')
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([
          {
            customer_name: formData.customer_name.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            goods_purchased: formData.goods_purchased.trim(),
            price: parseFloat(formData.price),
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      setSuccess('Customer added successfully!')
      
      // Reset form
      setFormData({
        customer_name: '',
        phone: '',
        address: '',
        goods_purchased: '',
        price: ''
      })

      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Customer</h1>
          <p className="text-gray-600">Register new customer information</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label htmlFor="customer_name" className="form-label">
              Customer Name *
            </label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter customer's full name"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="form-label">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter phone number (e.g., +1-555-123-4567)"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="form-label">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter customer's address"
              rows="3"
              required
            />
          </div>

          {/* Goods Purchased */}
          <div>
            <label htmlFor="goods_purchased" className="form-label">
              Goods Purchased *
            </label>
            <input
              type="text"
              id="goods_purchased"
              name="goods_purchased"
              value={formData.goods_purchased}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter goods purchased (e.g., 100kg Rice, 50kg Wheat)"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="form-label">
              Total Price (₹) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter total price"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Price Summary */}
          {formData.price && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Purchase Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{formData.customer_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Goods:</span>
                  <span className="font-medium">{formData.goods_purchased || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Price:</span>
                  <span className="text-primary-600">₹{parseFloat(formData.price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCustomer 