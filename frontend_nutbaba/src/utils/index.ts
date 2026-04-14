import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Admin API helper for authenticated requests
const ADMIN_API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : "http://localhost:5000/api";

export async function adminFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem("adminToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${ADMIN_API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

export function formatPrice(price: number | string | undefined | null): string {
  const numPrice = Number(price) || 0;
  return `RS. ${numPrice.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function calculateDiscount(mrp: number, salePrice: number): number {
  return Math.round(((mrp - salePrice) / mrp) * 100);
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-purple-100 text-purple-800",
    in_transit: "bg-orange-100 text-orange-800",
    out_for_delivery: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    returned: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
  };
  return labels[status] || status;
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NB${timestamp}${random}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

export function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
}
