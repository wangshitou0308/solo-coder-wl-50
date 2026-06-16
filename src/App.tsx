import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import FoodDetail from '@/pages/FoodDetail'
import Donate from '@/pages/Donate'
import Profile from '@/pages/Profile'
import Admin from '@/pages/Admin'
import Dashboard from '@/pages/Dashboard'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-bg)]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}
