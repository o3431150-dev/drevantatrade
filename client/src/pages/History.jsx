import React from 'react'
import OrdersDisplay from '../components/OrdersDisplay'
import { MoveLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MobileNav from '../components/MobileNav'

const History = () => {
const navigate = useNavigate();
  return (
    <div className='p-4 sm:p-6 lg:p-8 bg-gray-900 min-h-screen'>
      <MobileNav/>
    <div>
        <div
        onClick={() => navigate('/')}
        className="flex items-center mb-4 hidden md:flex">
          <MoveLeft className="mr-2" />
          <p>Back</p>
        </div>
    </div>
      <OrdersDisplay 
      tradeHistory={true}

      
      />

    </div>
  )
}

export default History
