import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import FoodDetail from '@/pages/FoodDetail'
import Donate from '@/pages/Donate'
import Profile from '@/pages/Profile'
import Admin from '@/pages/Admin'
import Dashboard from '@/pages/Dashboard'
import ClaimConfirm from '@/pages/ClaimConfirm'
import FridgeMap from '@/pages/FridgeMap'
import ReviewPage from '@/pages/ReviewPage'
import InspectionTasks from '@/pages/InspectionTasks'
import NeedsList from '@/pages/NeedsList'
import NeedPublish from '@/pages/NeedPublish'
import Notifications from '@/pages/Notifications'
import VoucherHistory from '@/pages/VoucherHistory'
import AlertRules from '@/pages/AlertRules'
import Analytics from '@/pages/Analytics'

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
          <Route path="/fridge-map" element={<FridgeMap />} />
          <Route path="/claim-confirm/:id" element={<ClaimConfirm />} />
          <Route path="/reviews" element={<ReviewPage />} />
          <Route path="/inspection-tasks" element={<InspectionTasks />} />
          <Route path="/needs" element={<NeedsList />} />
          <Route path="/publish-need" element={<NeedPublish />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/vouchers" element={<VoucherHistory />} />
          <Route path="/alert-rules" element={<AlertRules />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  )
}
