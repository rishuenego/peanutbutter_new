import { Link } from 'react-router-dom'
import { Truck, RotateCcw } from 'lucide-react'

export default function SpecialOffer() {
  return (
    <section
      className="w-full flex flex-col sm:relative sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px] overflow-hidden bg-white sm:bg-transparent"
    >
      {/* Background Image Part - Full height on desktop, fixed height on mobile */}
      <div
        className="h-[260px] xs:h-[300px] sm:absolute sm:inset-0 sm:h-full w-full"
        style={{
          backgroundImage: "url('/images/BG _2AA.jpg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Limited Time Only Badge - Stays on the image part for mobile, top right on desktop */}
        <div
          className="absolute top-0 right-0 bg-button-gradient text-white text-[10px] sm:text-xs md:text-sm py-1.5 sm:py-2 px-3 sm:px-4 md:px-6 rounded-bl-lg md:rounded-bl-xl z-20 shadow-md"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
          }}
        >
          Limited Time Only
        </div>
      </div>

      {/* Content Area - Below image on mobile, overlay on desktop */}
      <div className="relative sm:absolute sm:right-0 sm:top-0 sm:bottom-0 sm:w-[55%] md:w-[50%] lg:w-[45%] flex items-center justify-center z-10 bg-[#FEF9F2] sm:bg-transparent py-10 sm:py-0 border-t-2 border-[#813302]/10 sm:border-none">
        <div className="flex flex-col items-center text-center px-6 sm:px-4 w-full">
          {/* Special Limited Offer */}
          <p
            className="text-[#813302] text-sm sm:text-base md:text-lg lg:text-xl mb-0 italic font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Special Limited Offer
          </p>

          {/* Flat */}
          <p
            className="text-[#1B0B00] text-xl sm:text-xl md:text-2xl font-bold -mb-1 sm:-mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Flat
          </p>

          {/* 20% OFF - Large Text */}
          <div className="flex items-baseline justify-center leading-none my-1">
            <span
              className="text-6xl sm:text-6xl md:text-7xl lg:text-8xl font-black"
              style={{
                fontFamily: "Arial Black, Arial, sans-serif",
                background:
                  "linear-gradient(180deg, #F5A623 0%, #E8941F 40%, #D97B29 70%, #C46A20 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(1px 2px 1px rgba(0,0,0,0.1))",
              }}
            >
              20%
            </span>
            <span
              className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-black ml-1 sm:ml-2 text-[#1B0B00] sm:text-transparent sm:bg-clip-text"
              style={{
                fontFamily: "Arial Black, Arial, sans-serif",
                backgroundImage:
                  "linear-gradient(180deg, #FFFDF5 0%, #F5EBD8 50%, #E8DCC4 100%)",
                WebkitBackgroundClip: "text",
                filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.15))",
              }}
            >
              OFF
            </span>
          </div>

          {/* on Your First Order */}
          <p
            className="text-[#813302] text-xs sm:text-sm md:text-base lg:text-lg mt-0 sm:mt-1 mb-2 sm:mb-4 font-semibold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            on Your First Order
          </p>

          {/* Promo Code Box */}
          <div
            className="border-2 border-dashed border-[#813302]/30 rounded-lg px-4 sm:px-5 md:px-6 py-2 sm:py-2 mb-4 sm:mb-4 bg-white/50"
          >
            <p
              className="text-[#1B0B00] text-sm sm:text-sm md:text-base"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Use Code:{" "}
              <span className="font-bold tracking-wider text-[#813302]">NUTBABA20</span>
            </p>
          </div>

          {/* Shop Now & Save Button */}
          <Link
            to="/shop"
            className="inline-block"
          >
            <button className="bg-button-gradient text-white font-bold py-3 px-8 sm:px-8 md:px-10 rounded-full text-sm sm:text-base mb-4 sm:mb-4 transition-all duration-300 hover:scale-105 shadow-xl active:scale-95">
              Shop Now & Save
            </button>
          </Link>

          {/* Free Shipping & Easy Returns */}
          <div className="flex items-center justify-center gap-4 sm:gap-5 md:gap-6 text-[#1B0B00]">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 sm:w-4 md:w-5 h-auto text-[#813302]" />
              <span
                className="text-[10px] sm:text-xs md:text-sm font-bold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Free Shipping
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-4 sm:w-4 md:w-5 h-auto text-[#813302]" />
              <span
                className="text-[10px] sm:text-xs md:text-sm font-bold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Easy Returns
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
