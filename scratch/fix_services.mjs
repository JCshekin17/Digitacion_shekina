import fs from 'fs';

const servicesFile = 'src/lib/services.ts';
let content = fs.readFileSync(servicesFile, 'utf8');

const regex = /export const SERVICES: ServiceItem\[\] = \[([\s\S]*?)\]/;
const match = content.match(regex);
const existingServicesStr = match[1];
const itemsMatches = [...existingServicesStr.matchAll(/\{\s*name:\s*['"]([^'"]+)['"]\s*,\s*price:\s*(\d+)\s*,\s*cost:\s*(\d+)(?:\s*,\s*description:\s*`([\s\S]*?)`)?\s*}/g)];

const existingServices = itemsMatches.map(m => ({
  name: m[1],
  price: parseInt(m[2], 10),
  cost: parseInt(m[3], 10),
  description: m[4] || ''
}));

const overrides = {
  '4 ISLAS MARITIMO': `¡Descubre el encanto del Archipiélago de Nuestra Señora del Rosario con nuestro tour marítimo por 4 islas! 🌊☀️
Ideal para quienes desean un tour dinámico lleno de mar, sol y mucha diversión.

✨ Incluye:
🚤 Transporte: Recorrido en lancha rápida deportiva.
🏝️ Tour Panorámico: Visita a 4 de las islas más representativas del archipiélago.
🍽️ Almuerzo Típico: Delicioso plato caribeño frente al mar.
🤿 Snorkeling: Tiempo dedicado para explorar los arrecifes de coral.
👨‍✈️ Guía: Acompañamiento durante el recorrido.

📌 Observaciones Importantes:
• Impuesto portuario no incluido.

⏰ Horario:
8:00 a.m. – 4:00 p.m.`,

  '5 DESTINOS TERRESTRE': `¡Conoce lo mejor de la región en un solo día con nuestro Tour 5 Destinos Terrestre! 🚌🌴
Explora 5 hermosos destinos turísticos por vía terrestre en un cómodo bus climatizado. Un recorrido completo para llevarte los mejores recuerdos.

✨ Incluye:
🚐 Transporte: Bus climatizado ida y regreso.
🏖️ Recorrido: Visita guiada por 5 hermosos destinos.
🍽️ Almuerzo Típico: Deliciosa comida local.
👨‍✈️ Guía Bilingüe: Acompañamiento profesional durante el tour.

📌 Observaciones Importantes:
• Entradas a atracciones específicas pueden no estar incluidas.

⏰ Horario:
7:00 a.m. – 5:00 p.m.`,

  '5 ISLAS BASIC': `¡Aventura económica y divertida por 5 islas del archipiélago! 🏝️🚤
El plan perfecto para aventureros que desean conocer mucho por un precio increíble.

✨ Incluye:
🚤 Transporte Marítimo: Lancha rápida ida y regreso.
🌅 Tour Panorámico: Visita a 5 de las islas más famosas.
🍽️ Almuerzo Típico: Almuerzo tradicional costeño.
🤿 Parada para Snorkeling: Explora la vida marina.

📌 Observaciones Importantes:
• Impuesto portuario no incluido.
• Actividades extra como el oceanario se pagan en el lugar.

⏰ Horario:
8:00 a.m. – 4:00 p.m.`,

  '5 ISLAS OPEN BAR': `¡Vive la mejor fiesta en el mar Caribe con nuestro tour 5 Islas Open Bar! 🍹🎶
Música, sol, playa y barra libre a bordo para que disfrutes al máximo con tus amigos.

✨ Incluye:
🚤 Transporte: Lancha rápida o yate deportivo.
🍹 Barra Libre a Bordo: Disfruta de bebidas y cócteles ilimitados durante el recorrido.
🏝️ Visitas: Recorrido panorámico y paradas en 5 islas icónicas.
🍽️ Almuerzo Típico: Deliciosa comida costeña frente al mar.
🎵 Entretenimiento: Música y ambiente de fiesta.

📌 Observaciones Importantes:
• Sólo para mayores de edad (18+).
• Impuesto de muelle no incluido.

⏰ Horario:
8:30 a.m. – 4:00 p.m.`,

  'ATOLON BEACH CLUB': `¡Un día de lujo en Atolón Beach Club! 🏖️🍹
Pasadía exclusivo con instalaciones de primer nivel, gastronomía excepcional y una playa tranquila para relajarte.

✨ Incluye:
🚤 Transporte: Ida y vuelta en lancha rápida.
🍹 Cóctel de Bienvenida: Bebida refrescante al llegar.
🍽️ Almuerzo: Opciones a la carta para deleitar tu paladar.
🏖️ Instalaciones: Uso de asoleadoras, camas de playa y duchas.
🎵 Ambiente: Música relajante y excelente atención.

📌 Observaciones Importantes:
• No incluye tasa portuaria.

⏰ Horario:
8:00 a.m. – 4:00 p.m.`,

  'AVIARIO + BARU': `¡Conexión total con la naturaleza y el mar! 🦜🌊
Disfruta del majestuoso Aviario Nacional y luego relájate en las cálidas aguas de Barú. Un plan perfecto para toda la familia.

✨ Incluye:
🚐 Transporte: Bus climatizado ida y regreso.
🎫 Entradas: Acceso al Aviario Nacional de Colombia.
🏖️ Playa: Tiempo de relajación en Playa Blanca, Barú.
🍽️ Almuerzo Típico: Delicioso plato caribeño.
👨‍✈️ Guía Acompañante: Asistencia durante todo el recorrido.

📌 Observaciones Importantes:
• No incluye carpas ni parasoles en la playa.

⏰ Horario:
7:00 a.m. – 4:00 p.m.`,

  'BARU + ISLAS DEL ROSARIO TERRESTRE': `¡Lo mejor de dos mundos en un solo tour! 🌴🚌
Un tour combinado espectacular. Recorre en bus hacia Barú y luego toma una lancha hacia las hermosas Islas del Rosario.

✨ Incluye:
🚐 Transporte Terrestre: Bus climatizado hasta la península de Barú.
🚤 Transporte Marítimo: Lancha hacia las Islas del Rosario.
🌅 Tour Panorámico: Recorrido por el archipiélago.
🍽️ Almuerzo Típico: Comida costeña en Barú.
🏖️ Tiempo Libre: Descanso en la playa de aguas cristalinas.

📌 Observaciones Importantes:
• Oceanario no incluido.
• Impuesto portuario no aplica (salida por tierra).

⏰ Horario:
7:00 a.m. – 4:00 p.m.`,

  'BORA BORA BEACH CLUB': `¡Exclusividad y buen ambiente en Bora Bora Beach Club! 🎶🌴
Disfruta de un entorno vibrante, buena música y camas asoleadoras en uno de los clubes de playa más famosos de las Islas del Rosario.

✨ Incluye:
🚤 Transporte: Lancha rápida ida y regreso.
🍹 Cóctel de Bienvenida: Refrescante bebida a tu llegada.
🍽️ Almuerzo Típico: Delicioso plato caribeño.
🏖️ Comodidades: Uso de asoleadora o cama de playa.
🎧 Ambiente: DJ en vivo y el mejor estilo chillout.

📌 Observaciones Importantes:
• Impuesto portuario no incluido.
• Prohibido el ingreso de alimentos y bebidas.

⏰ Horario:
8:00 a.m. – 4:00 p.m.`,

  'BORA BORA BEACH VIP': `¡La experiencia más premium del Caribe en Bora Bora VIP! 💎🍾
Cama balinesa en primera fila, atención VIP y el mejor ambiente chillout del Caribe.

✨ Incluye:
🚤 Transporte: Lancha rápida de lujo.
🍹 Cóctel de Bienvenida: Bebida especial VIP.
🍽️ Almuerzo a la Carta: Exquisita gastronomía con opciones premium.
🏖️ Zona VIP: Cama balinesa en primera fila garantizada.
💁‍♂️ Atención Personalizada: Servicio exclusivo durante toda la estadía.

📌 Observaciones Importantes:
• Impuesto portuario no incluido.
• Exclusivo para adultos o bajo estricta reserva familiar.

⏰ Horario:
8:00 a.m. – 4:00 p.m.`,

  'BUCEO EN BARU': `¡Descubre el mundo submarino del Caribe en Barú! 🤿🐠
Sumérgete en aguas cristalinas y descubre la increíble vida marina del Caribe colombiano con esta experiencia guiada.

✨ Incluye:
🚐 Transporte: Terrestre o marítimo hasta la zona de inmersión.
🤿 Equipamiento: Equipo de buceo completo (traje, tanque, aletas, máscara).
👨‍🏫 Instrucción: Charla técnica e inmersión con instructor certificado (PADI/NAUI).
📸 Fotografías Acuáticas: Recuerdo digital de tu inmersión.
🍽️ Almuerzo Típico: Deliciosa comida local después del buceo.

📌 Observaciones Importantes:
• No se requiere experiencia previa para el "minicurso" o inmersión de descubrimiento.
• No apto para personas con afecciones respiratorias graves o mujeres embarazadas.

⏰ Horario:
7:00 a.m. – 4:00 p.m.`,

  'CATAMARA SAN JUAN': `¡Navega con estilo a bordo del Catamarán San Juan! ⛵🌅
Un divertido pasadía de navegación suave, paradas para bañarse en el mar y barra de bebidas.

✨ Incluye:
⛵ Transporte: Navegación en catamarán espacioso.
🍹 Bebidas: Barra libre de bebidas no alcohólicas (y algunas alcohólicas según la opción).
🏖️ Paradas para Baño: Tiempo para sumergirse en aguas cristalinas.
🍽️ Almuerzo a Bordo: Comida preparada fresca.
🤿 Equipo de Snorkel: Disponible para uso de los pasajeros.

📌 Observaciones Importantes:
• Tasa portuaria no incluida.

⏰ Horario:
8:30 a.m. – 4:30 p.m.`,

  'CITY TOURS BARRANQUILLA/SANTA MARTA': `¡Conoce las joyas del Caribe colombiano en un solo día! 🚌🌆
Excursión completa desde Cartagena para conocer la Puerta de Oro de Colombia (Barranquilla) y la magia de Santa Marta.

✨ Incluye:
🚐 Transporte: Bus climatizado ida y regreso desde Cartagena.
📸 Paradas en Barranquilla: Monumento Ventana al Mundo, Aleta del Tiburón y Malecón del Río.
🏖️ Paradas en Santa Marta: Visita al Rodadero, Quinta de San Pedro Alejandrino (panorámico) y Bahía más hermosa de América.
🍽️ Desayuno y Almuerzo: Alimentación completa incluida.
👨‍✈️ Guía Profesional: Acompañamiento y narración histórica.

📌 Observaciones Importantes:
• El viaje es extenso (aprox 2.5 a 3 horas de trayecto por trayecto).

⏰ Horario:
4:00 a.m. – 9:00 p.m.`,

  'CITY TOURS LITE': `¡Lo indispensable de Cartagena de forma rápida y económica! 🏰📸
El recorrido ideal para conocer la historia y la magia de la ciudad amurallada.

✨ Incluye:
🚐 Transporte: Recorrido en bus o minivan climatizada.
🏰 Castillo de San Felipe: Parada para fotografías (sin ingreso).
🥾 Zapatos Viejos: Visita al emblemático monumento.
🚶‍♂️ Ciudad Amurallada: Caminata guiada por las principales calles y plazas del Centro Histórico.
👨‍✈️ Guía Certificado: Acompañamiento e historia.

📌 Observaciones Importantes:
• No incluye entradas a los monumentos.

⏰ Horario:
2:00 p.m. – 6:00 p.m.`,

  'CITY TOURS PALENQUE': `¡Sumérgete en la cultura afrocolombiana ancestral! 🥁🏿
Visita San Basilio de Palenque, el primer pueblo libre de América, lleno de historia, música y gastronomía ancestral.

✨ Incluye:
🚐 Transporte: Bus climatizado ida y regreso desde Cartagena.
🗣️ Guía Local Palenquero: Narración de la historia de Benkos Biohó.
🎶 Muestra Cultural: Presentación de tambores y danza típica.
🍽️ Almuerzo Tradicional: Gastronomía ancestral palenquera.
📸 Recorrido: Visita a la plaza principal, monumento y encuentro con las palenqueras.

📌 Observaciones Importantes:
• Se recomienda llevar ropa cómoda, protector solar y dinero en efectivo para comprar artesanías y dulces típicos.

⏰ Horario:
8:00 a.m. – 3:00 p.m.`,

  'CITY TOURS PERSONALIZADO X4': `¡Descubre Cartagena a tu propio ritmo! 🚙🏰
Tour diseñado especialmente para grupos pequeños de hasta 4 personas con conductor y guía privado.

✨ Incluye:
🚗 Transporte Privado: Vehículo climatizado exclusivo.
👨‍✈️ Conductor y Guía: Atención 100% personalizada.
📍 Itinerario Flexible: Tú decides dónde ir (Castillo San Felipe, Popa, Centro Histórico, Manga, etc.).
💧 Bebidas: Aguas embotelladas para el grupo.

📌 Observaciones Importantes:
• No incluye el costo de las entradas a los diferentes monumentos.
• Duración máxima de 4 horas.

⏰ Horario:
A convenir por el cliente.`,

  'CITY TOURS PREMIUM GRUPAL': `¡La magia de Cartagena con el mayor confort! 🌟🚌
Descubre la historia de la ciudad heroica con transporte de lujo, guía bilingüe y acceso a los sitios históricos más emblemáticos.

✨ Incluye:
🚐 Transporte Premium: Bus o minivan de lujo climatizado.
🎫 Entradas Incluidas: Ingreso al Castillo de San Felipe y al Convento de la Popa.
🚶‍♂️ Caminata Guiada: Recorrido por el Centro Histórico y Barrio Getsemaní.
🍹 Refrigerio: Hidratación y snack típico local.
👨‍✈️ Guía Bilingüe: Experto en historia y cultura.

📌 Observaciones Importantes:
• Ideal para grupos grandes que buscan un servicio todo incluido.

⏰ Horario:
2:00 p.m. – 6:00 p.m.`,

  'HELICOPTERO CARTAGENA': `¡La experiencia más premium de Cartagena desde el cielo! 🚁☁️
Sobrevuela Cartagena de Indias en un helicóptero privado y captura las mejores vistas de las fortificaciones y el mar.

✨ Incluye:
🚁 Vuelo Privado: Sobrevuelo panorámico de 12 a 15 minutos en helicóptero.
🏙️ Ruta Exclusiva: Vistas del Centro Histórico, Castillo San Felipe, Bahía, Bocagrande y Tierrabomba.
🥂 Brindis VIP: Copa de champaña antes o después del vuelo.
🚐 Traslado: Transporte ida y vuelta al helipuerto.

📌 Observaciones Importantes:
• Capacidad sujeta al peso de los pasajeros y modelo de la aeronave (generalmente hasta 3 o 4 personas).
• No recomendado para personas con vértigo extremo.

⏰ Horario:
Vuelos disponibles entre 9:00 a.m. y 4:30 p.m.`,

  'ISLAS DEL ROSARIO MARITIMO': `¡El clásico y espectacular viaje a las Islas del Rosario! 🚤🌴
Viaje en lancha rápida recorriendo panorámicamente el archipiélago, con opciones de snorkeling y visita al oceanario.

✨ Incluye:
🚤 Transporte: Lancha rápida ida y regreso desde Cartagena.
🌅 Tour Panorámico: Recorrido por las 27 islas del archipiélago.
🏝️ Parada en Isla: Tiempo para disfrutar del mar y la playa.
🍽️ Almuerzo Típico: Plato de pescado frito, arroz con coco, patacones y ensalada.
👨‍✈️ Guía Acompañante: Asistencia en el trayecto.

📌 Observaciones Importantes:
• Entradas al Oceanario y equipo de Snorkeling no incluidos.
• Tasa portuaria (Impuesto de muelle) no incluida.

⏰ Horario:
8:30 a.m. – 4:00 p.m.`,
  
  'MARGARITA BEACH': `¡Un espacio diseñado para el descanso y la tranquilidad familiar! 🏖️🍹
Disfruta de un día de playa clásico con deliciosa comida caribeña en Margarita Beach, Isla Tierra Bomba.

✨ Incluye:
🚤 Transporte: Traslado corto en lancha (10 min).
🍹 Cóctel de Bienvenida: Bebida refrescante.
🍽️ Almuerzo Típico: Opciones deliciosas de comida local.
🏖️ Instalaciones: Uso de carpas, sillas asoleadoras y piscina (si aplica).
🎵 Ambiente Familiar: Ideal para relajarse lejos del bullicio.

📌 Observaciones Importantes:
• No incluye bebidas adicionales.

⏰ Horario:
9:00 a.m. – 4:00 p.m.`,
  
  'NOCHE BLANCA BEQUIA': `¡Una noche mágica navegando por la hermosa bahía de Cartagena! 🚢✨
Código de vestimenta blanco, cena especial, música en vivo y vistas espectaculares de la ciudad iluminada.

✨ Incluye:
🚢 Navegación: Recorrido en la embarcación Bequia por la bahía interna.
👗 Dress Code: Noche de blanco (recomendado).
🍽️ Cena Especial: Menú servido a bordo a tres tiempos.
🍷 Bebidas: Copa de vino para brindar y bebidas no alcohólicas.
🎵 Entretenimiento: Música en vivo y pista de baile.

📌 Observaciones Importantes:
• Tasa portuaria no incluida.
• Ideal para celebraciones románticas y aniversarios.

⏰ Horario:
7:00 p.m. – 10:00 p.m.`,
  
  'PALMARITO BEACH': `¡Pasadía perfecto a pocos minutos de la ciudad! 🏝️👙
Cruza a Isla Tierra Bomba y disfruta de piscinas, acceso a la playa y un gran almuerzo tipo buffet.

✨ Incluye:
🚤 Transporte: Lancha rápida (10-15 minutos).
🍹 Bienvenida: Bebida refrescante.
🍽️ Almuerzo Buffet: Variedad de comida caribeña e internacional.
🏊‍♂️ Instalaciones: Uso de piscinas, asoleadoras, hamacas y playa privada.
🏐 Actividades: Cancha de voleibol y deportes de playa.

📌 Observaciones Importantes:
• Tasa portuaria y bebidas adicionales no incluidas.

⏰ Horario:
9:00 a.m. – 4:00 p.m.`,

  'PALMARITO BEACH VIP': `¡Confort superior y exclusividad en Palmarito Beach VIP! 🥂🌴
Mejora tu experiencia con acceso a zonas exclusivas, bebidas especiales y un confort superior.

✨ Incluye:
🚤 Transporte: Traslado en lancha ida y regreso.
🥂 Bebida Premium: Cóctel o bebida especial de bienvenida.
🍽️ Almuerzo VIP: Menú a la carta con opciones premium.
🏖️ Zona Exclusiva: Acceso a camas balinesas o zona reservada.
🏊‍♂️ Instalaciones: Uso libre de piscinas y playa.
💁‍♀️ Servicio: Atención preferencial y toallas incluidas.

📌 Observaciones Importantes:
• Tasa portuaria no incluida.

⏰ Horario:
9:00 a.m. – 4:00 p.m.`,

  'PAO PAO BEACH CLUB': `¡Siente la buena energía y la exclusividad en Pao Pao Beach Club! 🦩🎵
Dos piscinas, música de DJs, diseño espectacular y el ambiente perfecto para celebrar en las Islas del Rosario.

✨ Incluye:
🚤 Transporte: Lancha rápida deportiva.
🍹 Cóctel de Bienvenida: Bebida de cortesía al llegar.
🍽️ Almuerzo Exquisito: Variedad de platos gourmet caribeños a la carta.
🏖️ Instalaciones: Uso de asoleadoras, acceso al mar y a las piscinas de agua dulce.
🎧 Ambiente: Música electrónica / chillout con DJ residente.

📌 Observaciones Importantes:
• Solo adultos (18+).
• Impuesto de muelle no incluido.
• Camas balinesas pueden requerir consumo mínimo adicional.

⏰ Horario:
8:00 a.m. – 4:00 p.m.`,

  'PASADIA PLAYA BLANCA': `¡Un día de arena blanca y aguas turquesas en Barú! 🚌🏖️
Disfruta de un día completo de mar y sol en la famosa Playa Blanca, con transporte en bus y un tradicional almuerzo costeño.

✨ Incluye:
🚐 Transporte: Bus climatizado ida y regreso desde la ciudad.
🏖️ Tiempo Libre: Disfrute de la hermosa Playa Blanca, Barú.
🍽️ Almuerzo Típico: Pescado, pollo o vegetariano con arroz de coco.
👨‍✈️ Guía Acompañante: Orientación durante el recorrido.

📌 Observaciones Importantes:
• No incluye alquiler de carpas o sillas asoleadoras (se negocian directamente).
• Fuerte presencia de vendedores locales.

⏰ Horario:
7:00 a.m. – 3:30 p.m.`,
  
  'PASADIA PLAYA TRANQUILA': `¡Escápate a un sector exclusivo y más calmado en Barú! 🌴🧘‍♀️
Como su nombre lo indica, es el lugar ideal para relajarse lejos del ruido y las multitudes.

✨ Incluye:
🚐 Transporte Terrestre: Bus climatizado hasta Barú.
🚤 Traslado Marítimo Corto: Lancha hasta el sector de Playa Tranquila.
🍹 Bebida: Refresco de bienvenida.
🏖️ Instalaciones: Uso de sillas asoleadoras y sombrillas en zona privada.
🍽️ Almuerzo Típico: Delicioso plato caribeño.

📌 Observaciones Importantes:
• Sector con mucha menos afluencia de vendedores.

⏰ Horario:
7:00 a.m. – 3:30 p.m.`,

  'PASADIA PUNTA ARENA': `¡Cruza a Tierra Bomba en 10 minutos y disfruta de Punta Arena! 🚤⛱️
Excelente vista de la zona moderna de Cartagena (Bocagrande) mientras descansas en una playa de arena blanca.

✨ Incluye:
🚤 Transporte: Lancha ida y regreso desde Castillogrande o el Hospital de Bocagrande.
🍽️ Almuerzo Típico: Pescado frito o pollo con patacones y arroz.
🏖️ Instalaciones: Uso de sillas y sombrillas básicas.
🎶 Ambiente: Música caribeña y aguas tranquilas.

📌 Observaciones Importantes:
• Ideal para un plan de medio día o de presupuesto ajustado.

⏰ Horario:
Salidas flexibles desde las 9:00 a.m. y retornos hasta las 4:00 p.m.`,
  
  'PLAYA TRANQUILA + OCEANARIO MAR': `¡Combinación perfecta de relax y vida marina! 🐬🏖️
Disfruta de las arenas blancas de Playa Tranquila en Barú y conoce la riqueza marina del Caribe visitando el Oceanario.

✨ Incluye:
🚐 Transporte: Terrestre hasta Barú y marítimo hacia el oceanario.
🎫 Entrada al Oceanario: Show de delfines y tiburones incluido.
🏖️ Descanso: Tiempo libre en Playa Tranquila.
🍽️ Almuerzo Típico: Menú caribeño a elegir.
⛱️ Instalaciones: Uso de sillas en el club de playa.

📌 Observaciones Importantes:
• El traslado entre Barú y el Oceanario se hace en lancha rápida.

⏰ Horario:
7:00 a.m. – 4:00 p.m.`,

  'PLAYA TRANQUILA +MAPACHES + BAJO': `¡Aventura y naturaleza en Playa Tranquila Barú! 🦝🌊
Descansa en la playa, interactúa con adorables mapaches en su hábitat y explora hermosas zonas de bajo para nadar tranquilamente.

✨ Incluye:
🚐 Transporte: Terrestre y marítimo (lancha corta).
🏖️ Ubicación: Sector exclusivo en Playa Tranquila.
🦝 Avistamiento de Mapaches: Interacción guiada y fotos con mapaches en zona de manglares.
🏊‍♂️ Parada en 'El Bajo': Zona de aguas cristalinas poco profundas en medio del mar.
🍽️ Almuerzo Típico: Deliciosa comida costeña.
⛱️ Asoleadoras: Espacio reservado para descansar.

📌 Observaciones Importantes:
• Cuidar de no alimentar a los animales con comida no autorizada por los guías.

⏰ Horario:
7:00 a.m. – 4:00 p.m.`,
  
  'SANTA MARTA PLAYA BLANCA + ACUARIO': `¡Descubre la magia de Santa Marta desde Cartagena! 🚌🐬
Excursión a Santa Marta para visitar su emblemática Playa Blanca y el famoso Acuario El Rodadero.

✨ Incluye:
🚐 Transporte: Intermunicipal climatizado ida y regreso desde Cartagena.
🚤 Lancha al Acuario: Traslado marítimo desde El Rodadero.
🎫 Entradas Incluidas: Ingreso al Acuario para ver delfines, focas y tortugas marinas.
🏖️ Playa Blanca (Santa Marta): Tiempo para relajarse en sus aguas calmadas.
🍽️ Alimentación: Desayuno ligero y Almuerzo típico samario.

📌 Observaciones Importantes:
• Viaje largo de 4 horas por trayecto, se sale de madrugada.

⏰ Horario:
4:00 a.m. – 9:00 p.m.`,
  
  'SUNSET CATAMARÁN FLAMANTE': `¡El mejor atardecer del Caribe lo vives a bordo del Flamante! ⛵🌅
Disfruta del espectacular atardecer cartagenero navegando por la bahía en un lujoso catamarán con bebidas y excelente música.

✨ Incluye:
⛵ Navegación: 2 horas de recorrido por la bahía a bordo de un catamarán de lujo.
🍹 Bebidas: Barra libre (agua, jugos, sodas) o copa de vino de bienvenida.
🎶 Ambiente: Música chillout / DJ en vivo para acompañar el atardecer.
📸 Vistas Panorámicas: El mejor ángulo para ver la ciudad amurallada y Bocagrande al caer el sol.
🍤 Pasabocas: Pequeño snack de cortesía.

📌 Observaciones Importantes:
• Impuesto de muelle no incluido.

⏰ Horario:
5:00 p.m. – 7:00 p.m.`,

  'TOP 3 BORA BORA': `¡La ruta exclusiva por las Islas del Rosario coronada en Bora Bora! 🚤👑
El recorrido definitivo que incluye visita a varias islas y una parada principal en el famoso Bora Bora Beach Club, garantizando lujo y diversión.

✨ Incluye:
🚤 Transporte: Lancha rápida ida y regreso.
🌅 Tour Panorámico: Avistamiento de diferentes islas del archipiélago.
🍹 Cóctel de Bienvenida: Recepción al llegar al Beach Club.
🏖️ Bora Bora Beach Club: Acceso a instalaciones y asoleadoras.
🍽️ Almuerzo Gourmet: Menú exclusivo de alta cocina.
🎧 Fiesta: Animación y DJ en vivo.

📌 Observaciones Importantes:
• Solo adultos.
• Tasa portuaria no incluida.

⏰ Horario:
8:00 a.m. – 4:00 p.m.`,

  'TOP 3 ISLAS PRIVADAS': `¡Un día, tres experiencias de lujo en islas privadas! 🏝️💎
Visita las mejores islas exclusivas del Rosario en lancha rápida, disfrutando de lo mejor de la gastronomía, playas y confort.

✨ Incluye:
🚤 Transporte: Lancha rápida deportiva compartida.
🏝️ Isla 1: Parada en un club de playa para disfrutar del mar y un cóctel de bienvenida.
🏖️ Isla 2: Visita a una segunda isla privada para relajación.
🍽️ Isla 3 (Principal): Parada para el almuerzo a la carta y uso de asoleadoras.
🤿 Snorkel: Equipo básico incluido para realizar inmersiones cortas.

📌 Observaciones Importantes:
• Impuesto portuario no incluido.
• Solo adultos o familias previa consulta.

⏰ Horario:
8:00 a.m. – 4:00 p.m.`,

  'TOUR BAHIA EN BOTE': `¡La belleza de Cartagena desde el mar al atardecer o la noche! 🚤🌉
Relajante recorrido de dos horas navegando por la bahía interna, observando la ciudad moderna y colonial iluminada.

✨ Incluye:
🚤 Transporte: Bote deportivo / lanchón espacioso.
🎶 Entretenimiento: Música crossover a bordo.
🍻 Bebidas: Barra libre de bebidas nacionales (Cuba Libre, jugos).
🏙️ Recorrido: Vistas de Castillogrande, Manga, Centro y Pegasos.

📌 Observaciones Importantes:
• Tasa de embarque no incluida (aprox. $10.000 COP).

⏰ Horario:
Salidas 5:00 p.m. o 7:00 p.m.`,

  'TOURS BAHIA BARCO PIRATA': `¡Aborda el Barco Pirata y vive una aventura mágica por la bahía! 🏴‍☠️⚔️
Diversión familiar asegurada. Navega al atardecer o noche con recreación dirigida y un gran espectáculo corsario.

✨ Incluye:
🚢 Navegación: 2 horas de recorrido a bordo de la réplica del Barco Pirata.
🍹 Bebidas: Refresco o cerveza de bienvenida.
🎭 Espectáculo: Show pirata interactivo, juegos y bailes.
📸 Fotografías: Espacios temáticos para tomarse fotos increíbles.
🎉 Ambiente: Ideal para niños y adultos con espíritu joven.

📌 Observaciones Importantes:
• Tasa portuaria no incluida.
• No incluye cena.

⏰ Horario:
5:00 p.m. o 7:00 p.m.`,

  'TOURS BAHIA BEQUIA EAGLE': `¡Navega la bahía en la emblemática embarcación Bequia Eagle! 🚢🥂
Disfruta de la brisa marina y las luces de la ciudad iluminada con música en vivo y ambiente festivo.

✨ Incluye:
🚢 Transporte: Recorrido panorámico por la bahía interna.
🎶 Entretenimiento: Animador y música crossover a bordo.
🍻 Bebidas: Cóctel de bienvenida o barra libre (según opción).
🏙️ Vistas: Panorámicas de Bocagrande, Manga y la Ciudad Amurallada.

📌 Observaciones Importantes:
• Impuesto portuario no incluido.
• Ambiente familiar y de fiesta.

⏰ Horario:
5:00 p.m. o 7:00 p.m.`,

  'TOURS VOLCAN DEL TOTUMO': `¡Un viaje curativo, divertido y lleno de lodo! 🌋🧖‍♂️
Sumérgete en el famoso lodo terapéutico del cráter del Volcán del Totumo y luego refréscate en la laguna cercana.

✨ Incluye:
🚐 Transporte: Bus climatizado ida y regreso.
🌋 Entrada al Volcán: Acceso al cráter para el baño de lodo.
🌊 Lavado: Acceso a la ciénaga del Totumo para retirarse el lodo.
🍽️ Almuerzo Típico: Pescado, arroz con coco y patacones en Manzanillo del Mar (opcional según el paquete).
👨‍✈️ Guía Acompañante: Asistencia general.

📌 Observaciones Importantes:
• El servicio de masajes, fotos y asistencia para lavarse el lodo que ofrecen los locales no está incluido y requiere propina directa.

⏰ Horario:
8:30 a.m. – 3:00 p.m.`
};

for (const svc of existingServices) {
  // Uppercase names to standardize all of them
  const upperName = svc.name.toUpperCase();
  svc.name = upperName;

  // Use override if exists
  for (const [key, val] of Object.entries(overrides)) {
    if (upperName === key.toUpperCase()) {
      svc.description = val;
    }
  }
}

// Sort alphabetically
existingServices.sort((a, b) => a.name.localeCompare(b.name));

// Rebuild SERVICES string
const newItemsStr = existingServices.map(item => {
  if (item.description) {
    return \`  { name: '\${item.name}', price: \${item.price}, cost: \${item.cost}, description: \\\`\${item.description.replace(/\\`/g, "\\\\`")}\\\` }\`;
  }
  return \`  { name: '\${item.name}', price: \${item.price}, cost: \${item.cost} }\`;
}).join(',\\n');

const newServicesContent = content.replace(regex, \`export const SERVICES: ServiceItem[] = [\\n\${newItemsStr}\\n]\`);

fs.writeFileSync(servicesFile, newServicesContent);
console.log('Update completed!');
