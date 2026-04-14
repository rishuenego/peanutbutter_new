const About = () => {
  const values = [
    {
      title: 'Natural Ingredients',
      description: 'We select the best nuts and produce with zero harmful additives.',
    },
    {
      title: 'Made With Love',
      description: 'Every product is crafted with care to deliver unmatched taste.',
    },
    {
      title: 'Energy & Wellness',
      description: 'Nuttira products are designed to fuel your active lifestyle.',
    },
  ];

  return (
    <div className="bg-cream-light">
      {/* Hero Banner */}
      <div className="w-full h-[400px] md:h-[500px] overflow-hidden">
        <img
          src="/images/BG-About.webp"
          alt="Our Products"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Our Mission Image - No Text */}
      <div className="w-full">
        <img
          src="/images/our mission.png"
          alt="Our Mission"
          className="w-full h-auto block"
        />
      </div>

      {/* Our Vision Image - No Text, No gap */}
      <div className="w-full">
        <img
          src="/images/our vision.png"
          alt="Our Vision"
          className="w-full h-auto block"
        />
      </div>

      {/* What We Stand For Section */}
      <div
        className="py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg, #FDE5C6 0%, #FDD7AC 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-12 md:px-24">
          <h2
            className="text-3xl md:text-4xl text-center mb-16"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#813302'
            }}
          >
            What We Stand For
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl py-6 px-6 shadow-sm flex items-center gap-4 w-full"
              >
                {/* Left - Icon Container */}
                <div className="flex-shrink-0 w-20 h-20 bg-[#FDE5C6] rounded-full flex items-center justify-center">
                  <img
                    src="/images/icon.webp"
                    alt=""
                    className="w-12 h-12 object-contain"
                  />
                </div>

                {/* Right - Text Content */}
                <div className="flex-1">
                  <h3
                    className="text-lg mb-1 font-medium"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: '#B1561E'
                    }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-[#3D1B00]/80 text-xs leading-relaxed font-body">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
