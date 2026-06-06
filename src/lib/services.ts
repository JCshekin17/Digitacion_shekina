export interface ServiceItem {
  name: string
  price: number
  cost: number
  description?: string
}

// Normaliza nombre para comparación: sin tildes, minúsculas, espacios simples
export function normalizeServiceName(s: string): string {
  return (s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos/tildes
    .replace(/\s+/g, ' ')            // colapsa espacios múltiples
}

export const SERVICES: ServiceItem[] = [
  { name: '4 ISLAS MARITIMO', price: 220000, cost: 150000, description: `Recorrido en lancha rápida visitando 4 de las islas más representativas del archipiélago de Nuestra Señora del Rosario. Ideal para quienes desean un tour dinámico lleno de mar, sol y snorkeling.`  },
  { name: '5 DESTINOS TERRESTRE', price: 250000, cost: 180000, description: `Explora 5 hermosos destinos turísticos por vía terrestre en un cómodo bus climatizado. Un recorrido completo para conocer lo mejor de la región.`  },
  { name: '5 ISLAS BASIC', price: 270000, cost: 210000, description: `Tour económico y divertido por 5 islas del archipiélago. Incluye transporte marítimo y almuerzo típico. ¡Perfecto para aventureros!`  },
  { name: '5 islas full day marítimo', price: 280000, cost: 196000, description: `¡Explora lo mejor de las Islas del Rosario en un solo día!
Este tour está diseñado para quienes quieren vivir una experiencia inolvidable, llena de paisajes espectaculares, playas privadas, actividades acuáticas y momentos únicos en el mar.
Durante este increíble recorrido disfrutarás de islas paradisíacas, snorkeling, visita a lugares icónicos y el mágico avistamiento del plancton bioluminiscente al caer la noche.
¡Un día perfecto para compartir con amigos, familia o pareja!
🌟 Incluye:
🚌 Recogida en bus climatizado por la zona hotelera o punto acordado
🚤 Salida desde muelle asignado
🏰 Panorámico Fuerte de Bocachica
🏝️ Panorámico Islas del Rosario
🌅 Isla privada Kokomo (50 min)
🤿 Snorkeling o acuario (30 min)*
✈️ Avistamiento de avioneta de Pablo Escobar en Isla Naval
🏝️ Visita a Isla Cholón (50 min)
Cóctel de mariscos
Bohío compartido
🏖️ Playa Tranquila
Almuerzo típico
Uso de instalaciones
✨ Snack + Avistamiento del plancton bioluminiscente (25 min)
🚌 Retorno a Cartagena en bus climatizado
🕒 Horario del tour:
7:00 a.m. – 8:00 p.m.
⚠️ Observaciones importantes:
La visita al acuario no está incluida (valor: $40.000 COP).
Quienes deseen ir al acuario deben informar al guía en el bus.
La actividad de snorkeling dura 50 minutos; si asistes al acuario, pierdes el snorkel.` },
  { name: '5 ISLAS OPEN BAR', price: 380000, cost: 300000, description: `Vive la fiesta en el mar con nuestro recorrido por 5 islas, que incluye barra libre a bordo para que disfrutes al máximo con tus amigos.`  },
  { name: '5 ISLAS PREMIUM OPEN  BAR', price: 380000, cost: 266000, description: `¡Vive la aventura náutica más completa en Cartagena!
Disfruta un recorrido inolvidable por las aguas cristalinas del Caribe, explorando las Islas del Rosario y lugares icónicos como Cholon y Barú. Sumérgete en arrecifes coralinos, descubre la avioneta sumergida y relájate en playas paradisíacas. Todo esto acompañado de guía bilingüe, comodidad y diversión a bordo. ¡Ideal para celebrar momentos únicos como cumpleaños o pedidas de mano!
Incluye:
🗣️ Guía orientador en inglés y español
🏨 Recogida en hotel desde las 7:30 a.m. (zonas: Boquilla, Crespo, Marbella, Bocagrande, Laguito, Castillo Grande, Manga)
⏰ Zarpe 9:00 a.m. desde marina privada
🚤 Bote deportivo
🏰 Vista panorámica de las Fortalezas de Bocachica (Isla Tierra Bomba)
🏝️ Vista panorámica de las 28 Islas del Rosario
🤿 Snorkeling en arrecifes coralinos
🤿 Snorkeling en la avioneta sumergida
🏝️ Parada en Isla Cholon
🏝️ Parada en Isla Agua Azul
🏝️ 🍛 Parada en Playa Tranquila (Isla Barú) con almuerzo incluido
🎉 Decoración especial para cumpleaños y pedidas de mano 💍
🛥️ Retorno 4:00 p.m. al muelle Bodeguita (no incluye retorno al hotel)
Incluye impuesto de muelle
OPEN BAR a bordo: cervezas, gaseosas y agua (hasta agotar existencia)` },
  { name: '5 ISLAS VIP + PLANTON', price: 380000, cost: 300000, description: `Experiencia premium por 5 islas con comodidades VIP, y un cierre mágico al atardecer observando el plancton bioluminiscente.`  },
  { name: 'ATARDECER EN CATAMARAN SAN JUAN', price: 180000, cost: 125999, description: `Incluye:
2 horas de recorrido por la bahía interna de Cartagena.
2 bebidas por persona de bienvenida (botella de agua, gaseosa o cerveza).
Pasabocas (mini fritos típicos).
Barra libre en cócteles con y sin alcohol.
DJ en vivo + animación.
Ingreso a discoteca (preguntar directamente con el personal del barco).
Salidas: martes a domingos.
Encuentro: 5:00 pm – Muelle de la Bodeguita puerta N°4.
Zarpe: 5:30 pm | Regreso: 7:30 pm.
No incluye: tasa portuaria 18.000 COP por persona (sujeto a cambios por Corpoturismo) y debe pagarse en efectivo.` },
  { name: 'ATOLON BEACH CLUB', price: 350000, cost: 300000, description: `Pasadía exclusivo en Atolón Beach Club. Disfruta de instalaciones de primer nivel, gastronomía excepcional y una playa tranquila para relajarte.`  },
  { name: 'AVIARIO + BARU', price: 160000, cost: 90000, description: `Conéctate con la naturaleza visitando el majestuoso Aviario Nacional, y luego relájate en las cálidas aguas de Barú. Un plan perfecto para toda la familia.`  },
  { name: 'BARU + ISLAS DEL ROSARIO TERRESTRE', price: 180000, cost: 110000, description: `Un tour combinado espectacular. Recorre en bus hacia Barú y luego toma una lancha hacia las hermosas Islas del Rosario.`  },
  { name: 'BORA BORA BEACH CLUB', price: 390000, cost: 310000, description: `Disfruta de un ambiente vibrante, buena música y camas asoleadoras en uno de los clubes de playa más famosos de las Islas del Rosario.`  },
  { name: 'BORA BORA BEACH VIP', price: 490000, cost: 420000, description: `La experiencia más exclusiva en Bora Bora Beach Club. Cama balinesa en primera fila, atención VIP y el mejor ambiente chillout del Caribe.`  },
  { name: 'BUCEO EN BARU', price: 330000, cost: 250000, description: `Sumérgete en las aguas cristalinas de Barú y descubre la increíble vida marina del Caribe colombiano con esta experiencia de buceo guiada.`  },
  { name: 'CATAMARA SAN JUAN', price: 180000, cost: 120000, description: `Un divertido pasadía a bordo del Catamarán San Juan. Navegación suave, paradas para bañarse en el mar y barra de bebidas.`  },
  { name: 'CHIVA RUMBERA', price: 50000, cost: 30000, description: `¡Embárcate en una experiencia inolvidable a bordo de la Chiva Rumbera!
Descubre la magia nocturna de Cartagena mientras recorres sus lugares más emblemáticos en un ambiente lleno de música, alegría y diversión. Vive la tradición de la chiva con un toque moderno: DJ y animador a bordo para que la fiesta nunca pare.
Horarios:
🕖 07:00 pm – 09:00 pm
Paradas:
Botas Viejas
Castillo de San Felipe
Letras de Cartagena
🕘 09:15 pm – 11:00 pm
Paradas:
Botas Viejas
Letras de Cartagena
Incluye:
🚌 Recorrido por Bocagrande, Torre del Reloj, Muelle de los Pegasos, Centro de Convenciones y Calle del Arsenal
🏰 Recorrido panorámico por las murallas de Cartagena
🎶 Animador/DJ a bordo con música para ambientar el recorrido
📸 Paradas de 10 minutos para tomar fotografías
🚏 Recogida en puntos de encuentro autorizados
🎉 Finaliza en una discoteca (opcional) o en los mismos puntos de recogida
Importante:
No incluye bebidas ni comida (puedes llevar las tuyas)
Comunícate por WhatsApp para confirmar el punto de encuentro más cercano según tu hotel
¡Una experiencia única para vivir la esencia festiva de Cartagena! 🌟` },
  { name: 'City Tour Personalizado en Cartagena', price: 280000, cost: 196000, description: `¡Descubre la historia y el encanto de Cartagena con la comodidad que mereces!
Este recorrido está diseñado para grupos pequeños de hasta 4 personas, ideal para familias o amigos que buscan flexibilidad y atención exclusiva. Explora los lugares más emblemáticos y añade los sitios que desees visitar, todo en transporte climatizado tipo Uber o taxi driver.
✨ Incluye:
✅ Recorrido panorámico por:
Castillo San Felipe de Barajas (no incluye ingreso)
Convento de la Popa
Barrio Getsemaní
Torre del Reloj
Fuerte San Sebastián en Manga
Museo de la Esmeralda
✅ Opción de visitar otros sitios a elección
✅ Duración: 3 horas
✅ Transporte climatizado tipo Uber o taxi driver
✅ Botella de agua por persona
✅ Aplica para grupos de máximo 4 personas
📌 Ideal para:
Familias
Grupos de amigos
Viajeros que buscan un recorrido exclusivo y flexible` },
  { name: 'CITY TOURS BARRANQUILLA/SANTA MARTA', price: 280000, cost: 210000, description: `Excursión completa desde Cartagena para conocer la Puerta de Oro de Colombia (Barranquilla) y la magia de Santa Marta en un solo día.`  },
  { name: 'CITY TOURS CARTAGENA EN CHIVA', price: 90000, cost: 62999, description: `¡Descubre Cartagena como nunca antes!
Embárcate en nuestro City Tour en Chiva Turística, el transporte típico y colorido que te conecta con la esencia caribeña. Vive una experiencia única con:
📸 Paradas fotográficas en la Bahía, las Botas Viejas y las icónicas letras de Cartagena.
🏰 Visita al imponente Castillo de San Felipe y la histórica Iglesia San Pedro Claver.
👣 Caminata guiada por el Centro Histórico.
Horarios flexibles: 9:00 a.m. - 1:00 p.m. | 2:00 p.m. - 6:00 p.m.
¡Reserva ahora y siente la magia de Cartagena! 🌴✨` },
  { name: 'CITY TOURS LITE', price: 90000, cost: 60000, description: `El recorrido ideal para conocer lo indispensable de Cartagena de forma rápida y económica: Castillo de San Felipe, Zapatos Viejos y Ciudad Amurallada.`  },
  { name: 'CITY TOURS PALENQUE', price: 345000, cost: 300000, description: `Sumérgete en la cultura afrocolombiana visitando San Basilio de Palenque, el primer pueblo libre de América, lleno de historia, música y gastronomía ancestral.`  },
  { name: 'CITY TOURS PERSONALIZADO X4', price: 280000, cost: 200000, description: `Recorre Cartagena a tu propio ritmo con un conductor y guía privado. Tour diseñado especialmente para grupos pequeños de hasta 4 personas.`  },
  { name: 'CITY TOURS PREMIUM GRUPAL', price: 1100000, cost: 950000, description: `Descubre la magia de Cartagena con el mayor confort. Transporte de lujo, guía bilingüe y acceso a los sitios históricos más emblemáticos.`  },
  { name: 'Day Pass Catamarán Bona Vida islas del rosario', price: 430000, cost: 301000, description: `Pasadía a islas del rosario en Catamarán Bonavida:⚓🛥️💙
Embárcate en una experiencia inolvidable desde las 8:00 A.M. (debes presentarte con anticipación) hasta las 4:00 P.M., navegando en un catamarán desde Cartagena hacia las Islas del Rosario. Disfruta de dos paradas, una frente a Isla Grande y otra en Punta Gigante, donde podrás sumergirte en las aguas cristalinas para explorar la vida marina con el equipo de snorkel proporcionado. A bordo, deleita tu paladar con un surtido de snacks, que incluyen empanaditas, quibbe y deditos de queso, mientras disfrutas de la barra libre de bebidas no alcohólicas que ofrece agua, gaseosas, limonada natural y jugo de temporada. Para el almuerzo, tienes la opción de saborear un delicioso arroz con mariscos o arroz con vegetales.
Mientras te relajas en el catamarán, puedes adquirir (comprar) bebidas alcohólicas adicionales y deleitarte con las vistas panorámicas del Caribe colombiano. Esta experiencia te permite disfrutar de la belleza natural de las Islas del Rosario, explorar sus aguas cristalinas y relajarte en un entorno paradisíaco, todo ello mientras disfrutas de la comodidad y los servicios ofrecidos a bordo del catamarán.
Detalles de la actividad:
Embarque: 8:00 A.M. en el Muelle la Bodeguita
Zarpe: 8:30 A.m y Desembarque: 04:00 P.m
El recorrido es hacia Isla Grande y hacia Punta Gigante
· Cóctel de bienvenida
· Bebidas no alcohólicas
· Aperitivo y almuerzo (arroz de marisco, o de pollo o vegetariano) a bordo
· Snorkeling, mascara y tubo gratuito.
· Tasa de embarque (18.000 COP)
· Tasa entrada al PNN Islas del Rosario (13.500 COP)
Nota: está prohibido el ingreso de alimentos o bebidas` },
  { name: 'DAYPASS PLAYA BLANCA BARU', price: 100000, cost: 70000, description: `Disfruta un día espectacular en Playa Blanca Barú, una de las playas más hermosas del Caribe colombiano, famosa por su arena blanca, aguas cristalinas y ambiente tropical perfecto para desconectarte y relajarte. Este tour incluye transporte cómodo, gastronomía caribeña y acompañamiento profesional durante toda la experiencia.
✨ Incluye:
🚌 Recogida en hotel
Sectores: Bocagrande, Castillo Grande, Laguito, Boquilla, Crespo, Marbella o punto acordado.
🚐 Transporte ida y vuelta en bus climatizado
Hasta Barú – Playa Blanca.
🍽️ Almuerzo típico caribeño – 4 opciones:
Pollo
Pescado
Cerdo
Vegetariano
Guía turístico acompañante
Día libre para disfrutar del mar, playa y fotografía.
⏰ Horario:
7:00 a.m. – 3:00 p.m.
No incluye: carpas y parasoles` },
  { name: 'ETEKA BEACH CLUB', price: 300000, cost: 260000, description: `¡Escápate a la tranquilidad del paraíso!
A solo 10 minutos en lancha desde Cartagena, disfruta un día lleno de relax y diversión en un entorno natural y exclusivo. Perfecto para quienes buscan desconectarse y recargar energía frente al mar, con música chillout y gastronomía deliciosa.
Incluye:
🚤 Transporte en lancha (ida y regreso)
🍹 Cóctel de bienvenida
🥤 Bebida no alcohólica para acompañar el almuerzo
🏖️ Acceso a 2 playas y piscina
🍽️ Almuerzo de 2 tiempos (plato fuerte y postre) con opciones variadas
🎶 DJ en vivo los sábados y diferentes ambientes musicales (Chillout y Crossover)
🛏️ 1 toalla por persona` },
  { name: 'HELICOPTERO CARTAGENA', price: 420000, cost: 350000, description: `La experiencia más premium. Sobrevuela Cartagena de Indias en un helicóptero privado y captura las mejores vistas de las fortificaciones y el mar.`  },
  { name: 'IBBIZA BEACH', price: 370000, cost: 300000, description: `Día de sol y playa con un estilo único. Instalaciones modernas, excelente música y la mejor energía frente al mar.`  },
  { name: 'ISLA PALMA', price: 495000, cost: 420000, description: `Recogida: Bocagrande, Laguito, Castillo Grande y Marbella desde las 5:30 a.m.
📍 Punto de encuentro: Muelle La Bodeguita, puerta #2 (5:45 a.m.)
✅ El servicio incluye:
Guía profesional durante el recorrido
Traslado desde el hotel hasta el muelle
Snack de frutas antes del embarque
Navegación panorámica por Islas del Rosario y Archipiélago de San Bernardo
Acceso exclusivo al Hotel Isla Palma (Reserva Natural)
Coctel de bienvenida
Almuerzo gourmet: proteína a elección (carne, pollo o pescado), acompañantes, barra de ensaladas, jugo y postre típico
Tiempo libre en playa de arena blanca y aguas cristalinas (ideal para snorkeling – traer kit personal)
Visita opcional al BioParque (costo adicional $20.000 COP) con recorrido educativo sobre fauna y flora local
🔙 Retorno a Cartagena:
Salida del hotel: 2:00 p.m. – 2:30 p.m.
Llegada aproximada: 4:30 p.m. – 5:00 p.m.
⚠️ No incluye:
Tasa portuaria: $37.000 COP por persona
📌 Recomendaciones y condiciones:
Usar ropa cómoda, protector solar y calzado adecuado
Reserva con 50% de anticipo
Cancelaciones con mínimo 24 h de anticipación (70% devolución)
Niños de 3 a 6 años tarifa especial; mayores de 7 años tarifa completa
Prohibido ingreso de alimentos, bebidas y equipos de sonido
Servicio sujeto a condiciones climáticas y disposiciones marítimas` },
  { name: 'ISLABELA BEACH', price: 420000, cost: 360000, description: `Pasadía de descanso total en Islabela. Una playa paradisíaca en las Islas del Rosario donde podrás disfrutar de un mar turquesa y un almuerzo espectacular.`  },
  { name: 'ISLAS DEL ROSARIO + PLAYA BLANCA BARU MARITIMO', price: 170000, cost: 118999, description: `INCLUYE
✔️Guía acompañante.🚶🏽♂️
✔️ Recogida al hotel 🏨; sector (Bocagrande, laguito y castillo)🚌; en caso de estar fuera estos límites deben llegar al muelle la bodeguita.
✔️Recorrido en lancha🚤
✔️ Visita isla San Martín de Pajarales instalaciones del oceanario. Opcional/adicional actividad del Oceanario🐬 o Actividad snorkeling 🤿
✔️ 🏝️Visita isla  Baru-playa blanca.
✔️Almuerzo: Opción pollo, pescado o vegetariano; acompañado con arroz con coco, patacones, ensalada y una limonada.
 NO INCLUYE
❌Impuesto Turístico
❌ *Actividad Opcionales/ Adicional*
✓Actividad de Snorkeling 🤿
Por personas $50.000
✓Oceanario🐬
Adulto $40.000
Niñ@s $30.000, de 2 a 10años
❌Retorno al hotel 🏨
NOTA: Todos niñ@ desde los 2 años debe ir pagando porque es contado por capitanía de puerto como una vida y por seguridad de usted como visitante y de nosotros como agencia. Además si el niñ@ mide un metro debe pagar el impuesto turístico` },
  { name: 'ISLAS DEL ROSARIO FULL ADVENTURE', price: 270000, cost: 190000, description: `Tour Islas del Rosario - Full Adventure 🌴☀️
¡Vive un día inolvidable en el paraíso! Disfruta de una experiencia completa explorando la belleza de Cartagena y sus islas.
El plan incluye:
• 🚐 Transporte: Recogida en la zona hotelera.
• 🏝️ Destinos: Visita a Isla Barú (Playa Blanca) y recorrido panorámico por las Islas del Rosario.
• 🐬 Oceanario: Entrada incluida (estancia de 1h 30min).
• 🤿 Snorkel: Explora los arrecifes de coral y peces de colores (incluye fotos acuáticas).
• 🦝 Naturaleza: Avistamiento de mapaches (incluye fotos).
• 🍽️ Almuerzo: Deliciosa comida en Playa Blanca con mesa reservada en 2do piso y vista al mar.
Horario: 07:00 A.M. – 04:30 P.M.` },
  { name: 'ISLAS DEL ROSARIO MARITIMO', price: 160000, cost: 120000, description: `Clásico viaje en lancha rápida recorriendo panorámicamente el archipiélago de las Islas del Rosario, con opciones de snorkeling y visita al oceanario.`  },
  { name: 'LUXURY AMBIENTE VIP', price: 490000, cost: 410000, description: `Vive un día exclusivo en el paraíso con servicio premium, comodidad total y un ambiente vibrante frente al mar.
💠 INCLUYE:
🚤 Transporte ida y vuelta en lancha TRITÓN
Viaje cómodo, seguro y directo hacia las hermosas Islas del Rosario.
🍷 Copa de vino de bienvenida
Perfecta para arrancar tu experiencia VIP.
🍹 Barra Abierta Ilimitada – Bebida Nacional
Disfruta durante todo el día:
Shot de licor seleccionado
Coctelería premium: Piña Colada, Coco Loco, Tequila Sunrise, Caipiriña, Daiquirí (cóctel & mocktail), Margarita, Cuba Libre, Mojito (cóctel & mocktail)
Cerveza del día
Agua y gaseosa embotellada
Dispensador de jugo de naranja
Café ☕️
🛏️ Servicio DIRECTO a la cama y en la barra
Atención personalizada para que no tengas que levantarte de tu zona de confort.
🎧 DJ en vivo todos los días
Ambiente musical para mayores de 10 años.
🍽️ 10 Opciones de almuerzo a la carta
Variedad para todos los gustos.
🏖️ Cama de playa (por pareja)
Importante: Si reservas solo, se asigna una asoleadora.
🚿 Ducha de agua dulce en la playa
Recuerda llevar tu toalla.
⚓ OPCIONAL:
Tour panorámico Islas del Rosario o traslado al Oceanario (60 min)
▪️ Entrada al Oceanario no incluida.`  },
  { name: 'LUXURY BEACH', price: 430000, cost: 370000, description: `NCLUYE:
🚤 Transporte en Lancha TRITÓN (ida y vuelta)
Salida desde el muelle y viaje cómodo y seguro hacia uno de los paraísos más hermosos del Caribe.
🍹 Barra Abierta Ilimitada – Bebida Nacional
Disfruta sin límites durante toda tu estadía:
Margaritas tradicionales
Cuba Libre
Mojitos (cóctel y versión sin licor)
Cerveza del día
Agua y gaseosa embotellada
Dispensador de jugo de naranja
🍽️ 4 Opciones de Almuerzo a Elegir
Preparadas al momento:
Filete de pesca a la plancha
Pollo a la plancha
Arroz de mariscos
Arroz con vegetales
🏖️ Comodidad en la Playa
Parasol y asoleadora playera individuales
Acceso a zonas exclusivas
Servicio directo en la barra
🚿 Ducha de Agua Dulce
Ideal para refrescarte después del mar (lleva tu toalla).
⚓ Opcional:
Tour panorámico por Islas del Rosario o traslado al Oceanario
Duración: 60 minutos` },
  { name: 'MANGATA BEACH', price: 420000, cost: 360000, description: `Vive un día inolvidable en Mangata Beach. Arena blanca, mar cristalino y una propuesta gastronómica exquisita para disfrutar al máximo.`  },
  { name: 'MANTAS BEACH', price: 400000, cost: 330000, description: `Disfruta un día exclusivo en Mantas Beach, ubicado en la paradisíaca Isla Grande, con playa de arena blanca y aguas cristalinas. Este plan está diseñado para quienes buscan confort, diversión y un ambiente premium frente al mar.
✨ Incluye:
🚤 Transporte en lancha rápida ida y vuelta
🥂 Copa de champaña o limonada de bienvenida
🍽️ Almuerzo a la carta (8 opciones con bebida)
🛌 Asoleadora (costo adicional primera fila)
🏄 Actividades acuáticas: Paddleboards y kayaks
🚿 Duchas de agua dulce
🐠 Traslado al Oceanario
🏖️ Áreas comunes:
Baños
Comedores
Zona de playa
Restaurante en segundo piso
Muelle privado
Beach bar
🎶 DJ’s en vivo todos los días
🍹 Promociones:
2x1 en cócteles seleccionados
6x5 en cervezas
⏰ Horario:
Salida: 7:30 a.m. desde Muelle Todomar
Regreso aproximado: 4:00 p.m.
📌 No incluye: tarifa administrativa, entrada al Oceanario, servicio de toallas ni actividades adicionales.` },
  { name: 'MARGARITA BEACH', price: 180000, cost: 130000, description: `Un espacio diseñado para el descanso y la tranquilidad familiar. Disfruta de un día de playa clásico con deliciosa comida caribeña.`  },
  { name: 'NOCHE BLANCA BEQUIA', price: 300000, cost: 240000, description: `Una noche mágica navegando por la bahía. Código de vestimenta blanco, cena especial, música en vivo y vistas espectaculares de Cartagena iluminada.`  },
  { name: 'PALMARITO BEACH', price: 260000, cost: 200000, description: `Pasadía perfecto a pocos minutos de la ciudad. Disfruta de sus piscinas, acceso a la playa y un gran almuerzo tipo buffet.`  },
  { name: 'PALMARITO BEACH VIP', price: 340000, cost: 280000, description: `Mejora tu experiencia en Palmarito con acceso a zonas exclusivas, bebidas especiales y un confort superior.`  },
  { name: 'PAO PAO BEACH CLUB', price: 390000, cost: 310000, description: `Siente la buena energía en Pao Pao Beach Club. Dos piscinas, música de DJs, diseño espectacular y el ambiente perfecto para celebrar.`  },
  { name: 'Pasadía IBBIZA Island Beach Club', price: 370000, cost: 258999, description: `¡Haz una pausa y regálate un día de lujo en IBBIZA Island Beach Club!
Sumérgete en un ambiente exclusivo donde el confort, la buena vibra y la belleza natural del Caribe se combinan para ofrecerte una experiencia verdaderamente inolvidable.
Relájate en camas balinesas frente al mar, disfruta de gastronomía exquisita y déjate envolver por los sonidos del océano mientras te desconectas del ritmo de la ciudad. Ya sea que quieras descansar, celebrar o pasar un día especial con amigos, IBBIZA es el lugar perfecto.
🌟 ¿Qué disfrutarás en tu Pasadía?
✨ Acceso a instalaciones exclusivas del beach club
✨ Zona de playa con camas y sillas asoleadoras
✨ Piscina con vista al mar
✨ Cóctel de bienvenida
✨ Almuerzo tipo gourmet según menú del día
✨ Música ambiente y atmósfera relajada
✨ Atención personalizada durante toda tu estadía
📌 Perfecto para:
Parejas que buscan un día romántico
Viajeros que quieren conocer un beach club de lujo
Amigos que desean un día de disfrute y buena vibra
Vive la experiencia IBBIZA: elegancia, mar y desconexión en un solo lugar.
Reserva ahora y asegura tu día en este rincón paradisíaco. 🌴🍹🔥` },
  { name: 'PASADIA PLAYA BLANCA', price: 100000, cost: 60000, description: `Disfruta de un día completo de mar y sol en la famosa Playa Blanca, con transporte en bus y un tradicional almuerzo costeño.`  },
  { name: 'PASADIA PLAYA TRANQUILA', price: 170000, cost: 95000, description: `Escápate a Playa Tranquila en Barú. Como su nombre lo indica, es el lugar ideal para relajarse lejos del ruido y las multitudes.`  },
  { name: 'PASADIA PUNTA ARENA', price: 80000, cost: 50000, description: `Cruza a Tierra Bomba en 10 minutos y disfruta de Punta Arena. Excelente vista de la zona moderna de Cartagena mientras descansas en la playa.`  },
  { name: 'PAUE BEACH', price: 470000, cost: 380000, description: `¡Vive un día de ensueño en las Islas del Rosario! 🌴✨
Escápate a un paraíso natural y disfruta de una experiencia única frente al mar. Relájate en playas de arena blanca, saborea un almuerzo típico y diviértete con actividades acuáticas en un entorno exclusivo. Todo con transporte seguro y atención personalizada para que tu día sea inolvidable.
Incluye:
✅ Transporte marítimo ida y regreso
✅ Cóctel de bienvenida
✅ Almuerzo típico con opciones deliciosas
✅ Acceso a instalaciones y zonas de descanso
✅ Actividades como kayak, paddle board y beach tennis
✅ Botella de agua por persona
📌 Ideal para:
Familias
Parejas
Amigos que buscan desconectarse y disfrutar la magia del Caribe
¡Reserva ahora y vive la experiencia que estabas esperando! 🌊🍹` },
  { name: 'PLAYA TRANQUILA + OCEANARIO MAR', price: 200000, cost: 160000, description: `Disfruta de las arenas blancas de Playa Tranquila y conoce la riqueza marina del Caribe visitando el Oceanario en las Islas del Rosario.`  },
  { name: 'PLAYA TRANQUILA +MAPACHES + BAJO', price: 270000, cost: 190000, description: `Aventura en Playa Tranquila con la oportunidad de interactuar con los amigables mapaches y explorar hermosas zonas de bajo para nadar.`  },
  { name: 'PLAYA TRANQUILA PACK X 4 ADVENTURE', price: 1050000, cost: 735000, description: `Vive una experiencia personalizada en Playa Tranquila, Barú 🌊✨, perfecta para quienes buscan comodidad, buen servicio y contacto con la naturaleza. Relájate en nuestras asoleadoras 😎, disfruta áreas de descanso 🌴, observa manglares y mapaches 🐾🌿 y sumérgete en una aventura de snorkel entre peces tropicales 🐠🤿. Un plan ideal para desconectar, disfrutar y recibir atención dedicada durante todo el día.
Incluye:
🤝 Servicio personalizado
😎 Asoleadoras y zonas de descanso
🐾 Avistamiento de manglares y mapaches
🤿 Snorkel con peces tropicales
🏝️ Acceso a instalaciones
🌤️ Áreas sociales y espacios sombreados` },
  { name: 'ROSARIO BEACH', price: 370000, cost: 300000, description: `¡Disfruta un día inolvidable en Rosario Beach! 🌴☀️
Escápate a las Islas del Rosario y vive una experiencia única frente al mar. Relájate en playas paradisíacas, saborea un almuerzo típico y disfruta de actividades acuáticas en un entorno exclusivo. Todo con transporte seguro y atención personalizada para que tu día sea perfecto.
Incluye:
✅ Transporte marítimo ida y regreso
✅ Cóctel de bienvenida
✅ Almuerzo típico con opciones deliciosas
✅ Acceso a instalaciones y zonas de descanso
✅ Actividades como kayak y paddle board
✅ Botella de agua por persona
📌 Ideal para:
Familias
Parejas
Amigos que buscan desconectarse y disfrutar la magia del Caribe
¡Reserva ahora y vive la experiencia que estabas esperando! 🌊🍹` },
  { name: 'SANTA MARTA PLAYA BLANCA + ACUARIO', price: 180000, cost: 140000, description: `Excursión a Santa Marta para visitar su emblemática Playa Blanca y el Acuario. Incluye transporte intermunicipal y entradas.`  },
  { name: 'SUNSET CATAMARÁN FLAMANTE', price: 200000, cost: 160000, description: `Disfruta del hermoso atardecer cartagenero navegando por la bahía en un lujoso catamarán con bebidas y excelente música.`  },
  { name: 'TOP 3 BORA BORA', price: 510000, cost: 430000, description: `El recorrido definitivo que incluye una parada principal en el famoso Bora Bora Beach Club, garantizando lujo y diversión en un solo día.`  },
  { name: 'TOP 3 ISLAS – Bora Bora | Pao Pao | Islabela', price: 510000, cost: 357000, description: `Vive una experiencia única visitando tres de las mejores islas del Caribe colombiano en un solo día. Este tour te lleva a disfrutar lo mejor de Bora Bora Beach Club, Pao Pao Hotel & Restaurant e Islabela, con paisajes increíbles, gastronomía, confort y actividades inolvidables.
✨ Incluye:
🚤 Transporte en lancha rápida
🗣️ Guía bilingüe
🌅 Recorrido panorámico por las Islas del Rosario
🍹 Trago de bienvenida en cada isla
💧 Agua fresca a bordo
🍽️ 3 opciones de almuerzo + bebida en Islabela
⛱️ Espacios disponibles para disfrutar en cada isla
📍 Punto de encuentro:
Muelle La Bodeguita – 8:00 a.m.
⏳ Regreso aproximado: 3:30 p.m.
Reservas garantizadas hasta las 8:20 a.m.
🔞 Solo adultos (18+)
📌 No incluye tasa portuaria ni seguro.
🌊 Tres islas, tres experiencias y un solo día para recordar.` },
  { name: 'TOP 3 ISLAS PRIVADAS', price: 380000, cost: 310000, description: `Un día, tres experiencias únicas. Visita las mejores islas privadas del Rosario en lancha rápida, disfrutando de lo mejor de cada una.`  },
  { name: 'TOUR BAHIA EN BOTE', price: 90000, cost: 55000, description: `Relajante recorrido de dos horas navegando por la bahía interna de Cartagena, observando la ciudad moderna y colonial desde el agua.`  },
  { name: 'Tour Islas del Rosario + Barú – Full Day', price: 180000, cost: 125999, description: `Disfruta un día espectacular con este recorrido combinado por Islas del Rosario y Playa Blanca Barú, uno de los planes más completos para quienes desean explorar varias zonas del Caribe colombiano en una sola experiencia.
El tour incluye transporte terrestre y marítimo, visita a puntos turísticos emblemáticos, tiempo en playa, almuerzo caribeño y acompañamiento de guía durante toda la jornada.
✨ Incluye:
🚌 Recogida en hotel en los sectores:
Bocagrande, Castillo Grande, Laguito, Boquilla, Crespo, Marbella o punto de encuentro.
🚌 Transporte ida y regreso en bus climatizado hacia Playa Blanca – Barú
🚤 Transporte en lancha ida y regreso desde Barú hacia Islas del Rosario
🪶 Parada en San Martín de Pajarales
(acuífero natural ideal para observación panorámica)
🐬 Parada en el Oceanario
(No incluye entrada)
🍽️ Almuerzo típico caribeño – 4 opciones:
Pollo
Pescado
Cerdo
Vegetariano
👨✈️ Guía turístico acompañante
⏰ Horario:
7:00 a.m. – 3:00 p.m.
⚠️ Observación:
Oceanario: No incluido
Snorkel: No incluido
Carpas y parasoles:  No incluido` },
  { name: 'Tour Playa Tranquila – Isla Barú', price: 170000, cost: 118999, description: `Vive un día de relax total en Playa Tranquila, uno de los sectores más serenos y encantadores de Barú. Este tour te lleva a disfrutar aguas cristalinas, arena suave y un ambiente perfecto para desconectarte del ruido de la ciudad. Además, combina transporte terrestre y marítimo, zona exclusiva, almuerzo típico y guía personalizado que acompaña toda la experiencia.
✨ Incluye:
🚌 Recogida en hotel
Sectores: Bocagrande, Castillo Grande, Laguito, Boquilla, Crespo, Marbella o punto acordado.
🚌 Transporte terrestre hasta Playa Blanca – Barú
🚤 Transporte en lancha (10 min)
Hacia el sector exclusivo de Playa Tranquila
🍹 Bebida de bienvenida
⛱️ Uso de instalaciones:
Sombrillas
Camas y sillas asoleadoras
Zonas de descanso
🍽️ Almuerzo típico caribeño – 4 opciones:
Pollo
Pescado
Cerdo
Vegetariano
👨✈️ Guía personalizado
⏰ Horario:
7:00 a.m. – 3:00 p.m.` },
  { name: 'Tour Punta Arena – Isla Tierra Bomba', price: 80000, cost: 56000, description: `Disfruta un día espectacular en Punta Arena, una de las playas más hermosas y tranquilas de la Isla Tierra Bomba. Este tour es ideal para quienes buscan un ambiente relajado, con aguas claras, arena suave y un clima perfecto para descansar, tomar el sol y desconectarse de la ciudad.
El plan incluye transporte marítimo cómodo, almuerzo caribeño y acceso a zonas de descanso diseñadas para una experiencia completa frente al mar.
✨ Incluye:
🚤 Transporte ida y vuelta en lancha hacia Punta Arena
🍽️ Almuerzo típico caribeño – 4 opciones:
Pollo
Pescado
Cerdo
Vegetariano
🌴 Zonas de descanso:
Sillas
Mesas
🎵 Música ambiental para disfrutar la playa
⏰ Horarios de salida:
8:30 a.m., 9:30 a.m., 10:30 a.m.
⏰ Horarios de regreso:
3:30 p.m. y 4:30 p.m.
No incluye retorno y gastos no especificados` },
  { name: 'TOUR VOLAR – CARTAGENA DESDE EL CIELO', price: 160000, cost: 112000, description: `⏰ *Horarios*
Muelle la bodeguita puerta #1
*Citación:* 9:30 a.m.
*Salida:* 10:00 a.m.
*Regreso:* 2:30 p.m.
🎉 *Incluye:*
🍸Cóctel de bienvenida
🕺🏽DJ + show de bailarines
🍽️Almuerzo tipo buffet:
- Lomo de cerdo
- Filete de pescado
- Pollo Goulash
*Acompañantes:*
🥗 Ensalada Fresca
🍚 Arroz de coco o blanco
*No incluye bebidas*
🚁Vuelo panorámico en helicóptero (12 km)
🚫 No apto para mujeres Embarazadas 
*Impuesto:* $18.000 por persona
el valor de 160.000 no incluye vuelo panorámico  en helicóptero` },
  { name: 'TOURS 5 ISLAS FULL TERRESTRE', price: 250000, cost: 175000, description: `¡Vive la experiencia definitiva en el Caribe con el Tour 5 Islas Full Day Terrestre! 🌴✨
Diseñado para los viajeros más exigentes que buscan una aventura inmersiva, vibrante y llena de contrastes. Desde playas de arena blanca y aguas turquesas hasta la magia bioluminiscente de la noche, este plan lo tiene absolutamente todo para que aproveches tu día al máximo sin preocuparte por nada.

✨ Incluye:
🚐 Transporte: Cómoda recogida en bus climatizado desde tu hotel (Bocagrande, Castillo Grande, Laguito, Boquilla, Crespo, Marbella o punto de encuentro) hasta Barú.
🚤 Transporte en Lancha: Recorrido marítimo seguro y rápido por las islas.
🌅 Tour Panorámico: Explora la majestuosidad del Archipiélago de las Islas del Rosario.
🏖️ Isla Privada Kokomo: Relájate en un entorno paradisíaco y exclusivo.
🤿 Snorkeling de Aventura: Sumérgete en arrecifes cristalinos y maravíllate con el avistamiento de la mítica avioneta hundida de Pablo Escobar.
🏝️ Fiesta en Isla Cholón: Disfruta del mejor ambiente caribeño con un exquisito cóctel de mariscos de cortesía y bohío compartido.
🌊 Descanso en Playa Tranquila: Relajación total con uso de excelentes instalaciones de playa.
🍽️ Almuerzo Típico: Deliciosa gastronomía local para recargar energías frente al mar.
🌇 Atardecer Mágico: Contempla la espectacular caída del sol en el horizonte.
🌌 Avistamiento de Plancton: Cierra tu día nadando en aguas bioluminiscentes, una experiencia que brilla en la oscuridad.
⛴️ Retorno: Regreso seguro a Cartagena en bus climatizado al finalizar la jornada.

📌 Observaciones Importantes:
• Oceanario: La visita es opcional. Quienes deseen ingresar deben adquirir su entrada directamente en el lugar.
• Tiempo libre: La parada en el oceanario dura aproximadamente 50 minutos; si decides no ingresar, podrás disfrutar de la playa o seguir haciendo snorkeling.
• No incluye: Bebidas no especificadas, toallas ni gastos adicionales.

⏰ Horario:
7:00 a.m. – 8:00 p.m.` },
  { name: 'TOURS BAHIA + CLUB DE PLAYA KABANA', price: 200000, cost: 120000, description: `Disfruta de la NOCHE AZUL!  un recorrido en bote deportivo con barra libre de 1:30h por la bahía de Cartagena y continúa en Club Kabanna de 2h o 4h en un espectacular club de playa ubicado en la isla de Tierra Bomba, donde podrás relajarte, disfrutar de un Bar en la playa , un rooftop con piscina frente al mar, y un Restaurante exquisito. 
🚤 La experiencia incluye
	•	🌊 Recorrido de 1:30 h en bote deportivo por la bahía. 
	•	🥂 Barra libre durante la navegación: Cuba Libre (ron con Coca-Cola) y Aguardiente con jugo de Naranja. 
	•	🎶 Música variada con Animación. 
	•	🏝️ Acceso a Club Kabanna isla Tierra Bomba (2-4 horas)
	•	🏊 Uso de playa exclusiva y piscina.  
	•	💃 Disco bar entrada incluida.
	•	🥘Cena: Canastas de Patacones con Camarones al Ajillo
Picada de Chicharrón con Patacones 
Picada de Pollo Apanado con Papas a La Francesa
📍 Información del tour
	•	Punto de encuentro: Muelle Los Pegasos ( llegar 30 minutos antes) 
	•	Hora de salida: 5:00 p.m y 7:00 p.m. 
	•	Hora de regreso: 9:00 p.m. y  11:00 p.m` },
  { name: 'TOURS BAHIA BARCO PIRATA', price: 130000, cost: 80000, description: `Diversión familiar asegurada. Navega al atardecer en el Barco Pirata con recreación dirigida y un gran espectáculo.`  },
  { name: 'TOURS BAHIA BEQUIA EAGLE', price: 150000, cost: 110000, description: `Disfruta de la brisa marina y las luces de la ciudad a bordo de la emblemática embarcación Bequia Eagle, con música y ambiente festivo.`  },
  { name: 'TOURS VOLCAN DEL TOTUMO', price: 170000, cost: 110000, description: `Un viaje curativo y divertido. Sumérgete en el lodo terapéutico del cráter del Volcán del Totumo y luego refréscate en la laguna cercana.`  }
]
