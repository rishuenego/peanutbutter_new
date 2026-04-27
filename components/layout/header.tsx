"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, User, UserPlus, ShoppingCart, Menu, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { getCartCount } = useCart()
  const { user, logout } = useAuth()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About us", path: "/about" },
    { name: "Why NutBaba", path: "/why-nutbaba" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-cream shadow-sm">
      {/* Top bar */}
      <div className="bg-[#c96212] text-white text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="font-sans">Free Shipping Order Above 499/-</span>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-primary transition-colors font-sans">
              Become a Distributor
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/orders" className="hover:text-primary transition-colors font-sans">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3 bg-[#fff8ed]">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/images/nut baba logo.webp"
              alt="Nut Baba"
              className="h-12 w-12 md:h-14 md:w-14 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-[#823303] hover:text-primary transition-colors font-medium text-sm font-sans"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search, User, Cart */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c96212]" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-48 lg:w-64 border-2 border-[#c96212] rounded-full text-sm focus:outline-none focus:border-primary-dark bg-white font-sans"
                />
              </div>
            </form>

            {/* User Icon with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="p-2 border-2 border-[#c96212] rounded-full bg-[#c96212] transition-colors"
              >
                <User className="h-5 w-5 text-white" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                  {user ? (
                    <>
                      <Link
                        href="/orders"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors font-sans"
                      >
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">My Orders</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsUserDropdownOpen(false)
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left font-sans"
                      >
                        <X className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors font-sans"
                      >
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">Login</span>
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors font-sans"
                      >
                        <UserPlus className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">Register</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => {
                if (user) {
                  router.push("/cart")
                } else {
                  router.push("/login?redirect=/cart")
                }
              }}
              className="flex items-center gap-2 bg-[#c96212] text-white px-4 py-2 rounded-full transition-colors text-sm font-sans"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart ({getCartCount()})</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-cream-dark rounded-full transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6 text-brown" /> : <Menu className="h-6 w-6 text-brown" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="sm:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-primary rounded-full text-sm focus:outline-none focus:border-primary-dark bg-white font-sans"
            />
          </div>
        </form>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-cream-dark pt-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-brown hover:text-primary transition-colors font-medium py-2 font-sans"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
