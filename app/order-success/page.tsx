"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <MainLayout>
      <div className="min-h-[70vh] bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>

            <p className="text-gray-600 mb-6">
              Thank you for your order. We have received your order and will
              begin processing it soon.
            </p>

            {orderId && (
              <div className="bg-amber-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-mono font-bold text-amber-600 text-lg">
                  {orderId}
                </p>
              </div>
            )}

            <div className="space-y-3 text-left bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-amber-500" />
                <p className="text-gray-700">
                  You will receive an email confirmation shortly.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-amber-500" />
                <p className="text-gray-700">
                  Track your order status in your account.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/account/orders"
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                View Orders
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-semibold transition-colors"
              >
                <Home size={18} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        </MainLayout>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
