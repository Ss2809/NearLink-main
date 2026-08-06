import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Home/Hero'
import Features from '../components/Home/Features'
import ActivitySection  from '../components/Home/ActivitySection'

function Home() {
  return (
    <div>

      <Navbar/>
      <Hero/>
      <Features/>
      <ActivitySection />
    </div>
  )
}

export default Home