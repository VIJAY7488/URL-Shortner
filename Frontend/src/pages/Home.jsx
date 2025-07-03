import React from 'react'
import Navbar from '../components/NavBar'
import LongUrl from '../components/LongUrl'
import ShortUrl from './ShortUrl'

const Home = () => {
  return (
    <div className="relative z-10">
      <Navbar />
      <div className='flex'>
        <LongUrl />
        <ShortUrl />
      </div>
    </div>
  )
}

export default Home
