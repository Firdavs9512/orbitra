import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import DashboardPreview from './components/DashboardPreview'
import HowItWorks from './components/HowItWorks'
import Comparison from './components/Comparison'
import OpenSource from './components/OpenSource'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <DashboardPreview />
        <HowItWorks />
        <Comparison />
        <OpenSource />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
