import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section
      className="relative w-full min-h-[500px] md:min-h-[600px] lg:min-h-[85vh] bg-cover bg-center bg-no-repeat flex items-center"
      style={{
        backgroundImage: `url('/images/BG (1).webp')`,
      }}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <div className="max-w-xl">
          {/* Nut Baba Logo */}
          <div className="mb-6 md:mb-8 animate-fadeIn">
            <img
              src="/images/nut baba logo.webp"
              alt="Nut Baba Logo"
              className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 object-contain drop-shadow-sm"
            />
          </div>

          {/* Main Headline */}
          <div className="mb-4 md:mb-6 animate-slideIn" style={{ animationDelay: '0.1s' }}>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#813302'
              }}
            >
              <div className="whitespace-nowrap">Desi Swad,</div>
              <div className="whitespace-nowrap">
                Protein Ka Power
                <span className="inline-block ml-2">💪</span>
              </div>
            </h1>
          </div>

          {/* Features List */}
          <div className="mb-3 animate-slideIn" style={{ animationDelay: '0.2s' }}>
            <p
              className="text-base sm:text-lg md:text-xl font-semibold tracking-wide"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#333333'
              }}
            >
              • 100% Natural • High Protein • No Added Sugar
            </p>
          </div>

          {/* Subtext Tagline */}
          <div className="mb-8 md:mb-10 animate-slideIn" style={{ animationDelay: '0.3s' }}>
            <p
              className="text-sm sm:text-base md:text-lg opacity-80"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#4b2c20'
              }}
            >
              Perfect for Gym, Breakfast & Healthy Snacking
            </p>
          </div>

          {/* Shop Now Button */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            <Link
              to="/shop"
              className="inline-block px-10 py-4 text-base md:text-lg font-bold text-white rounded-full shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
              style={{
                fontFamily: "'Inter', sans-serif",
                backgroundColor: '#813302'
              }}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
