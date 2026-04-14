import HeroSection from '../components/home/HeroSection'
import CategorySection from '../components/home/CategorySection'
import BestSellers from '../components/home/BestSellers'
import WhyChooseUs from '../components/home/WhyChooseUs'
import CustomerReviews from '../components/home/CustomerReviews'
import SpecialOffer from '../components/home/SpecialOffer'
import BlogSection from '../components/home/BlogSection'
import InstagramFeed from '../components/home/InstagramFeed'

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CategorySection />
      <BestSellers />
      <WhyChooseUs />
      <CustomerReviews />
      <SpecialOffer />
      <BlogSection />
      <InstagramFeed />
    </div>
  )
}
