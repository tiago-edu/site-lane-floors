import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Star,
  CheckCircle,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Quote,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

/* --- COMPONENTES CUSTOMIZADOS DE ANIMAÇÃO --- */

// Efeito Tilt 3D estilo Lando Norris Card
const TiltWrapper = ({ children, className }) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg inclinação
    const rotateY = ((x - centerX) / centerX) * 10;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform:
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ ...tiltStyle, transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};

// Reveal on Scroll (Aparecer suavemente)
const Reveal = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Carrossel Horizontal Controlado Pelo Scroll Vertical
const HorizontalGallery = ({ images }) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !trackRef.current) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Distância que o container permite de rolagem antes de descolar
      const scrollableDistance = rect.height - windowHeight;

      if (rect.top <= 0 && scrollableDistance > 0) {
        // Porcentagem de rolagem dentro da seção "sticky"
        const scrollProgress = Math.min(
          Math.abs(rect.top) / scrollableDistance,
          1
        );

        // Calcular o quanto a trilha inteira deve mover horizontalmente
        const maxTranslate =
          trackRef.current.scrollWidth -
          window.innerWidth +
          window.innerWidth * 0.2;

        setTranslateX(scrollProgress * maxTranslate);
      } else if (rect.top > 0) {
        setTranslateX(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      id="gallery"
      className="relative h-[400vh] bg-stone-100"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center py-20">
        <div className="text-center absolute top-24 w-full z-10 pointer-events-none">
          <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-6 drop-shadow-md">
            Our Portfolio
          </h2>
          <div className="w-24 h-1 bg-[#D32F2F] mx-auto shadow-sm"></div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-10 px-[10vw] transition-transform duration-75 ease-out will-change-transform items-center h-full mt-10"
          style={{ transform: `translate3d(-${translateX}px, 0, 0)` }}
        >
          {images.map((src, i) => (
            <TiltWrapper
              key={i}
              className="w-[85vw] md:w-[45vw] h-[50vh] md:h-[65vh] shrink-0"
            >
              <div className="w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white relative group cursor-crosshair z-translate">
                <img
                  src={src}
                  alt={`Gallery Image ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </TiltWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

/* --- APLICATIVO PRINCIPAL --- */

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [formStatus, setFormStatus] = useState('idle');

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => setFormStatus('success'), 2000);
  };

  const isScrolled = scrollY > 20;

  // Imagens Extraídas dos Links Originais para os Serviços
  const servicesData = [
    {
      title: 'Design Services',
      img: 'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/49684b9-1920w.jpg',
    },
    {
      title: 'Sales & Installation',
      img: 'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/49184b9-1920w.jpg',
    },
    {
      title: 'Repair & Maintenance',
      img: 'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/167680467_230282298888024_202977720705864745_n-1920w.png',
    },
    {
      title: 'Refinishing',
      img: 'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/48884b9-1920w.jpg',
    },
    {
      title: 'Water & Fire Restoration',
      img: 'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/45784b9-1920w.jpg',
    },
    {
      title: 'Hand Scraping',
      img: 'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/49284b9-1920w.jpg',
    },
    {
      title: 'Stair work',
      img: 'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/49784b9-1920w.jpg',
    },
  ];

  // Imagens Extraídas dos Links Originais para a Galeria
  const galleryImages = [
    'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/Bamboo+Floor+with+Custom+Curved+Nosing+and+Bamboo+Stairs+2+of+3-1920w.JPG',
    'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/Bamboo+Stairs+1+of+3-1920w.JPG',
    'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/Borders+with+French+Knots+2-1920w.jpg',
    'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/Designer+Kitchen-1920w.JPG',
    'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/Entrance-1920w.jpg',
    'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/Frat+House+Before+with+Sanded+Area+2-1920w.jpg',
    'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/Hickory-1920w.JPG',
    'https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/Red+Oak+Herringbone-1920w.jpg',
  ];

  const products = [
    'Hardwood Floors',
    'Prefinished or Unfinished',
    'Domestic and Exotic Woods',
    'Solid & Engineered Woods',
    'Cork Floors',
    'Borders & Custom Inlays',
    'Wood over Radiant Heat',
    'Water & Solvent Based Finishes',
  ];

  const manufacturers = [
    'Aayers Floors',
    'Allwood Flooring',
    'Appalachian Flooring',
    'Aurora Hardwood',
    'Bona Kemi Finish',
    'Colonial Collection',
    'Dusk-Son',
    'En Bois Flooring',
    'Gala Flooring',
    'Garrison Collection',
    'Genie Mat RST',
    'Craft Custom Hardwood',
    'Hallmark Floors',
    'Indusparquet',
    'Kentwood Flooring',
    'Mirage Floors',
    'Mullican Hardwood',
    'North Wood Flooring',
    'Opus Hardwood Collection',
    'Oshkosh Designs',
    'Precision Flooring Products',
    'Prima Floors',
    'Qu-Cork',
    'Sheoga Hardwood Flooring',
    'Somerset Hardwood Flooring',
    'TAS Flooring',
    'Tradelink Wood Products',
    'Urban Floor',
    'WD Flooring',
    'Woodpecker Flooring',
    'XL Flooring',
  ];

  const careRules = [
    'Place floor mats at entrances to trap dirt.',
    'Sweep floors weekly with brooms with fine, exploded ends that trap dust and grit.',
    "Vacuum cleaners aren't just for carpets.",
    "Water and liquids can damage the floor's finish.",
    'Go over a hardwood floor weekly with multi-surface vacuums.',
    'Wipe up spills, pet accidents, and other mishaps immediately.',
  ];

  const doAndDonts = [
    {
      title: 'Enemy Number 1: Water',
      content:
        "Regardless of its finish, your floor will quickly lose its luster if exposed to water. More severe damage is also possible, including warping and other problems. DO: Wipe up any spills immediately with a soft, dry cloth... DON'T: Let water stand on your floor, or use wet clothes for clean up.",
    },
    {
      title: 'Banish Dirt, Dust, and Grit',
      content:
        "Dirt, dust, and grit can also damage your hardwood floor. Tracking dirt, dust, and grit can dull its finish and cause scratches... DO: Sweep your floors regularly. Invest in a good broom... DON'T: Use an upright vacuum with beater bars. They can cause dents.",
    },
    {
      title: 'Area Rugs',
      content:
        "DO: Use area rugs or small sections of carpet placed inside doorways and in areas like kitchens... DON'T: Use throw rugs with rubber or vinyl backing without checking to determine if they will affect your floor's finish.",
    },
    {
      title: 'Sunlight',
      content:
        'The ultraviolet radiation in sunlight can cause discoloration over time... DO: Protect your floors using sheer drapes, curtains, or blinds to limit sunlight.',
    },
    {
      title: 'Furniture',
      content:
        "DO: Place glides made of felt or some other fabric under the legs of furniture to prevent scratches. DO: Lift furniture when moving it to avoid scratches on the floor's surface.",
    },
    {
      title: 'Shoes',
      content:
        'DO: Make sure there are no exposed nails or metal heel supports on shoes that could scratch or dent the floor. DO: Be aware that high heels can dent a hardwood floor.',
    },
  ];

  const firstAid = [
    {
      issue: 'Dried Milk and Food Stains',
      solution:
        'Always work from the outer edge toward the center of the stain. If the material has dried, it may be removed with a sharpened blade. Take care not to scratch the surface. Rub the spot with a slightly dampened cloth...',
    },
    {
      issue: 'Dark Spots (Ink, Pet Stains, Diaper Stains)',
      solution:
        'Follow these steps: Remove the floor finish and clean the spot and surrounding area with No. 2 steel wool and a wood cleaner or mineral spirits. Wash the area with household vinegar and permit it to stand for 3 or 4 minutes...',
    },
    {
      issue: 'Chewing Gum, Crayons, Candle Wax',
      solution:
        'Try scraping the residue off with a sharpened blade, taking care not to scratch the surface. Another option is to apply ice until the substance becomes brittle enough to break off...',
    },
    {
      issue: 'Heel Marks',
      solution:
        'Heel marks, caster marks, and similar scuffs can usually be removed by rubbing with fine steel wool and wood floor cleaner. Wipe dry and polish.',
    },
    {
      issue: 'Mold or Mildew',
      solution:
        'Using No. 1 steel wool and a good wood floor cleaner removes mold or mildew.',
    },
    {
      issue: 'Cigarette Burns',
      solution:
        'Steel wool will often remove superficial cigarette burns. A small amount of water and soap, along with the steel wool, will often remove the mark.',
    },
  ];

  const reviews = [
    {
      name: 'Randy H.',
      text: 'Very pleased with floor refinishing in 3 bedrooms of our mid-50s split level home. Technicians Hong and Shawn did excellent work sanding, filling and finishing old floors. Refinish matched well with hardwood hallway that was done over 20 years ago. Highly recommend Lane Hardwoods',
    },
    {
      name: 'Zach H.',
      text: 'Jeff Lane and his team did an awesome job refinishing the hardwood floors in our house, along with adding new floors in our kitchen and blending them into the existing hardwoods... His team was efficient, professional, timely, and great to work with.',
    },
    {
      name: 'Jason B.',
      text: "I can't say enough about the crew and craftsmanship at Lane Hardwood Floors. I wish there was more than 5 stars... These floors were original from 1968 and covered with carpet for most of their life... Again, I can't recommend them enough!",
    },
    {
      name: 'Frank B.',
      text: "Great service, friendly staff and quality craftsmanship. This is the place to go if you're looking for hardwood flooring!",
    },
    {
      name: 'Geri M.',
      text: 'Brad is the best. Great person to get the new floor job done.',
    },
  ];

  return (
    <div className="font-sans text-stone-800 bg-[#FAFAFA] min-h-screen">
      {/* Estilos Globais para Marquee Infinito e 3D */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-slow {
          display: flex;
          width: fit-content;
          animation: marquee 50s linear infinite;
        }
        .hover-pause:hover {
          animation-play-state: paused;
        }
        .z-translate {
          transform: translateZ(50px);
        }
        .bg-noise {
          background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjNDQ0Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjNTU1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+');
        }
      `,
        }}
      />

      {/* Top Bar */}
      <div className="bg-[#2D2D2D] text-white text-xs py-2 px-4 hidden md:block relative z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2 hover:text-[#D32F2F] cursor-pointer transition-colors">
              <Phone size={14} /> (206) 622-9669
            </span>
            <span className="flex items-center gap-2 hover:text-[#D32F2F] cursor-pointer transition-colors">
              <Mail size={14} /> info@lanehardwoodfloors.com
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={14} /> 14700 Aurora Ave N Shoreline, WA 98133-6546
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="font-semibold tracking-wider">MEMBER OF NWFA</span>
            <a href="#" className="hover:text-blue-400 transition-colors">
              <Facebook size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-2 top-0'
            : 'bg-transparent py-6 top-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo Original */}
          <TiltWrapper>
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => scrollToSection('home')}
            >
              <img
                src="https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/43384b9cc-130w-1920w.png"
                alt="Lane Hardwood Floors Logo"
                className="h-16 md:h-24 w-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300 z-translate"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://placehold.co/100x120/D32F2F/white?text=Lane+Logo';
                }}
              />
            </div>
          </TiltWrapper>

          {/* Navegação Desktop */}
          <nav
            className={`hidden lg:flex items-center gap-6 font-medium text-sm transition-colors cursor-pointer ${
              isScrolled ? 'text-stone-600' : 'text-stone-200'
            }`}
          >
            <span
              onClick={() => scrollToSection('home')}
              className="hover:text-[#D32F2F] font-bold transition-colors"
            >
              Home
            </span>
            <span
              onClick={() => scrollToSection('services')}
              className="hover:text-[#D32F2F] transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#D32F2F] hover:after:w-full after:transition-all"
            >
              Flooring Services
            </span>
            <span
              onClick={() => scrollToSection('care')}
              className="hover:text-[#D32F2F] transition-colors"
            >
              Care & Repair
            </span>
            <span
              onClick={() => scrollToSection('gallery')}
              className="hover:text-[#D32F2F] transition-colors"
            >
              Gallery
            </span>
            <span
              onClick={() => scrollToSection('reviews')}
              className="hover:text-[#D32F2F] transition-colors"
            >
              Reviews
            </span>
          </nav>

          {/* Botões de Ação */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-[#E67E22] text-white px-5 py-2 text-sm font-bold rounded shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-300"
            >
              Contact Us
            </button>
            <button
              onClick={() => window.open('https://google.com', '_blank')}
              className="bg-[#D32F2F] text-white px-5 py-2 text-sm font-bold rounded shadow-lg hover:shadow-red-600/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              G+ Leave Us A Review
            </button>
          </div>

          <button
            className={`lg:hidden ${
              isScrolled ? 'text-stone-800' : 'text-white'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Menu Mobile Renderização */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl flex flex-col border-t border-stone-100 animate-in slide-in-from-top-2">
            <span
              onClick={() => scrollToSection('home')}
              className="px-6 py-4 text-stone-800 font-bold border-b border-stone-100 hover:text-[#D32F2F] cursor-pointer"
            >
              Home
            </span>
            <span
              onClick={() => scrollToSection('services')}
              className="px-6 py-4 text-stone-800 font-bold border-b border-stone-100 hover:text-[#D32F2F] cursor-pointer"
            >
              Flooring Services
            </span>
            <span
              onClick={() => scrollToSection('care')}
              className="px-6 py-4 text-stone-800 font-bold border-b border-stone-100 hover:text-[#D32F2F] cursor-pointer"
            >
              Care & Repair
            </span>
            <span
              onClick={() => scrollToSection('gallery')}
              className="px-6 py-4 text-stone-800 font-bold border-b border-stone-100 hover:text-[#D32F2F] cursor-pointer"
            >
              Gallery
            </span>
            <span
              onClick={() => scrollToSection('reviews')}
              className="px-6 py-4 text-stone-800 font-bold border-b border-stone-100 hover:text-[#D32F2F] cursor-pointer"
            >
              Reviews
            </span>
            <span
              onClick={() => scrollToSection('contact')}
              className="px-6 py-4 text-[#E67E22] font-bold cursor-pointer"
            >
              Contact Us
            </span>
          </div>
        )}
      </header>

      {/* Hero Section com Parallax Dinâmico */}
      <section
        id="home"
        className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax Background */}
        <div
          className="absolute inset-0 bg-stone-900 transition-transform duration-75"
          style={{
            backgroundImage: `url('https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/Wide+Plank+European+White+Oak+in+downtown+Seattle+highrise+condo+ORIGINAL-1920w.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.4}px) scale(1.15)`,
          }}
        >
          <div className="absolute inset-0 opacity-40 bg-noise mix-blend-overlay pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#FAFAFA] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center md:text-left mt-20">
          <Reveal>
            <div className="inline-block bg-[#D32F2F] text-white px-6 py-2 text-sm font-bold tracking-[0.2em] uppercase mb-8 shadow-2xl relative overflow-hidden group">
              <span className="relative z-10">Since 1984</span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif text-white mb-6 leading-[1.1] max-w-4xl tracking-tight drop-shadow-2xl">
              Free Virtual <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-200 to-stone-500 italic">
                Estimates
              </span>{' '}
              For New Installations
            </h1>
          </Reveal>

          <Reveal delay={300}>
            <p className="text-xl text-stone-300 mb-12 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Providing beautiful and sustainable flooring solutions to our
              clients and striving to exceed their expectations in the greater
              Washington area.
            </p>
          </Reveal>

          <Reveal delay={450}>
            <button
              onClick={() => scrollToSection('quote')}
              className="bg-[#D32F2F] text-white px-10 py-5 text-xl font-bold rounded-sm shadow-2xl shadow-red-900/50 hover:bg-white hover:text-[#D32F2F] hover:shadow-white/20 transition-all duration-500 flex items-center justify-center gap-4 mx-auto md:mx-0 group transform hover:-translate-y-2"
            >
              Start Virtual Estimate
              <span className="bg-white/20 p-2 rounded-full group-hover:bg-[#D32F2F]/10 transition-colors">
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Reveal>
        </div>

        {/* Scroll Indicator Dinâmico */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
            Scroll
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Marquee/Ticker Tape (Rolo Infinito) */}
      <div className="bg-[#D32F2F] text-white py-4 overflow-hidden border-y border-red-800 shadow-inner relative z-20">
        <div className="animate-marquee hover-pause flex whitespace-nowrap items-center text-sm md:text-base font-bold uppercase tracking-[0.2em]">
          {/* Repetido 3 vezes para não quebrar a tela larga */}
          {[1, 2, 3].map((set) => (
            <React.Fragment key={set}>
              <span className="mx-8">•</span> EXPERT FLOORING CONTRACTOR
              <span className="mx-8">•</span> SEATTLE REGION
              <span className="mx-8">•</span> QUALITY WORKMANSHIP
              <span className="mx-8">•</span> NEW INSTALLATIONS
              <span className="mx-8">•</span> REFINISHING & REPAIR
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Seção Sobre & Qualidade */}
      <section id="services" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Reveal>
                <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-8 pb-6 border-b-2 border-[#D32F2F] inline-block">
                  Lane Hardwood Floors of Shoreline. WA
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-lg text-stone-600 leading-relaxed mb-6">
                  Lane Hardwood Floors from Shoreline, WA, provides unmatched
                  services to clients throughout Seattle, Shoreline, Mercer
                  Island, Bellevue, Issaquah, Kirkland, Edmonds, Redmond and the
                  surrounding areas of Washington.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-lg text-stone-600 leading-relaxed mb-8">
                  In business since 1984, we have the experience and knowledge
                  to handle your flooring needs, no matter the project size. We
                  are committed to providing beautiful and sustainable flooring
                  solutions to our clients and strive to exceed their
                  expectations.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="bg-stone-50 p-6 border-l-4 border-[#E67E22] inline-block shadow-md">
                  <p className="text-stone-800 font-bold text-lg">
                    To learn more about our services, call our team of
                    professionals at <br />
                    <a
                      href="tel:2066229669"
                      className="text-[#D32F2F] text-2xl mt-2 inline-block hover:underline"
                    >
                      206-622-9669
                    </a>
                    .
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Bloco 3D Dinâmico com a Foto Original da Logo */}
            <Reveal delay={200} className="relative">
              <TiltWrapper className="w-full">
                <div className="aspect-[4/5] bg-stone-200 rounded-tr-[120px] rounded-bl-[120px] overflow-hidden shadow-2xl relative z-translate border border-white/50 group">
                  <div className="absolute inset-0 bg-[#E8E8E8]"></div>
                  <img
                    src="https://lirp.cdn-website.com/ac55f933/dms3rep/multi/opt/43384b9cc-130w-1920w.png"
                    alt="Lane Hardwood Floors Logo Card"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1581417478175-a9ef18f210c1?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/70 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 w-full px-6 pb-40 md:pb-60 pt-12 text-center text-white z-translate pointer-events-none">
                    <ShieldCheck
                      size={48}
                      className="mx-auto mb-4 md:mb-6 opacity-90 drop-shadow-lg md:w-16 md:h-16"
                    />
                    <h4 className="text-2xl md:text-3xl font-serif mb-2 md:mb-4 drop-shadow-md">
                      Expert Flooring Contractor
                    </h4>
                    <p className="font-light text-xs md:text-sm opacity-90 leading-relaxed max-w-sm mx-auto">
                      Industry-leading wood flooring contractor that offers a
                      wide array of flooring options.
                    </p>
                  </div>
                </div>
              </TiltWrapper>

              <div
                className="absolute -bottom-10 -left-10 bg-white p-8 shadow-2xl max-w-sm border-t-4 border-[#D32F2F] z-20 hidden md:block"
                style={{ transform: `translateY(${(scrollY - 800) * -0.1}px)` }}
              >
                <div className="flex text-[#E67E22] mb-4">
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                </div>
                <p className="text-sm text-stone-600 italic mb-4 leading-relaxed">
                  "Very pleased with floor refinishing in 3 bedrooms... Highly
                  recommend Lane Hardwoods"
                </p>
                <p className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                  - Randy H.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Serviços Inovador com Fotos Reais e Zoom */}
      <section className="py-32 bg-[#FAFAFA] border-y border-stone-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-stone-100 rounded-full mix-blend-multiply opacity-50 blur-3xl animate-[spin_60s_linear_infinite] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-20 relative inline-block">
              Flooring Services We Provide
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#D32F2F]"></div>
            </h2>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-16">
            {servicesData.map((service, index) => (
              <Reveal key={index} delay={index * 100}>
                <TiltWrapper className="flex flex-col items-center group cursor-crosshair w-64">
                  <div className="w-56 h-56 rounded-full bg-stone-200 shadow-xl border-4 border-transparent group-hover:border-[#D32F2F] transition-all duration-500 relative overflow-hidden z-translate">
                    {/* Foto Real Injetada do seu site com fallback de segurança */}
                    <img
                      src={service.img}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1581417478175-a9ef18f210c1?q=80&w=600&auto=format&fit=crop';
                      }}
                    />

                    <div className="absolute inset-0 bg-[#D32F2F]/80 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out flex items-center justify-center">
                      <span className="text-white/40 font-serif text-6xl font-bold transition-colors duration-500">
                        0{index + 1}
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-8 text-lg font-bold text-stone-700 group-hover:text-[#D32F2F] transition-colors text-center w-full z-translate">
                    {service.title}
                  </h3>
                </TiltWrapper>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA COM CARROSSEL HORIZONTAL CONTROLADO PELO SCROLL */}
      <HorizontalGallery images={galleryImages} />

      {/* Produtos & Fabricantes */}
      <section
        id="products"
        className="py-32 bg-stone-900 text-white overflow-hidden relative border-t border-stone-800 z-10"
      >
        <div className="max-w-7xl mx-auto px-6 mb-20 relative z-10">
          <Reveal>
            <h2 className="text-4xl font-serif mb-12 border-b border-stone-700 pb-4 inline-block">
              Products We Carry Include
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <Reveal key={index} delay={index * 100}>
                <div className="flex items-center gap-4 bg-stone-800/50 p-6 rounded hover:bg-[#D32F2F] transition-colors duration-300 group cursor-default border border-stone-700 hover:border-[#D32F2F]">
                  <CheckCircle
                    className="text-[#D32F2F] group-hover:text-white transition-colors"
                    size={24}
                  />
                  <span className="font-bold text-sm leading-tight">
                    {product}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="relative border-y border-stone-800 bg-[#1a1a1a] py-12 rotate-[-2deg] scale-105 shadow-2xl">
          <h3 className="absolute top-2 left-6 text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em]">
            Our Manufacturers
          </h3>
          <div className="animate-marquee-slow hover-pause flex whitespace-nowrap items-center text-4xl font-serif text-stone-400">
            {[1, 2, 3].map((set) => (
              <React.Fragment key={set}>
                {manufacturers.map((mfg, idx) => (
                  <span
                    key={idx}
                    className="mx-8 hover:text-white transition-colors cursor-crosshair"
                  >
                    {mfg} <span className="text-[#D32F2F] ml-8">/</span>
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Wood Floor Care Tips */}
      <section
        id="care"
        className="py-32 bg-[#2D2D2D] text-stone-300 relative z-10"
      >
        <div
          className="absolute right-0 bottom-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,rgba(211,47,47,0.05)_0%,transparent_70%)]"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
        ></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Reveal className="text-center mb-20">
            <h2 className="text-5xl font-serif text-white mb-6 drop-shadow-lg">
              Wood Floor Care Tips
            </h2>
            <p className="text-2xl font-light text-[#E67E22] italic border-y border-stone-700 py-4 max-w-2xl mx-auto">
              "What can you buy today that will last a lifetime with minimal
              care?"
            </p>
          </Reveal>

          <Reveal>
            <div className="bg-[#1A1A1A] p-10 rounded-2xl mb-20 border border-stone-700 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#D32F2F] group-hover:w-full transition-all duration-700 ease-in-out opacity-20 pointer-events-none"></div>
              <h3 className="text-3xl text-white mb-6 font-serif relative z-10">
                Hardwood Flooring is the Healthy Choice
              </h3>
              <p className="leading-relaxed text-lg mb-8 relative z-10 text-stone-400">
                In addition to their distinctive beauty and lasting value,
                hardwood floors are often recommended by doctors because they
                trap less animal dander, dust, pollen, mites, and mold - all of
                which can trigger respiratory problems.
              </p>
              <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest relative z-10">
                Following a few simple rules can keep floors looking great:
              </h4>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4 relative z-10">
                {careRules.map((rule, idx) => (
                  <li
                    key={idx}
                    className="flex gap-4 items-start bg-stone-800/50 p-4 rounded hover:bg-stone-800 transition-colors"
                  >
                    <CheckCircle
                      size={20}
                      className="text-[#D32F2F] shrink-0 mt-0.5"
                    />
                    <span className="text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <h3 className="text-4xl text-white mb-12 font-serif text-center">
              General Do's and Don'ts
            </h3>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8 mb-24">
            {doAndDonts.map((item, index) => (
              <Reveal key={index} delay={index * 100}>
                <TiltWrapper className="h-full">
                  <div className="bg-[#1A1A1A] p-8 border border-stone-700 h-full hover:border-[#D32F2F] transition-colors relative z-translate shadow-xl">
                    <h4 className="text-[#D32F2F] font-bold text-xl mb-4 uppercase tracking-wide">
                      {item.title}
                    </h4>
                    <p className="text-base leading-relaxed text-stone-400">
                      {item.content}
                    </p>
                  </div>
                </TiltWrapper>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <h3 className="text-4xl text-white mb-12 font-serif text-center">
              First Aid: Sealed and Waxed Floors
            </h3>
          </Reveal>
          <div className="space-y-4 max-w-4xl mx-auto">
            {firstAid.map((item, index) => (
              <Reveal key={index} delay={index * 50}>
                <div className="border border-stone-700 rounded-lg bg-[#1A1A1A] overflow-hidden transition-all duration-300 hover:border-stone-500">
                  <button
                    className="w-full text-left px-8 py-6 flex justify-between items-center text-white font-bold hover:bg-[#222] transition-colors text-lg"
                    onClick={() => toggleAccordion(index)}
                  >
                    {item.issue}
                    <div
                      className={`p-2 rounded-full border border-stone-600 transition-transform duration-500 ${
                        activeAccordion === index
                          ? 'rotate-180 bg-[#D32F2F] border-[#D32F2F]'
                          : ''
                      }`}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </button>
                  <div
                    className="transition-all duration-500 ease-in-out"
                    style={{
                      maxHeight: activeAccordion === index ? '500px' : '0',
                      opacity: activeAccordion === index ? 1 : 0,
                    }}
                  >
                    <div className="px-8 pb-8 text-base text-stone-400 leading-relaxed bg-[#111]">
                      {item.solution}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário Interativo */}
      <section
        id="quote"
        className="py-32 bg-[#FAFAFA] relative overflow-hidden z-10"
      >
        <div
          className="absolute left-[-10%] top-1/4 w-[600px] h-[600px] rounded-full border-[40px] border-stone-100 opacity-50"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        ></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Reveal>
            <TiltWrapper>
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-translate">
                <div className="bg-[#D32F2F] text-white p-8 md:p-12 md:w-2/5 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

                  <h2 className="text-3xl md:text-4xl font-serif mb-6 relative z-10">
                    Request a Quote
                  </h2>
                  <p className="text-red-100 text-base md:text-lg leading-relaxed mb-12 relative z-10">
                    Get a quote today from Lane Hardwood Floors of Shoreline,
                    WA. Just call{' '}
                    <strong className="text-white">206-622-9669</strong> or fill
                    out the form.
                  </p>
                  <div className="mt-auto relative z-10 bg-black/20 p-6 rounded border-l-4 border-white">
                    <p className="font-bold text-lg">
                      Showroom By Appointment Only
                    </p>
                    <p className="text-sm opacity-90 mt-2">
                      14700 Aurora Ave N
                    </p>
                  </div>
                </div>

                <div className="p-8 md:p-12 md:w-3/5 bg-white">
                  {formStatus === 'success' ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 text-center py-10 animate-in fade-in duration-500">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <CheckCircle className="text-green-600 w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-stone-800">
                        Request Received!
                      </h3>
                      <p className="text-stone-600">
                        Thank you for your interest. Our team will contact you
                        shortly.
                      </p>
                      <button
                        onClick={() => setFormStatus('idle')}
                        className="mt-8 text-[#D32F2F] font-bold uppercase tracking-widest text-sm hover:underline"
                      >
                        Submit another request
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleFormSubmit}
                      className="space-y-6 md:space-y-8"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        <div className="relative group">
                          <input
                            required
                            type="text"
                            placeholder="First Name"
                            className="w-full border-b-2 border-stone-200 py-2 bg-transparent focus:outline-none focus:border-[#D32F2F] transition-colors peer"
                          />
                        </div>
                        <div className="relative group">
                          <input
                            required
                            type="text"
                            placeholder="Last Name"
                            className="w-full border-b-2 border-stone-200 py-2 bg-transparent focus:outline-none focus:border-[#D32F2F] transition-colors peer"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        <div className="relative group">
                          <input
                            required
                            type="tel"
                            placeholder="Phone"
                            className="w-full border-b-2 border-stone-200 py-2 bg-transparent focus:outline-none focus:border-[#D32F2F] transition-colors peer"
                          />
                        </div>
                        <div className="relative group">
                          <input
                            required
                            type="email"
                            placeholder="Email"
                            className="w-full border-b-2 border-stone-200 py-2 bg-transparent focus:outline-none focus:border-[#D32F2F] transition-colors peer"
                          />
                        </div>
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Address"
                        className="w-full border-b-2 border-stone-200 py-2 bg-transparent focus:outline-none focus:border-[#D32F2F] transition-colors"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-2 md:pt-4">
                        <div>
                          <label className="text-[10px] md:text-xs text-stone-500 uppercase font-bold tracking-wider mb-2 block">
                            Square Footage
                          </label>
                          <select
                            required
                            className="w-full border-2 border-stone-200 p-3 rounded bg-stone-50 text-stone-700 focus:border-[#D32F2F] focus:outline-none transition-colors"
                          >
                            <option value="">Select...</option>
                            <option value="under500">Under 500 sq ft</option>
                            <option value="500to1000">500 - 1000 sq ft</option>
                            <option value="over1000">Over 1000 sq ft</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] md:text-xs text-stone-500 uppercase font-bold tracking-wider mb-2 block">
                            Service Requested
                          </label>
                          <select
                            required
                            className="w-full border-2 border-stone-200 p-3 rounded bg-stone-50 text-stone-700 focus:border-[#D32F2F] focus:outline-none transition-colors"
                          >
                            <option value="">Select...</option>
                            <option value="new">New Installation</option>
                            <option value="refinish">Refinishing</option>
                            <option value="repair">Repair</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 md:pt-6">
                        <button
                          disabled={formStatus === 'submitting'}
                          type="submit"
                          className="w-full flex justify-center items-center gap-3 bg-stone-900 text-white py-4 md:py-5 rounded font-bold tracking-widest uppercase hover:bg-[#D32F2F] transition-colors shadow-lg hover:shadow-red-900/50 transform hover:-translate-y-1 duration-300 disabled:opacity-70 disabled:hover:translate-y-0 text-sm md:text-base"
                        >
                          {formStatus === 'submitting' ? (
                            <>
                              <Loader2 className="animate-spin" /> Processing...
                            </>
                          ) : (
                            'Submit Request Engine'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </TiltWrapper>
          </Reveal>
        </div>
      </section>

      {/* Reviews */}
      <section
        id="reviews"
        className="py-32 bg-stone-100 border-t border-stone-200 z-10 relative"
      >
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-20">
            <h2 className="text-5xl font-serif text-stone-800 mb-6">
              See What Our Customers Are Saying
            </h2>
            <div className="w-24 h-1 bg-[#D32F2F] mx-auto"></div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {reviews.map((review, idx) => (
              <Reveal key={idx} delay={idx * 150}>
                <TiltWrapper className="h-full">
                  <div className="bg-white p-10 rounded-tr-[40px] rounded-bl-[40px] shadow-xl border border-stone-100 relative h-full z-translate group">
                    <Quote
                      className="absolute top-8 right-8 text-stone-100 group-hover:text-[#D32F2F]/10 transition-colors"
                      size={80}
                    />
                    <div className="flex text-[#E67E22] mb-8 relative z-10">
                      <Star size={20} fill="currentColor" />
                      <Star size={20} fill="currentColor" />
                      <Star size={20} fill="currentColor" />
                      <Star size={20} fill="currentColor" />
                      <Star size={20} fill="currentColor" />
                    </div>
                    <p className="text-stone-600 text-base leading-relaxed mb-10 relative z-10 italic">
                      "{review.text}"
                    </p>
                    <div className="font-bold text-stone-800 border-t border-stone-100 pt-6 relative z-10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#D32F2F] text-white flex items-center justify-center font-serif text-lg">
                        {review.name.charAt(0)}
                      </div>
                      <span className="uppercase tracking-wider text-sm">
                        {review.name}
                      </span>
                    </div>
                  </div>
                </TiltWrapper>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Dinâmico */}
      <footer
        id="contact"
        className="bg-[#1A1A1A] text-stone-400 py-20 relative overflow-hidden z-10"
      >
        <div
          className="absolute inset-0 opacity-10 bg-noise mix-blend-overlay pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16 border-b border-stone-800 pb-16 mb-12 relative z-10">
          <Reveal>
            <h4 className="text-white font-serif text-2xl mb-8 border-l-4 border-[#D32F2F] pl-4">
              Contact Information
            </h4>
            <div className="space-y-6 text-base">
              <a
                href="tel:2066229669"
                className="flex items-center gap-4 hover:text-white transition-colors group"
              >
                <div className="p-3 bg-stone-800 rounded-full group-hover:bg-[#D32F2F] transition-colors">
                  <Phone size={18} className="text-white" />
                </div>
                Phone: 206-622-9669
              </a>
              <a
                href="mailto:info@lanehardwoodfloors.com"
                className="flex items-center gap-4 hover:text-white transition-colors group"
              >
                <div className="p-3 bg-stone-800 rounded-full group-hover:bg-[#D32F2F] transition-colors">
                  <Mail size={18} className="text-white" />
                </div>
                Emails: info@...
              </a>
              <div className="flex items-start gap-4 mt-6">
                <div className="p-3 bg-stone-800 rounded-full mt-1">
                  <MapPin size={18} className="text-[#D32F2F]" />
                </div>
                <span>
                  Address: 14700 Aurora Ave N Shoreline,
                  <br />
                  Washington 98133-6546
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <h4 className="text-white font-serif text-2xl mb-8 border-l-4 border-[#E67E22] pl-4">
              Business Hours
            </h4>
            <div className="space-y-4 text-base">
              <div className="flex justify-between border-b border-stone-800 pb-4 hover:text-white transition-colors">
                <span>Mon - Fri</span>
                <span className="font-mono">7:00 am - 4:00 pm</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-4 pt-2 hover:text-white transition-colors">
                <span>Sat - Sun</span>
                <span className="text-[#D32F2F] font-bold">Closed</span>
              </div>
              <p className="font-bold text-white mt-8 mb-2 tracking-widest uppercase text-sm bg-stone-800 p-3 rounded text-center">
                Showroom By Appointment Only
              </p>
              <p className="text-xs text-center opacity-60">
                NWFA (National Wood Flooring Association)
              </p>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex gap-4 mb-10">
              <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all cursor-pointer text-white shadow-lg">
                <Facebook size={24} />
              </div>
              <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center hover:bg-[#D32F2F] hover:scale-110 transition-all cursor-pointer text-white font-serif font-bold italic shadow-lg text-xl">
                H
              </div>
            </div>
            <p className="text-sm font-medium text-stone-300 mb-8 leading-relaxed">
              Also accepts: All Major Credit Cards, ACH, Digital Transfers
            </p>

            <div className="bg-stone-900 p-6 border-l-4 border-[#D32F2F] shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-[#D32F2F]/10 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <p className="relative z-10 text-sm">
                For professional residential flooring services, contact us today
                by calling{' '}
                <strong className="text-white text-lg block mt-2">
                  206-622-9669
                </strong>
              </p>
            </div>
          </Reveal>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-xs text-stone-600 flex flex-col md:flex-row justify-between items-center relative z-10">
          <p className="max-w-2xl text-center md:text-left leading-relaxed">
            Content, including images, displayed on this website is protected by
            copyright laws. Downloading, republication, retransmission or
            reproduction of content on this website is strictly prohibited.
          </p>
          <div className="mt-6 md:mt-0 flex gap-6 uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-white transition-colors">
              Terms of Use
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
