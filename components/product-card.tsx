"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Product } from "@/lib/types";
import { formatPrice, getImageUrl } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const discountPercentage = product.compare_price
    ? Math.round(
        ((product.compare_price - product.price) / product.compare_price) * 100
      )
    : 0;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.is_bestseller && (
          <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            BESTSELLER
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-amber-500 hover:text-white transition-colors">
          <Heart size={18} />
        </button>
        <Link
          href={`/products/${product.slug}`}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-amber-500 hover:text-white transition-colors"
        >
          <Eye size={18} />
        </Link>
      </div>

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <span className="text-xs text-amber-600 font-medium uppercase tracking-wider">
            {product.category}
          </span>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 mt-1 mb-2 line-clamp-2 hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Weight */}
        {product.weight && (
          <p className="text-sm text-gray-500 mb-2">{product.weight}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < 4
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200"
              }
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.0)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-amber-600">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-full shadow-md transition-all duration-300 hover:scale-110 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-red-500 mt-2">
            Only {product.stock} left in stock!
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-2 font-medium">Out of Stock</p>
        )}
      </div>
    </div>
  );
}
