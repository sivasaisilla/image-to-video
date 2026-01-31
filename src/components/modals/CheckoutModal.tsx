import React, { useState } from "react";
import { X } from "lucide-react";
import { cloudFunctions } from "../../services/firebase";
import { PLANS, formatSeconds } from "../../services/creditService";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onSuccess?: () => void;
}

export function CheckoutModal({ isOpen, onClose, currentUser, onSuccess }: CheckoutModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const plan = PLANS.find((p) => p.id === selectedPlan);

  const handleCheckout = async () => {
    if (!plan || !currentUser?.uid) return;

    setLoading(true);
    setError("");

    try {
      const currentUrl = window.location.href;
      const successUrl = `${currentUrl}?checkout=success`;
      const cancelUrl = currentUrl;

      const result = await cloudFunctions.createCheckoutSession(
        plan.id,
        plan.name,
        Math.round(plan.priceUSD * 100),
        plan.creditsSeconds,
        successUrl,
        cancelUrl
      );

      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        setError(result.error || "Failed to create checkout session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Purchase Credits</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {PLANS.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === p.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-bold text-lg text-gray-900 mb-2">{p.name}</div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ${p.priceUSD.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {formatSeconds(p.creditsSeconds)}
                </div>
                <div className="text-xs text-gray-500">
                  ${(p.pricePerSecond * 60).toFixed(2)}/min
                </div>
              </div>
            ))}
          </div>

          {/* Current Balance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Current Balance</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatSeconds(currentUser?.credits?.availableSeconds || 0)}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">How credits work:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Each second of video costs 1 credit</li>
              <li>• 30-second video = 30 credits</li>
              <li>• 60-second video = 60 credits</li>
              <li>• Unused credits never expire</li>
              <li>• Referral rewards earn additional credits</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Checkout - $${plan?.priceUSD.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
