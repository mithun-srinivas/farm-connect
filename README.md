# Farm Connect - Farming Trader Tool

A comprehensive full-stack web application for farming traders who collect goods from farmers and sell them to customers. Built with React, Vite, Tailwind CSS, and Supabase.

## 🌾 Features

### Authentication
- Secure username/password login via Supabase Auth
- Default admin credentials: `admin@farmconnect.com` / `admin`
- Session management with automatic redirects

### Dashboard
- Overview of trading operations
- Real-time statistics (total goods, customers, revenue, commission)
- Quick action cards for easy navigation
- Recent activity displays

### Goods Management
- Add goods collected from farmers
- Commission calculation (10% deduction option)
- Price calculation with live preview
- Form validation and error handling

### Customer Management
- Add customer information
- Track goods purchased and prices
- Phone number and address validation
- Purchase summary display

### Reporting & Analytics
- Comprehensive data tables with filtering
- Search by farmer name, customer name, date, goods
- Commission filter for goods
- Export functionality (CSV and Excel)
- Real-time data refresh

### Slip Generation
- Generate PDF slips for farmers (collection receipts)
- Generate PDF invoices for customers
- Professional formatting with company branding
- Bulk generation capability
- Printable format optimized for A4 paper

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling and responsive design
- **React Router** - Client-side routing
- **Lucide React** - Icons
- **React Hook Form** - Form management
- **jsPDF** - PDF generation
- **XLSX** - Excel export
- **date-fns** - Date manipulation

### Backend
- **Supabase** - Database and authentication
- **PostgreSQL** - Database engine
- **Row Level Security** - Data protection

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd farm-connect
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Setup

#### A. Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

#### B. Run Database Schema
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

#### C. Create Admin User
1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add User"
3. Email: `admin@farmconnect.com`
4. Password: `admin`
5. Confirm email: Check this box
6. Click "Create User"

### 5. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🚀 Usage

### Login
- Navigate to the application
- Use credentials: `admin@farmconnect.com` / `admin`
- You'll be redirected to the dashboard upon successful login

### Adding Goods
1. Navigate to "Add Goods" from the dashboard
2. Fill in farmer name, good name, quantity, and price per unit
3. Optionally check "With Commission" for 10% deduction
4. View the live price calculation
5. Click "Add Goods" to save

### Adding Customers
1. Navigate to "Add Customer" from the dashboard
2. Fill in customer details and goods purchased
3. View the purchase summary
4. Click "Add Customer" to save

### Viewing Reports
1. Navigate to "Reports" from the dashboard
2. Switch between "Goods" and "Customers" tabs
3. Use search, date, and commission filters
4. Export data using CSV or Excel buttons

### Generating Slips
1. Navigate to "Generate Slips" from the dashboard
2. Switch between "Farmer Slips" and "Customer Slips"
3. Use filters to find specific records
4. Click "Generate Slip" for individual PDFs
5. Use "Generate All" for bulk PDF creation

## 🗄️ Database Schema

### Tables
- `farmers_goods` - Stores goods collected from farmers
- `customers` - Stores customer information and purchases
- `user_profiles` - Extended user information

### Key Features
- UUID primary keys for security
- Row Level Security (RLS) policies
- Automatic timestamp updates
- Data validation constraints
- Optimized indexes for performance

## 🔒 Security

### Authentication
- Supabase Auth handles secure authentication
- Session management with automatic token refresh
- Protected routes with authentication checks

### Data Security
- Row Level Security (RLS) policies
- User-specific data access
- Input validation and sanitization
- SQL injection protection

## 🎨 UI/UX Features

### Design
- Modern, clean interface with Tailwind CSS
- Responsive design for all device sizes
- Consistent color scheme and typography
- Intuitive navigation and user flow

### User Experience
- Real-time form validation
- Loading states and error handling
- Success/error notifications
- Keyboard shortcuts and accessibility

### Components
- Reusable card components
- Form components with validation
- Data tables with sorting and filtering
- Modal dialogs and confirmations

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## 🔧 Development

### Available Scripts
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Project Structure
```
farm-connect/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── lib/           # Utility libraries (Supabase config)
│   ├── pages/         # Page components
│   ├── styles/        # CSS files
│   └── main.jsx       # Application entry point
├── public/            # Static assets
├── supabase-schema.sql # Database schema
└── README.md         # This file
```

### Adding New Features
1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update routing in `src/App.jsx`
4. Add database changes to `supabase-schema.sql`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Manual Deployment
1. Run `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Configure environment variables on your server

## 🔍 Troubleshooting

### Common Issues

**"Invalid login credentials"**
- Ensure you've created the admin user in Supabase Auth
- Check that email confirmation is enabled for the user

**"Cannot connect to database"**
- Verify your Supabase URL and anon key in `.env.local`
- Ensure your Supabase project is active

**"RLS policy violation"**
- Check that the database schema was applied correctly
- Verify that RLS policies are properly configured

**PDF generation not working**
- Ensure all PDF dependencies are installed
- Check browser console for errors
- Verify that popup blockers are disabled

### Environment Variables
Make sure your `.env.local` file contains:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the Supabase documentation

## 🎯 Future Enhancements

- Multi-user support with role-based access
- Advanced analytics and reporting
- Mobile app development
- Integration with accounting software
- Inventory management features
- SMS notifications for farmers and customers
- Multi-language support
- Dark mode theme 