import { useState } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Health Tips', 'Nut Baba News'];

  const recipes = [
    {
      id: 1,
      title: '5 Delicous smoothies with Peanut butter',
      date: '5 March 2026',
      excerpt: 'The new article is a science-first deep dive designed to complement the published piece without...',
      image: '/images/5 Delicous smoothes with Peanut butter  - 1.webp',
    },
    {
      id: 2,
      title: '5 Delicous smoothies with Peanut butter',
      date: '5 March 2026',
      excerpt: 'The new article is a science-first deep dive designed to complement the published piece without...',
      image: '/images/5 Delicous smoothes with Peanut butter - 2.webp',
    },
    {
      id: 3,
      title: '5 Delicous smoothies with Peanut butter',
      date: '5 March 2026',
      excerpt: 'The new article is a science-first deep dive designed to complement the published piece without...',
      image: '/images/5 Delicous smoothes with Peanut butter - 3.webp',
    },
  ];

  const journalArticles = [
    {
      id: 1,
      category: 'Health Tips',
      title: 'Gut Health and the Power of Roasted Nuts',
      excerpt: 'Understanding how enzyme-rich, slow-roasted nuts can transform your digestive wellness journey.',
      image: '/images/BG-1_1.webp',
      featured: true,
    },
    {
      id: 2,
      category: 'Nut Baba News',
      title: 'Sourcing from the Highlands',
      excerpt: 'Take a look at the small-batch farms where our 2024 harvest begins. Take a look at the small-batch farms where our 2024 harvest begins.',
      image: '/images/Sourcing from the Highlands.webp',
    },
    {
      id: 3,
      category: 'Recipes',
      title: '5-Minute Nut Butter Energy Balls',
      excerpt: 'The ultimate grab-and-go snack for busy professionals. The ultimate grab-and-go snack for busy professionals.',
      image: undefined,
    },
    {
      id: 4,
      category: 'Sustainability',
      title: 'Moving Towards Zero-Waste Packaging',
      excerpt: 'Our commitment to the planet is just as strong as our butter. Our commitment to the planet is just as strong as our butter.',
      image: undefined,
    },
  ];

  return (
    <div className="bg-[#fcf0e3] min-h-screen pt-12 pb-24">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-20">
        <div className="grid md:grid-cols-2 gap-20 lg:gap-32 items-center">
          <div className="order-2 md:order-1">
            <h1 className="font-heading text-5xl lg:text-7xl leading-tight mb-8">
              <span className="text-gray-900 block">10 Ways to Eat</span>
              <span className="text-[#B1561E] block">Peanut Butter</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-[440px] leading-relaxed">
              From savory satays to midnight spoon-dives, discover the versatile nature
              of our slow-roasted batches and why it&apos;s more than just a spread.
            </p>
          </div>

          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[480px] aspect-square">
              {/* Decorative Offset Background (Top-Right) */}
              <div className="absolute -top-5 -right-5 w-full h-full bg-[#fde5c6] rounded-[4rem]"></div>

              {/* Main Image Container */}
              <div className="relative w-full h-full rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white/30">
                <img
                  src="/images/BG blogs-1.webp"
                  alt="Peanut Butter Drip"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Popular Recipes */}
      <div className="bg-cream py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl text-orange-500 mb-2">
                Most Popular Recipes
              </h2>
              <p className="text-gray-600">Crafted by our community of wellness enthusiasts</p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-48 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl text-orange-500 mb-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">{recipe.date}</p>
                  <p className="text-gray-600 mb-4">{recipe.excerpt}</p>
                  <Link
                    to={`/blog/${recipe.id}`}
                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium text-center transition-colors"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest from the Journal */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl md:text-3xl text-brown-800">
            Latest from the Journal
          </h2>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === filter
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Featured Article */}
          {journalArticles
            .filter((a) => a.featured)
            .map((article) => (
              <div
                key={article.id}
                className="relative h-[500px] rounded-2xl overflow-hidden"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full mb-4 inline-block">
                    {article.category}
                  </span>
                  <h3 className="font-heading text-2xl mb-3">{article.title}</h3>
                  <p className="text-white/80 mb-4">{article.excerpt}</p>
                  <Link
                    to={`/blog/${article.id}`}
                    className="text-orange-400 hover:text-orange-300 font-medium inline-flex items-center gap-2"
                  >
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}

          {/* Other Articles */}
          <div className="space-y-6">
            {journalArticles
              .filter((a) => !a.featured)
              .map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex gap-6">
                    {article.image && (
                      <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <span className="text-gray-500 text-sm">{article.category}</span>
                      <h3 className="font-heading text-orange-500 text-lg mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                      <Link
                        to={`/blog/${article.id}`}
                        className="text-orange-500 hover:text-orange-600 font-medium text-sm mt-2 inline-block"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
