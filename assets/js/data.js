/*
  AUREON — catálogo
  ------------------------------------------------------------------
  Tudo o que aparece no site sai daqui. Para trocar o estoque, edite esta lista.

  FOTOS REAIS: em cada veículo, preencha  img: 'assets/img/nome-da-foto.jpg'
  (ou uma URL). Sem img, o site desenha a arte vetorial da categoria.

  VÍDEOS NA ROLAGEM (seção "Em movimento" da página inicial): preencha
  video: 'assets/video/nome.mp4' no veículo em destaque de cada categoria.
  O vídeo avança e volta conforme a pessoa rola a página. Use clipes curtos
  (4–8 s), sem som, em MP4 H.264 com keyframe a cada quadro para ficar liso:
    ffmpeg -i entrada.mp4 -an -vf scale=1600:-2 -c:v libx264 -g 1 -crf 23 saida.mp4
  Sem video, a cena usa a arte vetorial (entra, gira e a câmera entra na cabine).

  Os modelos e marcas abaixo são fictícios (exemplos para o layout).

  Fotos e vídeos atuais: Pexels (pexels.com) — licença gratuita, uso comercial
  permitido, crédito não obrigatório. São ilustrativos; algumas imagens mostram
  marcas reais. Troque pelas fotos do seu estoque antes de publicar.
*/
window.AUREON_DATA = {
  categories: [
    {
      id: 'carros', name: 'Carros', singular: 'Carro', art: 'car',
      tagline: 'Gran turismos, superesportivos e SUVs de assinatura.',
      desc: 'Cada carro passa por laudo cautelar, polimento técnico e chega à sua garagem com película aplicada e tanque cheio.',
      perk: ['7 dias', 'entrega em todo o Brasil'],
      local: 'Showroom Jardins · São Paulo', teste: 'Test drive com hora marcada',
      inside: ['Couro costurado à mão', 'Painel em fibra de carbono, bancos com memória e som de 21 alto-falantes.'],
      theme: ['#3b2b22', '#0f0c0a'], body: '#1d1d20'
    },
    {
      id: 'avioes', name: 'Aviões', singular: 'Avião', art: 'jet',
      tagline: 'Jatos executivos e turbo-hélices, novos e seminovos.',
      desc: 'Inspeção pré-compra independente, transferência de registro na ANAC e treinamento da tripulação incluídos na negociação.',
      perk: ['ANAC', 'registro e traslado inclusos'],
      local: 'Hangar AUREON · Campo de Marte, SP', teste: 'Voo de demonstração com piloto',
      inside: ['Uma suíte a 15 mil metros', 'Quarto master, chuveiro a bordo e cabine pressurizada como se estivesse a 1.800 m.'],
      theme: ['#1a2742', '#080b13'], body: '#e6e4df'
    },
    {
      id: 'helicopteros', name: 'Helicópteros', singular: 'Helicóptero', art: 'heli',
      tagline: 'Do heliponto ao campo em poucos minutos.',
      desc: 'Configuração VIP, hangaragem em São Paulo e gestão completa de manutenção pela nossa equipe técnica.',
      perk: ['1 ano', 'de hangar em São Paulo'],
      local: 'Hangar AUREON · Campo de Marte, SP', teste: 'Voo de demonstração com piloto',
      inside: ['Silêncio sobre a cidade', 'Oito lugares em couro, isolamento acústico de jato e ar-condicionado independente.'],
      theme: ['#25302b', '#0a0e0c'], body: '#22252a'
    },
    {
      id: 'iates', name: 'Iates & Barcos', singular: 'Embarcação', art: 'yacht',
      tagline: 'Superiates, flybridges e lanchas de dia.',
      desc: 'Vaga em marina parceira, registro na Marinha e capitão para as primeiras saídas — tudo resolvido antes do primeiro mergulho.',
      perk: ['Marina', 'vaga em Angra ou Ilhabela'],
      local: 'Marina AUREON · Guarujá, SP', teste: 'Passeio de teste com comandante',
      inside: ['Cinco suítes sobre o mar', 'Beach club ao nível da água, jacuzzi no deck superior e tripulação de sete.'],
      theme: ['#163238', '#061013'], body: '#eceae4'
    },
    {
      id: 'jetskis', name: 'Jet Skis', singular: 'Jet ski', art: 'jetski',
      tagline: 'Potência, silêncio elétrico e conforto touring.',
      desc: 'Entregue na água, com carreta, coletes e a habilitação de Arrais agendada com instrutor parceiro.',
      perk: ['Na água', 'entrega com carreta'],
      local: 'Marina AUREON · Guarujá, SP', teste: 'Teste na água com instrutor',
      inside: ['300 cavalos sob o banco', 'Tela de 7" com GPS, controle de cruzeiro e porta-objetos estanque.'],
      theme: ['#103a48', '#05131a'], body: '#1b2e5a'
    },
    {
      id: 'motos', name: 'Motos', singular: 'Moto', art: 'moto',
      tagline: 'Superesportivas, cruisers e elétricas de série limitada.',
      desc: 'Revisão zero, track day com instrutor e garantia estendida de fábrica em todos os modelos.',
      perk: ['Track day', 'com instrutor incluso'],
      local: 'Showroom Jardins · São Paulo', teste: 'Test ride com hora marcada',
      inside: ['Carbono e numeração', 'Painel TFT, cinco modos de pilotagem e placa numerada assinada à mão.'],
      theme: ['#3b1d1c', '#110808'], body: '#7d1a1a'
    },
    {
      id: 'classicos', name: 'Clássicos', singular: 'Clássico', art: 'car',
      tagline: 'Carros de coleção restaurados, com laudo de originalidade.',
      desc: 'Restaurados por oficinas certificadas, com dossiê fotográfico do restauro e placa preta quando elegível.',
      perk: ['Placa preta', 'originalidade certificada'],
      local: 'Showroom Jardins · São Paulo', teste: 'Volta guiada com hora marcada',
      inside: ['Restauro peça a peça', 'Couro, cromados e motor originais revisados por especialistas.'],
      theme: ['#3a2a1e', '#100b08'], body: '#6b1f1f'
    },
    {
      id: 'motorhomes', name: 'Motorhomes', singular: 'Motorhome', art: 'car',
      tagline: 'Casas sobre rodas para ir longe sem abrir mão de nada.',
      desc: 'Motorhomes e vans de expedição com cozinha, banheiro, energia solar e tração para chegar onde a estrada acaba.',
      perk: ['Energia solar', 'autonomia fora da rede'],
      local: 'Pátio AUREON · Rod. dos Bandeirantes, SP', teste: 'Fim de semana de teste',
      inside: ['Sua casa em qualquer lugar', 'Cozinha completa, banheiro, ar-condicionado e energia solar.'],
      theme: ['#2a3226', '#0b0e0a'], body: '#e8e6df'
    }
  ],

  vehicles: [
    /* ---------- CARROS ---------- */
    {
      id: 'marchetti-veloce-v12', cat: 'carros', brand: 'Marchetti', model: 'Veloce V12', year: 2026,
      price: 4890000, tag: 'Novo', featured: true, img: 'assets/img/marchetti-veloce-v12.jpg', video: 'assets/video/carros.mp4',
      desc: 'Gran turismo de motor dianteiro com V12 aspirado de 6.5 litros, câmbio de dupla embreagem e interior em couro costurado à mão.',
      specs: [['Potência', '830 cv'], ['0–100 km/h', '2,9 s'], ['Velocidade máx.', '340 km/h'], ['Motor', 'V12 6.5'], ['Lugares', '2']],
      finishes: [{ name: 'Nero Assoluto', color: '#1a1a1d' }, { name: 'Rosso Imperiale', color: '#7d1a1a' }, { name: 'Verde Inglese', color: '#1f3a2e' }, { name: 'Argento Lunare', color: '#9aa0a6' }]
    },
    {
      id: 'lindqvist-aero-s', cat: 'carros', brand: 'Lindqvist', model: 'Aero S', year: 2026,
      price: 2350000, tag: 'Elétrico', featured: true, img: 'assets/img/lindqvist-aero-s.jpg',
      desc: 'Grand tourer 100% elétrico com 720 km de autonomia, teto de vidro eletrocrômico e cabine em lã e carvalho.',
      specs: [['Potência', '1.020 cv'], ['0–100 km/h', '2,4 s'], ['Autonomia', '720 km'], ['Bateria', '120 kWh'], ['Lugares', '4']],
      finishes: [{ name: 'Glacier', color: '#cfd6d9' }, { name: 'Fjord Blue', color: '#24364a' }, { name: 'Graphite', color: '#2b2b2d' }]
    },
    {
      id: 'castellane-regent', cat: 'carros', brand: 'Castellane', model: 'Régent', year: 2025,
      price: 3120000, tag: 'Pronta entrega', img: 'assets/img/castellane-regent.jpg',
      desc: 'SUV de luxo com suspensão a ar preditiva, bancos traseiros executivos com massagem e geladeira entre os assentos.',
      specs: [['Potência', '620 cv'], ['0–100 km/h', '4,1 s'], ['Velocidade máx.', '290 km/h'], ['Motor', 'V8 4.0 biturbo'], ['Lugares', '4']],
      finishes: [{ name: 'Midnight Sapphire', color: '#15203a' }, { name: 'Champagne', color: '#b9a888' }, { name: 'Onyx', color: '#121212' }]
    },

    /* ---------- AVIÕES ---------- */
    {
      id: 'halden-stratos-7x', cat: 'avioes', brand: 'Halden', model: 'Stratos 7X', year: 2025,
      price: 389000000, tag: 'Sob encomenda', featured: true, img: 'assets/img/halden-stratos-7x.jpg', video: 'assets/video/avioes.mp4',
      desc: 'Jato executivo de cabine ultralarga, capaz de ligar São Paulo a Dubai sem escalas, com suíte master e chuveiro a bordo.',
      specs: [['Alcance', '13.900 km'], ['Cruzeiro', 'Mach 0,90'], ['Passageiros', '16'], ['Teto', '15.545 m'], ['Cabine', '16,3 m']],
      finishes: [{ name: 'Branco Polar', color: '#e6e4df' }, { name: 'Prata Atlântico', color: '#a7adb3' }, { name: 'Azul Real', color: '#1c2a4a' }]
    },
    {
      id: 'arcturus-mid-600', cat: 'avioes', brand: 'Arcturus', model: 'Mid 600', year: 2024,
      price: 96500000, tag: 'Seminovo · 320 h', img: 'assets/img/arcturus-mid-600.jpg',
      desc: 'Jato médio com cabine em que se fica de pé, conectividade Ka-band e alcance para voar do Brasil aos Estados Unidos com uma parada.',
      specs: [['Alcance', '6.300 km'], ['Cruzeiro', '870 km/h'], ['Passageiros', '9'], ['Teto', '13.700 m'], ['Cabine', '7,9 m']],
      finishes: [{ name: 'Branco Polar', color: '#e9e7e2' }, { name: 'Grafite', color: '#3a3d42' }]
    },
    {
      id: 'pilatine-tp-12', cat: 'avioes', brand: 'Pilatine', model: 'TP-12', year: 2026,
      price: 34800000, tag: 'Novo', img: 'assets/img/pilatine-tp-12.jpg',
      desc: 'Turbo-hélice monomotor que pousa em pistas curtas de terra — da fazenda ao litoral sem depender de grandes aeroportos.',
      specs: [['Alcance', '3.400 km'], ['Cruzeiro', '528 km/h'], ['Passageiros', '8'], ['Teto', '9.144 m'], ['Pista mín.', '740 m']],
      finishes: [{ name: 'Branco & Ouro', color: '#ece8de' }, { name: 'Verde Campo', color: '#2d3d30' }]
    },

    /* ---------- HELICÓPTEROS ---------- */
    {
      id: 'vireo-h175-vip', cat: 'helicopteros', brand: 'Vireo', model: 'H175 VIP', year: 2025,
      price: 78000000, tag: 'Sob encomenda', featured: true, img: 'assets/img/vireo-h175-vip.jpg', video: 'assets/video/helicopteros.mp4',
      desc: 'Bimotor de grande porte com cabine VIP para oito passageiros e isolamento acústico digno de jato executivo.',
      specs: [['Alcance', '1.100 km'], ['Cruzeiro', '285 km/h'], ['Passageiros', '8'], ['Motores', '2 turboeixo'], ['Autonomia', '4 h 30']],
      finishes: [{ name: 'Negro Ônix', color: '#1b1c20' }, { name: 'Branco Gelo', color: '#dedcd6' }, { name: 'Azul Noite', color: '#1a2438' }]
    },
    {
      id: 'ostra-r9-executive', cat: 'helicopteros', brand: 'Ostra', model: 'R9 Executive', year: 2026,
      price: 38500000, tag: 'Novo', img: 'assets/img/ostra-r9-executive.jpg',
      desc: 'Bimotor leve e ágil sobre a cidade, com interior em couro semianilina e ar-condicionado independente para a cabine.',
      specs: [['Alcance', '780 km'], ['Cruzeiro', '260 km/h'], ['Passageiros', '6'], ['Motores', '2 turboeixo'], ['Autonomia', '3 h 40']],
      finishes: [{ name: 'Grafite', color: '#2e3034' }, { name: 'Bordô', color: '#4a1820' }]
    },
    {
      id: 'lume-l4', cat: 'helicopteros', brand: 'Lume', model: 'L4', year: 2024,
      price: 9800000, tag: 'Seminovo · 140 h', img: 'assets/img/lume-l4.jpg',
      desc: 'Monomotor de quatro lugares — a forma mais rápida de trocar duas horas de trânsito por vinte minutos de voo.',
      specs: [['Alcance', '640 km'], ['Cruzeiro', '220 km/h'], ['Passageiros', '3'], ['Motor', '1 turboeixo'], ['Autonomia', '3 h']],
      finishes: [{ name: 'Champagne', color: '#b9a888' }, { name: 'Negro', color: '#18181a' }]
    },

    /* ---------- IATES & BARCOS ---------- */
    {
      id: 'valmare-38', cat: 'iates', brand: 'Valmare', model: '38 Superyacht', year: 2026,
      price: 210000000, tag: 'Sob encomenda', featured: true, img: 'assets/img/valmare-38.jpg', video: 'assets/video/iates.mp4',
      desc: 'Superiate de 38 metros com cinco suítes, jacuzzi no deck superior e um beach club que se abre ao nível do mar.',
      specs: [['Comprimento', '38 m'], ['Hóspedes', '10 · 5 suítes'], ['Tripulação', '7'], ['Velocidade máx.', '17 nós'], ['Autonomia', '3.800 mn']],
      finishes: [{ name: 'Branco Iate', color: '#eceae4' }, { name: 'Azul Marinho', color: '#1a2a44' }, { name: 'Cinza Tempestade', color: '#5d646b' }]
    },
    {
      id: 'corsaro-88', cat: 'iates', brand: 'Corsaro', model: '88 Flybridge', year: 2025,
      price: 46000000, tag: 'Pronta entrega', featured: true, img: 'assets/img/corsaro-88.jpg',
      desc: 'Flybridge de 27 metros com casco planante, salão envidraçado de ponta a ponta e garagem para tender e jet ski.',
      specs: [['Comprimento', '26,8 m'], ['Hóspedes', '8 · 4 cabines'], ['Tripulação', '3'], ['Velocidade máx.', '31 nós'], ['Autonomia', '350 mn']],
      finishes: [{ name: 'Branco Iate', color: '#e8e6df' }, { name: 'Areia', color: '#c9b893' }]
    },
    {
      id: 'solace-42', cat: 'iates', brand: 'Solace', model: '42 Dayboat', year: 2026,
      price: 6900000, tag: 'Novo', img: 'assets/img/solace-42.jpg',
      desc: 'Lancha de dia em mogno e fibra de carbono, feita para o fim de tarde em Angra e a volta para casa antes do jantar.',
      specs: [['Comprimento', '12,8 m'], ['Hóspedes', '10'], ['Cabines', '1'], ['Velocidade máx.', '44 nós'], ['Autonomia', '220 mn']],
      finishes: [{ name: 'Mogno', color: '#5a2e1a' }, { name: 'Branco', color: '#ebe8e0' }, { name: 'Azul Riviera', color: '#23476b' }]
    },

    /* ---------- JET SKIS ---------- */
    {
      id: 'tidal-rx-pro-300', cat: 'jetskis', brand: 'Tidal', model: 'RX Pro 300', year: 2026,
      price: 189000, tag: 'Novo', featured: true, img: 'assets/img/tidal-rx-pro-300.jpg', video: 'assets/video/jetskis.mp4',
      desc: 'O mais potente da linha: 300 cv supercharged, casco em carbono e tela de 7" com GPS e controle de cruzeiro.',
      specs: [['Potência', '300 cv'], ['Velocidade máx.', '120 km/h'], ['Lugares', '3'], ['Tanque', '70 L'], ['Peso', '380 kg']],
      finishes: [{ name: 'Azul Elétrico', color: '#1b2e5a' }, { name: 'Preto Carbono', color: '#161618' }, { name: 'Branco & Lima', color: '#d9dccc' }]
    },
    {
      id: 'kairo-wave-gtx', cat: 'jetskis', brand: 'Kairo', model: 'Wave GTX', year: 2025,
      price: 142000, tag: 'Pronta entrega', img: 'assets/img/kairo-wave-gtx.jpg',
      desc: 'Touring de três lugares com plataforma de banho, som Bluetooth à prova d’água e porta-objetos de 150 litros.',
      specs: [['Potência', '230 cv'], ['Velocidade máx.', '105 km/h'], ['Lugares', '3'], ['Tanque', '78 L'], ['Peso', '410 kg']],
      finishes: [{ name: 'Grafite', color: '#33373d' }, { name: 'Coral', color: '#a8473a' }]
    },
    {
      id: 'nautil-one-electric', cat: 'jetskis', brand: 'Nautil', model: 'One Electric', year: 2026,
      price: 236000, tag: 'Elétrico', img: 'assets/img/nautil-one-electric.jpg',
      desc: 'Silencioso e sem emissões: duas horas de navegação, recarga em 90 minutos e liberado em represas com restrição a motor.',
      specs: [['Potência', '160 kW'], ['Velocidade máx.', '90 km/h'], ['Lugares', '2'], ['Bateria', '38 kWh'], ['Peso', '320 kg']],
      finishes: [{ name: 'Branco Ártico', color: '#e2e5e6' }, { name: 'Verde Água', color: '#1f5a57' }]
    },

    /* ---------- MOTOS ---------- */
    {
      id: 'valkari-superleggera-v4', cat: 'motos', brand: 'Valkari', model: 'Superleggera V4', year: 2026,
      price: 890000, tag: 'Série limitada · 500 un.', featured: true, img: 'assets/img/valkari-superleggera-v4.jpg', video: 'assets/video/motos.mp4',
      desc: 'Superesportiva com quadro, rodas e carenagem em fibra de carbono — numerada e assinada à mão na fábrica.',
      specs: [['Potência', '234 cv'], ['Torque', '12,1 kgfm'], ['Velocidade máx.', '330 km/h'], ['Peso seco', '152 kg'], ['Motor', 'V4 1.103 cc']],
      finishes: [{ name: 'Rosso Corsa', color: '#7d1a1a' }, { name: 'Carbono', color: '#1a1a1c' }]
    },
    {
      id: 'brennan-heritage-1900', cat: 'motos', brand: 'Brennan', model: 'Heritage 1900', year: 2025,
      price: 245000, tag: 'Pronta entrega', img: 'assets/img/brennan-heritage-1900.jpg',
      desc: 'Cruiser de touring com motor V-twin de 1.900 cc, alforjes em couro e acabamento cromado feito à mão.',
      specs: [['Potência', '105 cv'], ['Torque', '17,3 kgfm'], ['Velocidade máx.', '190 km/h'], ['Peso seco', '340 kg'], ['Motor', 'V-twin 1.900 cc']],
      finishes: [{ name: 'Preto Vivid', color: '#141416' }, { name: 'Verde Oliva', color: '#3c4630' }, { name: 'Creme', color: '#d8ccb0' }]
    },
    {
      id: 'ondra-e-track', cat: 'motos', brand: 'Ondra', model: 'E-Track', year: 2026,
      price: 310000, tag: 'Elétrico', img: 'assets/img/ondra-e-track.jpg',
      desc: 'Naked elétrica com 0–100 em 2,8 s, recarga rápida e modos de pilotagem configuráveis pelo aplicativo.',
      specs: [['Potência', '150 cv'], ['Torque', '22 kgfm'], ['Velocidade máx.', '250 km/h'], ['Peso', '230 kg'], ['Autonomia', '360 km']],
      finishes: [{ name: 'Cinza Titânio', color: '#5a5f66' }, { name: 'Laranja Volt', color: '#b8561e' }]
    },

    /* =========== NOVOS MODELOS =========== */
    /* ---------- CARROS ---------- */
    {
      id: 'marchetti-spider-cabrio', cat: 'carros', brand: 'Marchetti', model: 'Spider Cabrio', year: 2025,
      price: 2780000, tag: 'Conversível', img: 'assets/img/marchetti-spider-cabrio.jpg',
      desc: 'Conversível de quatro lugares com capota rígida retrátil em 14 segundos e bancos com aquecimento no pescoço.',
      specs: [['Potência', '612 cv'], ['0–100 km/h', '3,6 s'], ['Velocidade máx.', '315 km/h'], ['Motor', 'V8 4.0 biturbo'], ['Lugares', '4']],
      finishes: [{ name: 'Bianco Perla', color: '#e4e2dc' }, { name: 'Nero', color: '#17171a' }, { name: 'Blu Notte', color: '#1c2740' }]
    },
    {
      id: 'kaiyo-hayate-gt', cat: 'carros', brand: 'Kaiyo', model: 'Hayate GT', year: 2024,
      price: 1290000, tag: 'Seminovo · 4.800 km', img: 'assets/img/kaiyo-hayate-gt.jpg',
      desc: 'Esportivo leve de motor dianteiro e tração traseira, feito para curvas — o carro de fim de semana perfeito.',
      specs: [['Potência', '420 cv'], ['0–100 km/h', '4,2 s'], ['Velocidade máx.', '280 km/h'], ['Motor', 'V6 3.0 biturbo'], ['Lugares', '2+2']],
      finishes: [{ name: 'Branco Neve', color: '#e8e8e6' }, { name: 'Vermelho Sakura', color: '#9c1f24' }]
    },
    {
      id: 'castellane-berline-s', cat: 'carros', brand: 'Castellane', model: 'Berline S', year: 2026,
      price: 1650000, tag: 'Novo', img: 'assets/img/castellane-berline-s.jpg',
      desc: 'Sedã executivo com banco traseiro reclinável, mesa de trabalho e isolamento acústico com vidros duplos.',
      specs: [['Potência', '510 cv'], ['0–100 km/h', '4,4 s'], ['Velocidade máx.', '250 km/h'], ['Motor', 'V8 4.0 híbrido'], ['Lugares', '5']],
      finishes: [{ name: 'Obsidiana', color: '#141416' }, { name: 'Prata Lunar', color: '#9ea3a8' }]
    },

    /* ---------- AVIÕES ---------- */
    {
      id: 'pilatine-p4-twin', cat: 'avioes', brand: 'Pilatine', model: 'P4 Twin', year: 2023,
      price: 6900000, tag: 'Seminovo · 210 h', img: 'assets/img/pilatine-p4-twin.jpg',
      desc: 'Bimotor a pistão de seis lugares, ideal para quem está tirando a habilitação ou voa para o interior.',
      specs: [['Alcance', '1.900 km'], ['Cruzeiro', '370 km/h'], ['Passageiros', '5'], ['Teto', '6.100 m'], ['Pista mín.', '600 m']],
      finishes: [{ name: 'Branco & Azul', color: '#e8eaee' }, { name: 'Branco & Vermelho', color: '#ece6e2' }]
    },
    {
      id: 'aquila-sea-12', cat: 'avioes', brand: 'Aquila', model: 'Sea 12 Anfíbio', year: 2025,
      price: 18500000, tag: 'Anfíbio', img: 'assets/img/aquila-sea-12.jpg',
      desc: 'Hidroavião anfíbio que pousa na pista ou na água: do aeroporto direto para a frente da sua casa de praia.',
      specs: [['Alcance', '1.600 km'], ['Cruzeiro', '300 km/h'], ['Passageiros', '9'], ['Teto', '7.600 m'], ['Pouso', 'Pista ou água']],
      finishes: [{ name: 'Tropical', color: '#e9c44a' }, { name: 'Branco', color: '#ecebe6' }]
    },
    {
      id: 'halden-stratos-5', cat: 'avioes', brand: 'Halden', model: 'Stratos 5', year: 2024,
      price: 245000000, tag: 'Seminovo · 600 h', img: 'assets/img/halden-stratos-5.jpg',
      desc: 'Jato de longo alcance com três ambientes na cabine e conectividade em todo o voo.',
      specs: [['Alcance', '12.000 km'], ['Cruzeiro', 'Mach 0,88'], ['Passageiros', '14'], ['Teto', '15.500 m'], ['Cabine', '14,2 m']],
      finishes: [{ name: 'Branco Polar', color: '#e6e4df' }, { name: 'Grafite', color: '#3a3d42' }]
    },

    /* ---------- HELICÓPTEROS ---------- */
    {
      id: 'vireo-h160-ranger', cat: 'helicopteros', brand: 'Vireo', model: 'H160 Ranger', year: 2025,
      price: 62000000, tag: 'Novo', img: 'assets/img/vireo-h160-ranger.jpg',
      desc: 'Bimotor médio com guincho, flutuadores opcionais e cabine configurável entre VIP e utilitária.',
      specs: [['Alcance', '890 km'], ['Cruzeiro', '270 km/h'], ['Passageiros', '10'], ['Motores', '2 turboeixo'], ['Autonomia', '4 h']],
      finishes: [{ name: 'Amarelo Sol', color: '#e3b021' }, { name: 'Negro Ônix', color: '#1b1c20' }]
    },
    {
      id: 'lume-l6-twin', cat: 'helicopteros', brand: 'Lume', model: 'L6 Twin', year: 2026,
      price: 21500000, tag: 'Novo', img: 'assets/img/lume-l6-twin.jpg',
      desc: 'Bimotor leve de seis lugares com piloto automático de quatro eixos para voos noturnos com segurança.',
      specs: [['Alcance', '700 km'], ['Cruzeiro', '250 km/h'], ['Passageiros', '6'], ['Motores', '2 turboeixo'], ['Autonomia', '3 h 30']],
      finishes: [{ name: 'Branco Gelo', color: '#e2e2de' }, { name: 'Grafite', color: '#2e3034' }]
    },
    {
      id: 'ostra-n9-notar', cat: 'helicopteros', brand: 'Ostra', model: 'N9 Notar', year: 2024,
      price: 29000000, tag: 'Seminovo · 380 h', img: 'assets/img/ostra-n9-notar.jpg',
      desc: 'Sem rotor de cauda: mais silencioso e seguro para pousos em helipontos urbanos e jardins.',
      specs: [['Alcance', '600 km'], ['Cruzeiro', '245 km/h'], ['Passageiros', '7'], ['Motores', '2 turboeixo'], ['Autonomia', '3 h']],
      finishes: [{ name: 'Vermelho & Branco', color: '#b3262a' }, { name: 'Azul Noite', color: '#1a2438' }]
    },

    /* ---------- IATES & BARCOS ---------- */
    {
      id: 'aeolus-62-sail', cat: 'iates', brand: 'Aeolus', model: '62 Sail', year: 2025,
      price: 14800000, tag: 'Veleiro', img: 'assets/img/aeolus-62-sail.jpg',
      desc: 'Veleiro de cruzeiro de 19 metros com velas elétricas, três cabines e quilha retrátil para entrar em baías rasas.',
      specs: [['Comprimento', '18,9 m'], ['Hóspedes', '6 · 3 cabines'], ['Tripulação', '1'], ['Velocidade máx.', '12 nós'], ['Autonomia', '1.200 mn']],
      finishes: [{ name: 'Branco & Vermelho', color: '#e9e5df' }, { name: 'Azul Marinho', color: '#1a2a44' }]
    },
    {
      id: 'marlin-cat-55', cat: 'iates', brand: 'Marlin', model: 'Cat 55', year: 2026,
      price: 19900000, tag: 'Catamarã', img: 'assets/img/marlin-cat-55.jpg',
      desc: 'Catamarã a motor estável como uma casa: quatro suítes, flybridge e consumo baixo para travessias longas.',
      specs: [['Comprimento', '16,8 m'], ['Hóspedes', '8 · 4 suítes'], ['Tripulação', '2'], ['Velocidade máx.', '22 nós'], ['Autonomia', '1.800 mn']],
      finishes: [{ name: 'Branco', color: '#ebe8e0' }, { name: 'Areia', color: '#c9b893' }]
    },
    {
      id: 'corsaro-48-open', cat: 'iates', brand: 'Corsaro', model: '48 Open', year: 2025,
      price: 9400000, tag: 'Pronta entrega', img: 'assets/img/corsaro-48-open.jpg',
      desc: 'Lancha aberta de 15 metros com solário gigante, cabine para dormir e três motores de popa silenciosos.',
      specs: [['Comprimento', '14,6 m'], ['Hóspedes', '14'], ['Cabines', '1'], ['Velocidade máx.', '48 nós'], ['Autonomia', '280 mn']],
      finishes: [{ name: 'Branco', color: '#ebe8e0' }, { name: 'Cinza Tempestade', color: '#5d646b' }]
    },

    /* ---------- JET SKIS ---------- */
    {
      id: 'tidal-rx-sport-230', cat: 'jetskis', brand: 'Tidal', model: 'RX Sport 230', year: 2026,
      price: 128000, tag: 'Novo', img: 'assets/img/tidal-rx-sport-230.jpg',
      desc: 'O equilíbrio da linha: ágil para manobras e confortável para três pessoas no fim de semana.',
      specs: [['Potência', '230 cv'], ['Velocidade máx.', '105 km/h'], ['Lugares', '3'], ['Tanque', '70 L'], ['Peso', '360 kg']],
      finishes: [{ name: 'Azul Oceano', color: '#1f4fa0' }, { name: 'Preto', color: '#161618' }]
    },
    {
      id: 'kairo-race-x', cat: 'jetskis', brand: 'Kairo', model: 'Race X', year: 2025,
      price: 165000, tag: 'Esportivo', img: 'assets/img/kairo-race-x.jpg',
      desc: 'Jet ski de competição homologado, com casco de baixa altura e controle de largada.',
      specs: [['Potência', '310 cv'], ['Velocidade máx.', '125 km/h'], ['Lugares', '1'], ['Tanque', '60 L'], ['Peso', '340 kg']],
      finishes: [{ name: 'Amarelo Race', color: '#e3b021' }, { name: 'Preto', color: '#161618' }]
    },
    {
      id: 'nautil-duo-e', cat: 'jetskis', brand: 'Nautil', model: 'Duo E', year: 2024,
      price: 198000, tag: 'Elétrico · seminovo', img: 'assets/img/nautil-duo-e.jpg',
      desc: 'Elétrico de dois lugares para represas e reservas com restrição de motor a combustão.',
      specs: [['Potência', '120 kW'], ['Velocidade máx.', '80 km/h'], ['Lugares', '2'], ['Bateria', '30 kWh'], ['Peso', '300 kg']],
      finishes: [{ name: 'Grafite', color: '#33373d' }, { name: 'Branco Ártico', color: '#e2e5e6' }]
    },

    /* ---------- MOTOS ---------- */
    {
      id: 'brennan-grand-tour', cat: 'motos', brand: 'Brennan', model: 'Grand Tour 1800', year: 2025,
      price: 198000, tag: 'Touring', img: 'assets/img/brennan-grand-tour.jpg',
      desc: 'Touring de longa distância com piloto automático adaptativo, malas rígidas e banco aquecido para dois.',
      specs: [['Potência', '160 cv'], ['Torque', '18,4 kgfm'], ['Velocidade máx.', '220 km/h'], ['Peso seco', '370 kg'], ['Motor', 'Boxer 1.800 cc']],
      finishes: [{ name: 'Prata', color: '#9ea3a8' }, { name: 'Preto', color: '#141416' }]
    },
    {
      id: 'ondra-cafe-900', cat: 'motos', brand: 'Ondra', model: 'Café 900', year: 2024,
      price: 118000, tag: 'Café racer', img: 'assets/img/ondra-cafe-900.jpg',
      desc: 'Café racer com quadro tubular, banco em couro costurado e escapamento duplo artesanal.',
      specs: [['Potência', '95 cv'], ['Torque', '8,9 kgfm'], ['Velocidade máx.', '210 km/h'], ['Peso seco', '196 kg'], ['Motor', 'Bicilíndrico 900 cc']],
      finishes: [{ name: 'Preto Fosco', color: '#18181a' }, { name: 'Verde Inglês', color: '#1f3a2e' }]
    },
    {
      id: 'valkari-trail-1300', cat: 'motos', brand: 'Valkari', model: 'Trail 1300', year: 2026,
      price: 172000, tag: 'Adventure', img: 'assets/img/valkari-trail-1300.jpg',
      desc: 'Adventure para atravessar continentes: suspensão eletrônica, tanque de 30 litros e modo off-road.',
      specs: [['Potência', '170 cv'], ['Torque', '14,5 kgfm'], ['Velocidade máx.', '245 km/h'], ['Peso seco', '228 kg'], ['Motor', 'V4 1.300 cc']],
      finishes: [{ name: 'Areia do Deserto', color: '#b49a72' }, { name: 'Vermelho', color: '#7d1a1a' }]
    },

    /* ---------- CLÁSSICOS ---------- */
    {
      id: 'montclair-coupe-57', cat: 'classicos', brand: 'Montclair', model: "Coupé '57", year: 1957,
      price: 890000, tag: 'Restaurado', featured: true, img: 'assets/img/montclair-coupe-57.jpg',
      desc: 'Cupê americano de 1957 restaurado peça a peça, com motor V8 original revisado e cromados novos.',
      specs: [['Potência', '220 cv'], ['Ano', '1957'], ['Restauro', '2.400 h'], ['Motor', 'V8 4.6'], ['Placa', 'Preta']],
      finishes: [{ name: 'Verde Mar', color: '#2f8a86' }, { name: 'Branco Marfim', color: '#e9e2cf' }]
    },
    {
      id: 'sierra-fleetwing-59', cat: 'classicos', brand: 'Sierra', model: "Fleetwing '59", year: 1959,
      price: 1150000, tag: 'Coleção', img: 'assets/img/sierra-fleetwing-59.jpg',
      desc: 'O auge das "asas" traseiras: conversível de 1959 com interior em couro vermelho e documentação completa.',
      specs: [['Potência', '325 cv'], ['Ano', '1959'], ['Restauro', '3.100 h'], ['Motor', 'V8 6.4'], ['Placa', 'Preta']],
      finishes: [{ name: 'Vermelho Cereja', color: '#9c1f24' }, { name: 'Branco', color: '#ece8de' }]
    },
    {
      id: 'ravello-gt-veloce-67', cat: 'classicos', brand: 'Ravello', model: "GT Veloce '67", year: 1967,
      price: 1480000, tag: 'Raro', img: 'assets/img/ravello-gt-veloce-67.jpg',
      desc: 'Gran turismo italiano de 1967, um de 312 exemplares, com motor duplo comando e câmbio de cinco marchas.',
      specs: [['Potência', '125 cv'], ['Ano', '1967'], ['Exemplares', '312'], ['Motor', '1.6 duplo comando'], ['Placa', 'Preta']],
      finishes: [{ name: 'Verde Bosco', color: '#2c4a32' }, { name: 'Rosso', color: '#8a1c1c' }]
    },

    /* ---------- MOTORHOMES ---------- */
    {
      id: 'nomad-expedition-4x4', cat: 'motorhomes', brand: 'Nomad', model: 'Expedition 4x4', year: 2025,
      price: 3200000, tag: 'Expedição', featured: true, img: 'assets/img/nomad-expedition-4x4.jpg',
      desc: 'Caminhão de expedição 4x4 com célula habitável, energia solar e água para duas semanas fora da rede.',
      specs: [['Comprimento', '8,2 m'], ['Camas', '4'], ['Tração', '4x4'], ['Energia solar', '1.200 W'], ['Água', '400 L']],
      finishes: [{ name: 'Areia', color: '#c2ad86' }, { name: 'Verde Oliva', color: '#4a5236' }]
    },
    {
      id: 'alcove-grand-9', cat: 'motorhomes', brand: 'Alcove', model: 'Grand 9.0', year: 2024,
      price: 1250000, tag: 'Seminovo · 18.000 km', img: 'assets/img/alcove-grand-9.jpg',
      desc: 'Motorhome de nove metros com quarto de casal, banheiro com box e cozinha com forno.',
      specs: [['Comprimento', '9,0 m'], ['Camas', '6'], ['Tração', '4x2'], ['Energia solar', '600 W'], ['Água', '250 L']],
      finishes: [{ name: 'Branco', color: '#ecebe6' }, { name: 'Prata', color: '#9ea3a8' }]
    },
    {
      id: 'terrano-van-64', cat: 'motorhomes', brand: 'Terrano', model: 'Van 6.4', year: 2026,
      price: 690000, tag: 'Novo', img: 'assets/img/terrano-van-64.jpg',
      desc: 'Van camper compacta que cabe numa vaga comum: cama, cozinha, chuveiro externo e teto elevável.',
      specs: [['Comprimento', '6,4 m'], ['Camas', '2'], ['Tração', '4x2'], ['Energia solar', '400 W'], ['Água', '120 L']],
      finishes: [{ name: 'Branco', color: '#ecebe6' }, { name: 'Laranja', color: '#c25a22' }]
    }
  ]
};
