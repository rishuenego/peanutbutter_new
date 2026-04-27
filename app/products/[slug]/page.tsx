"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Check,
  ArrowLeft,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/lib/cart-context";
import { Product } from "@/lib/types";
import { formatPrice, getImageUrl } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const { data: product, isLoading } = useSWR<Product>(
    `/api/products/${slug}`,
    fetcher
  );
  const { data: relatedProducts } = useSWR<Product[]>(
    "/api/products/featured",
    fetcher
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const images = product?.images?.length
    ? product.images
    : product?.image
    ? [product.image]
    : ["/images/placeholder.jpg"];

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const discountPercentage = product?.compare_price
    ? Math.round(
        ((product.compare_price - product.price) / product.compare_price) * 100
      )
    : 0;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-amber-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Shop
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-amber-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-amber-600">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discountPercentage > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {discountPercentage}% OFF
                </span>
              )}
              {product.is_bestseller && (
                <span className="absolute top-4 right-4 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  BESTSELLER
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx
                        ? "border-amber-500"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.category && (
              <span className="text-amber-600 font-medium uppercase tracking-wider text-sm">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < 4
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-500">(4.0) · 128 Reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-amber-600">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Weight */}
            {product.weight && (
              <p className="text-gray-500 mb-6">
                <span className="font-medium">Weight:</span> {product.weight}
              </p>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock && product.stock > 0 ? (
                <>
                  <Check className="text-green-500" size={20} />
                  <span className="text-green-600 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 rounded-l-full transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 font-semibold">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock || 10, quantity + 1))
                  }
                  className="p-3 hover:bg-gray-100 rounded-r-full transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>

              <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors">
                <Heart size={20} />
              </button>
              <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors">
                <Share2 size={20} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <Truck className="mx-auto text-amber-600 mb-2" size={24} />
                <p className="text-sm font-medium text-gray-900">
                  Free Shipping
                </p>
                <p className="text-xs text-gray-500">Orders above Rs. 500</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto text-amber-600 mb-2" size={24} />
                <p className="text-sm font-medium text-gray-900">
                  Quality Assured
                </p>
                <p className="text-xs text-gray-500">100% Natural</p>
              </div>
              <div className="text-center">
                <RotateCcw className="mx-auto text-amber-600 mb-2" size={24} />
                <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-500">7-day policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts
                .filter((p) => p.slug !== slug)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
