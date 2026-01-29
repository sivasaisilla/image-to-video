import { Check, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [enterpriseTier, setEnterpriseTier] = useState(1);

  const plans = [
    {
      name: "Starter",
      duration: "30 second video",
      price: 9.90,
      features: [
        "Website video",
        "MLS Listing video",
        "Social media reel",
        "Custom branded videos",
        "1080 video output",
        "Company logo & watermarks",
        "Dedicated support",
      ],
      popular: false,
      cta: "Get Started",
    },
    {
      name: "Professional",
      duration: "60 second video",
      price: 15.90,
      features: [
        "Website video",
        "MLS Listing video",
        "Social media reel",
        "Custom branded videos",
        "1080 video output",
        "Company logo & watermarks",
        "Dedicated support",
        "API Access",
      ],
      popular: false,
      cta: "Get Started",
    },
    {
      name: "Exclusive",
      duration: "90 second video",
      price: 19.90,
      features: [
        "Website video",
        "MLS Listing video",
        "Social media reel",
        "Custom branded videos",
        "1080 video output",
        "Company logo & watermarks",
        "Dedicated support",
        "API Access",
      ],
      popular: true,
      cta: "Get Started",
    },
  ];

  const getEnterprisePrice = () => {
    const basePrice = 199.0;
    return basePrice + (enterpriseTier - 1) * 75;
  };

  const getEnterprisePhotos = () => {
    return 200 + (enterpriseTier - 1) * 150;
  };

  const calculatePricePerPhoto = (price: number, photos: number) => {
    return (price / photos).toFixed(2);
  };

  return (
    <section id="prices" className="px-6 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm">Pricing Plans</span>
          </div>

          <h2 className="text-4xl lg:text-5xl xl:text-6xl mb-6 max-w-4xl mx-auto leading-tight">
            Choose the <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 bg-clip-text text-transparent">perfect plan</span>
          </h2>

          <p className="text-white/70 text-lg lg:text-xl mb-10">
            Start creating stunning videos today
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`relative backdrop-blur-md rounded-md shadow-2xl flex flex-col ${
                  plan.popular
                    ? 'bg-white/10 border-2 border-amber-400/50 ring-2 ring-amber-400/20'
                    : 'bg-white/5 border border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-full">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8 flex flex-col flex-grow">
                  {/* Plan Name */}
                  <h3 className="text-3xl mb-3">{plan.name}</h3>

                  {/* Video Duration */}
                  <div className="mb-6">
                    <div className="text-3xl bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">{plan.duration}</div>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <span className="text-5xl">&euro;{plan.price.toFixed(2)}</span>
                  </div>

                  {/* Features */}
                  <div className="flex-grow space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-sm backdrop-blur-md bg-gradient-to-br from-green-400/20 to-emerald-400/20 border border-green-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-400" strokeWidth={3} />
                        </div>
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: plan.popular ? "0 20px 60px rgba(251, 191, 36, 0.3)" : "none" }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-md transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-2xl'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}