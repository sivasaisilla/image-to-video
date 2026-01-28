import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      title: "Real Estate Agent",
      heading: "Game Changer for My Business",
      content:
        "This platform completely transformed how I present properties. The videos are stunning and professional, saving me countless hours. My listings now get 3x more engagement!",
      avatar:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY0NTI1Mzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Michael Chen",
      title: "Property Developer",
      heading: "Incredible AI Technology",
      content:
        "The AI-powered video creation is mind-blowing. We create dozens of property videos every week, and the quality rivals what we used to pay thousands for. Absolute must-have tool!",
      avatar:
        "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjQ0OTA2NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Jessica Rodriguez",
      title: "Marketing Director",
      heading: "Perfect for Social Media",
      content:
        "Our social media engagement skyrocketed after we started using these videos. The customization options are endless, and the reels feature is perfect for Instagram. Couldn't be happier!",
      avatar:
        "https://images.unsplash.com/photo-1737574821698-862e77f044c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NDU1Mjk4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  return (
    <section className="px-6 py-24 lg:py-32">
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
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-sm">Testimonials</span>
          </div>

          <h2 className="text-4xl lg:text-5xl xl:text-6xl mb-6">
            What our <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 bg-clip-text text-transparent">users say</span>
          </h2>
          <p className="text-white/70 text-lg lg:text-xl">
            Join thousands of satisfied real estate professionals
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6 shadow-2xl hover:bg-white/10 transition-all group"
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-md backdrop-blur-md bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Quote className="w-5 h-5 text-amber-400" />
              </div>

              {/* Testimonial Content */}
              <p className="text-white/70 leading-relaxed mb-4">
                "{testimonial.content}"
              </p>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20">
                  <ImageWithFallback
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="mb-0.5">{testimonial.name}</div>
                  <div className="text-white/60 text-sm">
                    {testimonial.title}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}