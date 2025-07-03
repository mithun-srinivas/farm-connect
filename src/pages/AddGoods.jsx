import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Save, ArrowLeft } from 'lucide-react'

const AddGoods = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    farmer_name: '',
    farmer_phone: '',
    good_name: '',
    quantity: '',
    units: 'Kg',
    price_per_unit: '',
    with_commission: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
    setSuccess('')
  }

  const calculateFinalPrice = () => {
    const quantity = parseFloat(formData.quantity) || 0
    const pricePerUnit = parseFloat(formData.price_per_unit) || 0
    const totalPrice = quantity * pricePerUnit
    
    if (formData.with_commission) {
      return totalPrice * 0.9 // Reduce by 10% for commission
    }
    return totalPrice
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate form data
      if (!formData.farmer_name || !formData.farmer_phone || !formData.good_name || !formData.quantity || !formData.units || !formData.price_per_unit) {
        throw new Error('All fields are required')
      }

      // Validate phone number format
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(formData.farmer_phone)) {
        throw new Error('Please enter a valid phone number')
      }

      if (parseFloat(formData.quantity) <= 0) {
        throw new Error('Quantity must be greater than 0')
      }

      if (parseFloat(formData.price_per_unit) <= 0) {
        throw new Error('Price per unit must be greater than 0')
      }

      const finalPrice = calculateFinalPrice()
      
      const { data, error } = await supabase
        .from('farmers_goods')
        .insert([
          {
            farmer_name: formData.farmer_name.trim(),
            farmer_phone: formData.farmer_phone.trim(),
            good_name: formData.good_name.trim(),
            quantity: parseFloat(formData.quantity),
            units: formData.units,
            price_per_unit: parseFloat(formData.price_per_unit),
            with_commission: formData.with_commission,
            final_price: finalPrice,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      setSuccess('Goods added successfully!')
      
      // Reset form
      setFormData({
        farmer_name: '',
        farmer_phone: '',
        good_name: '',
        quantity: '',
        units: 'Kg',
        price_per_unit: '',
        with_commission: false
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

  const finalPrice = calculateFinalPrice()
  const originalPrice = parseFloat(formData.quantity) * parseFloat(formData.price_per_unit)
  const commissionAmount = originalPrice - finalPrice

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Goods</h1>
          <p className="text-gray-600">Record new goods collected from farmers</p>
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

          {/* Farmer Name */}
          <div>
            <label htmlFor="farmer_name" className="form-label">
              Farmer Name *
            </label>
            <input
              type="text"
              id="farmer_name"
              name="farmer_name"
              value={formData.farmer_name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter farmer's name"
              required
            />
          </div>

          {/* Farmer Phone */}
          <div>
            <label htmlFor="farmer_phone" className="form-label">
              Farmer Phone Number *
            </label>
            <input
              type="tel"
              id="farmer_phone"
              name="farmer_phone"
              value={formData.farmer_phone}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter farmer's phone number (e.g., +91-9876543210)"
              required
            />
          </div>

          {/* Good Name */}
          <div>
            <label htmlFor="good_name" className="form-label">
              Good Name *
            </label>
            <input
              type="text"
              id="good_name"
              name="good_name"
              value={formData.good_name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter good name (e.g., Wheat, Rice, Corn)"
              required
            />
          </div>

          {/* Quantity and Units */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="form-label">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter quantity"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="units" className="form-label">
                Units *
              </label>
              <select
                id="units"
                name="units"
                value={formData.units}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="Kg">Kg</option>
                <option value="Box">Box</option>
                <option value="Bags">Bags</option>
              </select>
            </div>
          </div>

          {/* Price per Unit */}
          <div>
            <label htmlFor="price_per_unit" className="form-label">
              Price per Unit (₹) *
            </label>
            <input
              type="number"
              id="price_per_unit"
              name="price_per_unit"
              value={formData.price_per_unit}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter price per unit"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Commission Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="with_commission"
              name="with_commission"
              checked={formData.with_commission}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="with_commission" className="ml-2 block text-sm text-gray-900">
              With Commission (10% deduction)
            </label>
          </div>

          {/* Price Summary */}
          {formData.quantity && formData.price_per_unit && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Price Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="font-medium">₹{originalPrice.toFixed(2)}</span>
                </div>
                {formData.with_commission && (
                  <div className="flex justify-between text-orange-600">
                    <span>Commission (10%):</span>
                    <span>-₹{commissionAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Final Price:</span>
                  <span className="text-primary-600">₹{finalPrice.toFixed(2)}</span>
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
                  Add Goods
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddGoods 