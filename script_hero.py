import sys

with open("src/app/[locale]/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Change the section background and remove the hero.jpg and gradient
old_section_start = """      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-start overflow-hidden">
        {/* Background Image with slow zoom */}
        <motion.div 
          className="absolute inset-0 z-0"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
        >
          <Image 
            src="/hero.jpg" 
            alt="Medical Equipment in use" 
            fill 
            className="object-cover object-center" 
            priority 
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/70 to-transparent z-10"></div>"""

new_section_start = """      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[650px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-navy via-slate-800 to-brand-navy/90">
        
        {/* Decorative background circle */}
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
"""

text = text.replace(old_section_start, new_section_start)

# 2. Add the image to the right side
# Find the end of the left column (after the Contact Us button)
left_col_end = """                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/contact" className="bg-transparent hover:bg-white text-white hover:text-brand-navy border-2 border-white px-8 py-3.5 rounded-full font-bold transition-colors shadow-sm text-center block w-full">
                    Contact Us
                  </Link>
                </motion.div>
              </motion.div>
            </div>"""

right_col_content = """

            {/* Right Column - Product Image sliding from right */}
            <motion.div 
              initial={{ opacity: 0, x: 150 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="w-full md:w-[50%] lg:w-[55%] flex justify-center items-center z-10 mt-12 md:mt-0"
            >
              <Image 
                src="/login-podium-transparent.png"
                alt="Neomeditech Medical Equipment"
                width={800}
                height={600}
                className="object-contain w-full max-w-[650px] h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                priority
              />
            </motion.div>
"""
text = text.replace(left_col_end, left_col_end + right_col_content)

with open("src/app/[locale]/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)
