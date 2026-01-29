import { useState } from "react";
import { ArrowLeft, Coins, Zap, Check } from "lucide-react";

interface TopUpPageProps {
  onClose: () => void;
}

export function TopUpPage({ onClose }: TopUpPageProps) {
  const [customAmount, setCustomAmount] = useState("");

  const packages = [
    {
      credits: 25,
      price: 9.99,
      pricePerCredit: 0.40,
      popular: false,
    },
    {
      credits: 50,
      price: 17.99,
      pricePerCredit: 0.36,
      popular: true,
    },
    {
      credits: 100,
      price: 31.99,
      pricePerCredit: 0.32,
      popular: false,
    },
    {
      credits: 200,
      price: 55.99,
      pricePerCredit: 0.28,
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-[#131519] z-50 flex flex-col overflow-y-auto relative">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 flex-shrink-0 sticky top-0 backdrop-blur-md bg-white/5 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-white/10 hover:border-white/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="w-px h-6 bg-white/20"></div>
          <h1 className="text-lg">Top up</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Current Status */}
          <div className="mb-8">
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-5 h-5 text-white/60" />
                    <span className="text-lg">Current Status</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <p className="text-sm text-white/50">Credits Available</p>
                      <p className="text-2xl">75</p>
                    </div>
                    <div className="w-px h-10 bg-white/20"></div>
                    <div>
                      <p className="text-sm text-white/50">Current Plan</p>
                      <p className="text-sm">Free</p>
                    </div>
                    <div className="w-px h-10 bg-white/20"></div>
                    <div>
                      <p className="text-sm text-white/50">Cost Per Photo</p>
                      <p className="text-sm">5 credits</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="mb-8">
            <h2 className="text-lg mb-4">Credit Packages</h2>
            <div className="grid grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.credits}
                  className={`backdrop-blur-md rounded-md p-6 flex flex-col relative transition-all ${
                    pkg.popular
                      ? 'bg-white/10 border-2 border-white/30'
                      : 'bg-white/5 border border-white/20 hover:border-white/30'
                  }`}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black rounded text-xs">
                      Most Popular
                    </div>
                  )}

                  {/* Credits */}
                  <div className="mb-4 text-center">
                    <div className="text-3xl mb-1">{pkg.credits}</div>
                    <p className="text-xs text-white/50">credits</p>
                  </div>

                  {/* Price */}
                  <div className="mb-4 text-center">
                    <div className="text-xl mb-1">${pkg.price}</div>
                    <p className="text-xs text-white/50">${pkg.pricePerCredit}/credit</p>
                  </div>

                  {/* Buy Button */}
                  <button
                    className={`w-full py-2.5 rounded-md transition-all text-sm ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black hover:shadow-lg hover:shadow-amber-400/20'
                        : 'bg-white/10 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-8">
            <h2 className="text-lg mb-4">Custom Credit Amount</h2>
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-md text-sm placeholder:text-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                <button className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-md hover:shadow-lg hover:shadow-amber-400/20 transition-all text-sm">
                  Buy Credits
                </button>
              </div>
              <p className="text-xs text-white/40 mt-3">
                Minimum purchase: 10 credits ($3.99) • Base rate: $0.40/credit
              </p>
            </div>
          </div>

          {/* How Credits Work */}
          <div>
            <h2 className="text-lg mb-4">How Credits Work</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Credit Usage */}
              <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-white/60" />
                  <h3 className="text-base">Credit Usage</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">
                      <strong className="text-white">5 credits</strong> per AI-generated photo
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">
                      <strong className="text-white">10 credits</strong> per video generation (up to 60s)
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">
                      <strong className="text-white">3 credits</strong> per AI image edit
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">
                      <strong className="text-white">Free</strong> to export and download
                    </span>
                  </li>
                </ul>
              </div>

              {/* What You Get */}
              <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-white/60" />
                  <h3 className="text-base">What You Get</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">Credits never expire</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">Use credits across all features</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">No monthly commitments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">Bulk discounts on larger packages</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">Secure payment processing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/40">
              All purchases are secure and encrypted. Need help? Contact support@infinitecreator.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}