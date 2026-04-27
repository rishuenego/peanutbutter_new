"use client";

import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { ArrowRight, Truck, Award, Leaf, Clock, Star } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: featuredProducts } = useSWR<Product[]>(
    "/api/products/featured",
    fetcher
  );
  const { data: bestsellers } = useSWR<Product[]>(
    "/api/products/bestsellers",
    fetcher
  );

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-amber-200/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-orange-200/30 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200/30 rounded-full blur-lg animate-bounce" />

        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="z-10">
              <span className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
                Premium Quality Peanut Butter
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Pure{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  Peanut
                </span>{" "}
                Goodness
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                Crafted with love using only the finest peanuts. No additives,
                no preservatives - just pure, creamy perfection in every jar.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Shop Now
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-white text-gray-800 px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-lg border border-gray-200 transform hover:-translate-y-1 transition-all duration-300"
                >
                  Our Story
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-8 mt-12">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="ml-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      5,000+ Happy Customers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative z-10">
              <div className="relative">
                {/* Glowing background */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-3xl opacity-20 scale-110" />
                <Image
                  src="/images/peanut-butter-hero.png"
                  alt="Premium Peanut Butter"
                  width={600}
                  height={600}
                  className="relative z-10 drop-shadow-2xl animate-float"
                  priority
                />
                {/* Floating badges */}
                <div className="absolute top-10 right-0 bg-white rounded-2xl shadow-xl p-4 animate-bounce-slow">
                  <div className="flex items-center gap-2">
                    <Leaf className="text-green-500" size={24} />
                    <span className="font-semibold text-gray-800">
                      100% Natural
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-20 left-0 bg-white rounded-2xl shadow-xl p-4 animate-bounce-slow delay-500">
                  <div className="flex items-center gap-2">
                    <Award className="text-amber-500" size={24} />
                    <span className="font-semibold text-gray-800">
                      Premium Quality
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#ffffff"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Leaf,
                title: "100% Natural",
                desc: "No additives or preservatives",
              },
              {
                icon: Award,
                title: "Premium Quality",
                desc: "Finest selected peanuts",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Free shipping on orders above Rs. 500",
              },
              {
                icon: Clock,
                title: "Fresh Always",
                desc: "Made fresh to order",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group text-center p-6 rounded-2xl hover:bg-amber-50 transition-colors duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-amber-600" size={28} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white to-amber-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-amber-600 font-medium uppercase tracking-wider text-sm">
                Our Collection
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
                Featured Products
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium peanut butter
                varieties, crafted with love and the finest ingredients.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-amber-600 px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-lg border-2 border-amber-500 hover:bg-amber-500 hover:text-white transition-all duration-300"
              >
                View All Products
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellers && bestsellers.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-amber-600 font-medium uppercase tracking-wider text-sm">
                Customer Favorites
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
                Bestsellers
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join thousands of happy customers who love these popular picks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestsellers.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Taste the Difference?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have made the switch to
            our premium, all-natural peanut butter.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white text-amber-600 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Shop Now
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
