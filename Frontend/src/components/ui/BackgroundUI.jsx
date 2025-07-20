import React from 'react'
import DarkBackgroundUi from './DarkBackgroundUi'
import GeometricAccent from './GeometicAccent'
import FloatingShapes from './FloatingShapes'

const BackgroundUI = () => {
  return (
    <div className='fixed inset-0 min-h-screen bg-gray-50 overflow-hidden'>
      <DarkBackgroundUi />
      <GeometricAccent />
    </div>
  )
}

export default BackgroundUI
