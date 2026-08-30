import sys

with open("src/components/Header.tsx", "r", encoding="utf-8") as f:
    text = f.read()

old_logo = """        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo-transparent.png" 
            alt="Neomeditech Logo" 
            width={240} 
            height={80} 
            className="h-20 w-auto object-contain"
            style={{ width: 'auto' }}
            priority
          />
        </Link>"""

new_logo = """        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image 
            src="/logo-transparent.png" 
            alt="Neomeditech Logo" 
            width={80} 
            height={80} 
            className="h-16 md:h-20 w-auto object-contain"
            style={{ width: 'auto' }}
            priority
          />
          <span className="text-2xl md:text-3xl font-black text-brand-navy tracking-tight hidden sm:block">
            Neomeditech
          </span>
        </Link>"""

text = text.replace(old_logo, new_logo)

with open("src/components/Header.tsx", "w", encoding="utf-8") as f:
    f.write(text)
