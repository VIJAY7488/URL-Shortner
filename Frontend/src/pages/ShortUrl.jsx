import React from 'react'
import Scanner from '../components/Scanner'

const ShortUrl = () => {
  return (
    <div className='relative z-10 mt-20 w-full max-w-md mx-auto'>
      <div className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        <Scanner />
      </div>
    </div>
  )
}

export default ShortUrl
