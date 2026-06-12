import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { MapPin, CalendarDays, Car, Tent, ArrowRight, Phone, Globe } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/landing/caption (1).jpg" 
          alt="Cartagena Tour"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#110E3C]/90 to-[#110E3C]/40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 max-w-2xl leading-tight">
            Descubre Cartagena con <span className="text-[#088DCF]">Shekina Tours</span>
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-8 italic opacity-90 border-l-4 border-[#088DCF] pl-4">
            "Viaja sin límites"
          </p>
          <Link 
            href="/catalog"
            className="inline-flex items-center gap-2 bg-[#088DCF] hover:bg-[#077BBA] text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-[#088DCF]/20"
          >
            Ver Catálogo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Nuestros Servicios */}
      <section className="py-24 bg-[#f4f6fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#110E3C] mb-4">Nuestros Servicios</h2>
            <div className="w-24 h-1 bg-[#088DCF] mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard 
              icon={<MapPin className="w-8 h-8 text-[#088DCF]" />}
              title="Operación de Servicios"
              description="Gestión integral y promoción de servicios turísticos en la ciudad."
            />
            <ServiceCard 
              icon={<CalendarDays className="w-8 h-8 text-[#088DCF]" />}
              title="Creación de Agendas"
              description="Organización y diseño de agendas turísticas hechas a medida."
            />
            <ServiceCard 
              icon={<Car className="w-8 h-8 text-[#088DCF]" />}
              title="Transporte Personalizado"
              description="Movilidad segura y transfers directos al aeropuerto de manera exclusiva."
            />
            <ServiceCard 
              icon={<Tent className="w-8 h-8 text-[#088DCF]" />}
              title="Producción de Eventos"
              description="Diseño, planificación y logística para todo tipo de actividades y eventos."
            />
          </div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-[#110E3C]">Nuestra Identidad</h2>
              <div className="w-16 h-1 bg-[#088DCF] rounded-full" />
              
              <p className="text-lg text-slate-600 leading-relaxed">
                En <strong>Shekina Tours y Logística</strong> somos un equipo apasionado por el turismo y la logística, comprometido con ofrecer experiencias memorables y servicios de alta calidad. 
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Nuestra misión es conectar a los viajeros con los destinos más fascinantes de Cartagena, brindando soluciones personalizadas que se ajusten a las necesidades y expectativas de cada cliente.
              </p>
              
              <div className="bg-[#088DCF]/10 border-l-4 border-[#088DCF] p-4 mt-6 rounded-r-lg">
                <p className="text-[#110E3C] font-medium">
                  Contamos con más de 3 años de experiencia en la venta y promoción de servicios turísticos, garantizando organización, puntualidad y excelencia en cada proyecto.
                </p>
              </div>
            </div>

            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl order-1 lg:order-2">
              <Image
                src="/landing/22.png"
                alt="Identidad Shekina"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Galería de Imágenes Secundarias */}
      <section className="py-12 bg-[#110E3C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-white/10 group">
                <Image src="/landing/image (2).png" alt="Shekina Experience 1" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-white/10 group">
                <Image src="/landing/image (3).png" alt="Shekina Experience 2" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
           </div>
        </div>
      </section>

      {/* Footer Contact */}
      <footer className="bg-[#0c0a2a] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            
            <div className="flex flex-col items-center md:items-start">
              <Image 
                src="/shekina-logo.png" 
                alt="Shekina Logo" 
                width={160} 
                height={64} 
                className="mb-6 brightness-0 invert opacity-90"
              />
              <p className="text-slate-400 max-w-sm">
                Tu mejor aliado para vivir la magia de Cartagena. Experiencias turísticas y logísticas de primer nivel.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start space-y-4">
              <h3 className="text-xl font-bold mb-2">Contáctanos</h3>
              <a href="https://wa.me/573142949239" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-[#088DCF] transition-colors">
                <Phone className="w-5 h-5" />
                +57 314 294 9239
              </a>
              <a href="https://wa.me/573173906045" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-[#088DCF] transition-colors">
                <Phone className="w-5 h-5" />
                +57 317 390 6045
              </a>
            </div>

            <div className="flex flex-col items-center md:items-start space-y-4">
              <h3 className="text-xl font-bold mb-2">Redes y Web</h3>
              <a href="https://instagram.com/shekinatoursylogistica" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-[#088DCF] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                @shekinatoursylogistica
              </a>
              <a href="https://www.shekinatoursylogistica.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-[#088DCF] transition-colors">
                <Globe className="w-5 h-5" />
                www.shekinatoursylogistica.com
              </a>
            </div>
            
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Shekina Tours y Logística. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-2">
      <div className="bg-[#088DCF]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#110E3C] mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}
