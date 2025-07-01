import React from 'react'
import Navbar from '../NavBar'

const BackgroundUI = () => {
  return (
    <div className='min-h-screen bg-gray-50 relative overflow-hidden'>
      <div className="absolute right-0 top-0 w-2/3 h-full">
        <div className="relative w-full h-full">
            <div
              className="absolute inset-0 w-full h-full"
              style={{
              background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)",
              borderRadius: "50% 0% 50% 50% / 30% 0% 70% 70%",
              transform: "rotate(-10deg) scale(1.2)",
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))",
              }}
            />

            <div
              className="absolute inset-0 w-full h-full opacity-30"
              style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #be185d 50%, #ea580c 100%)",
              borderRadius: "50% 0% 50% 50% / 30% 0% 70% 70%",
              transform: "rotate(-10deg) scale(1.2) translate(10px, 10px)",
              }}
            />
        </div>
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>
    </div>
  )
}

export default BackgroundUI
