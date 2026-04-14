import { Link } from 'react-router-dom'

const blogPosts = [
  {
    id: 1,
    title: '5 Delicous smoothies with Peanut butter',
    date: '5 March 20026',
    image: '/images/blog -1.webp',
    slug: 'smoothies-with-peanut-butter',
  },
  {
    id: 2,
    title: 'Benifits of Eating Peanut Butter',
    date: '6 March 20026',
    image: '/images/blog -2.webp',
    slug: 'benefits-of-peanut-butter',
  },
  {
    id: 3,
    title: 'How to choose Right Peanut Butter',
    date: '7 March 20026',
    image: '/images/blog - 3.webp',
    slug: 'choose-right-peanut-butter',
  },
]

export default function BlogSection() {
  return (
    <section className="py-20 md:py-28 bg-[#fff8ed]">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Blog Posts Column */}
          <div className="lg:w-[55%]">
            <div className="mb-10">
              <h2
                className="text-2xl md:text-3xl font-bold mb-3 whitespace-nowrap"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#C45C26'
                }}
              >
                Healthy Leaving With Nut Baba
              </h2>
              <p
                className="text-sm md:text-base font-medium opacity-80"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: '#333333'
                }}
              >
                Tips recipes & More
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-square rounded-[15px] overflow-hidden mb-4 shadow-sm">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3
                    className="text-lg font-bold mb-2 leading-tight"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: '#C45C26'
                    }}
                  >
                    {post.title}
                  </h3>
                  <p
                    className="text-xs font-semibold opacity-70"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {post.date}
                  </p>
                </Link>
              ))}
            </div>

            <div className="flex justify-center sm:justify-center">
              <Link
                to="/blog"
                className="inline-block bg-[#C45C26] text-white px-10 py-3.5 rounded-full text-base font-bold shadow-md hover:bg-[#813302] transition-all duration-300 hover:scale-105"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                View Blogs
              </Link>
            </div>
          </div>

          {/* Instagram Feed Column */}
          <div className="lg:w-[45%]">
            <div className="mb-10">
              <h2
                className="text-2xl md:text-3xl font-bold mb-3 whitespace-nowrap"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#C45C26'
                }}
              >
                Follow us on Instagram
              </h2>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-12">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <a
                  key={num}
                  href="https://instagram.com/nutbaba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-[10px] overflow-hidden group shadow-sm"
                >
                  <img
                    src={`/images/insta ${num}.webp`}
                    alt={`Instagram post ${num}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </a>
              ))}
            </div>

            <div className="flex justify-center">
              <a
                href="https://instagram.com/nutbaba"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#C45C26] text-white px-10 py-3.5 rounded-full text-base font-bold shadow-md hover:bg-[#813302] transition-all duration-300 hover:scale-105"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                View Insta
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
