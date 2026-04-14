const features = [
  {
    title: '100% Natural',
    description: 'No preservatives or chemicals',
    icon: '/images/icon.webp',
  },
  {
    title: 'High Protein',
    description: 'No preservatives or chemicals',
    icon: '/images/icon.webp',
  },
  {
    title: 'No Added Sugar',
    description: 'No preservatives or chemicals',
    icon: '/images/icon.webp',
  },
  {
    title: 'Made In India',
    description: 'No preservatives or chemicals',
    icon: '/images/icon.webp',
  },
]

export default function WhyChooseUs() {
  return (
    <section
      className="bg-[#fff8ed]"
      style={{
        paddingTop: '97px',
        paddingBottom: '77px'
      }}
    >
      <div
        className="container mx-auto"
        style={{
          paddingLeft: '140px',
          paddingRight: '150px'
        }}
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#813302'
            }}
          >
            Why Choose Nut Baba ?
          </h2>
          <p
            className="text-lg font-medium"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: '#333333'
            }}
          >
            We believe in pure, healthy & delicious nutrition
          </p>
        </div>

        {/* Features Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: '20px' }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-[15px] p-6 text-center shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col items-center border border-gray-100/50"
            >
              {/* Icon Image Container */}
              <div
                className="w-16 h-16 mb-4 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: '#ffdeb3' }}
              >
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/nut baba logo.webp'
                  }}
                />
              </div>

              {/* Title */}
              <h3
                className="text-lg font-bold mb-1.5"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#813302'
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="text-xs opacity-80 leading-snug"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: '#000000'
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
