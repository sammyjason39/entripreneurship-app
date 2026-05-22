import type { CaseStudyContent, CompanySlug, InnovationCardContent } from '@/lib/content-types';

export const COMPANY_SLUGS: CompanySlug[] = ['tesla', 'netflix', 'openai', 'uniqlo', 'ron88'];

export const CASE_STUDIES: CaseStudyContent[] = [
  {
    slug: 'tesla',
    company: 'Tesla',
    type: 'case_study',
    stationNumber: 1,
    sortOrder: 1,
    profile: {
      yearEstablished: '2003',
      founders: 'Martin Eberhard and Marc Tarpenning',
      ceo: 'Elon Musk',
      headquarters: 'Texas, USA',
      businessDescription:
        "Tesla's mission is to accelerate the world's transition to sustainable energy. Tesla is building a world powered by solar energy, running on batteries and transported by electric vehicles. The energy generation and storage products work together with Tesla's electric vehicles to amplify its impact. Under the leadership of CEO Elon Musk, Tesla has achieved significant milestones through its integrated approach that combines advanced battery technology, autonomous driving capabilities, and a direct-to-consumer sales model.",
    },
    caseStudy: {
      title: "Tesla's Ecosystem — Competing with BYD",
      body: 'Founded in February 1995, BYD is a high-tech company devoted to leveraging technological innovations for a better life. After more than 29 years of high-speed growth, BYD has established over 30 industrial parks across 6 continents and played a significant role in industries related to electronics, auto, renewable energy and rail transit. With a focus on energy acquisition, storage, and application, BYD offers comprehensive new energy solutions with zero-emission.',
      question:
        'Imagine you are responsible for designing a next-generation Tesla vehicle that directly competes with BYD, with a strong emphasis on environmental sustainability. What would your ideal future car look like? What innovative features would you integrate, and what strategic approach would you take from design development to market launch?',
    },
  },
  {
    slug: 'netflix',
    company: 'Netflix',
    type: 'case_study',
    stationNumber: 1,
    sortOrder: 2,
    profile: {
      yearEstablished: '1997',
      founders: 'Reed Hastings and Marc Randolph',
      ceo: 'Ted Sarandos and Greg Peters (Co-CEOs)',
      headquarters: 'California, USA',
      businessDescription:
        'Netflix began as a DVD rental service and evolved into a global streaming powerhouse. Today, headquartered in Los Gatos, California, Netflix has transformed the way audiences consume entertainment. Its success is driven by a blend of cutting-edge technology, massive data analytics, and a relentless focus on original content. Netflix continuously invests in innovative content and advanced personalization to stay ahead of competitors such as Disney+, HBO Max, and Amazon Prime Video.',
    },
    caseStudy: {
      title: 'Streaming competition intensifies',
      body: 'Netflix focuses on diverse storytelling, international productions, and interactive content. Its cutting-edge recommendation system and dynamic thumbnails enhance viewer engagement, while data-driven marketing drives global hype. Meanwhile, Disney+ leverages major franchises, HBO Max excels in prestige TV, and Amazon Prime Video capitalizes on sports and retail benefits, making the streaming competition more intense than ever.',
      question:
        'Camera, roll, action! As the film director at Netflix, please create an original series or film concept designed to achieve top ratings within a short time. What unique ideas, technologies, or marketing strategies would you use? How would you execute your vision to compete with rising streaming platforms?',
    },
  },
  {
    slug: 'openai',
    company: 'OpenAI',
    type: 'case_study',
    stationNumber: 1,
    sortOrder: 3,
    profile: {
      yearEstablished: '2015',
      founders: 'Elon Musk, Sam Altman and others',
      headquarters: 'San Francisco, USA',
      businessDescription:
        'OpenAI operates as a hybrid organization, combining non-profit research with for-profit ventures to sustain its operations and fund ambitious projects. Its business model revolves around creating advanced AI systems and offering them through APIs, subscriptions, and partnerships. Products like GPT-4, ChatGPT, and DALL·E have revolutionized industries such as content creation, customer service, education, and software development.\n\nThe company places immense value on ethical AI development, ensuring that its technologies are aligned with human values and do not cause harm. OpenAI generates revenue primarily through enterprise partnerships, licensing its models, and offering subscription-based services like ChatGPT Plus.',
    },
    caseStudy: {
      title: 'Global AI landscape',
      body: 'OpenAI has significantly influenced the global AI landscape. Its technologies are widely used for writing assistance, coding, research, education, automation, and creative work. ChatGPT accelerated the public adoption of generative AI and encouraged businesses worldwide to integrate AI into their operations.',
      question:
        'How can OpenAI maintain its competitive advantage while addressing ethical and regulatory challenges in the rapidly evolving AI industry?',
    },
  },
  {
    slug: 'uniqlo',
    company: 'Uniqlo',
    type: 'case_study',
    stationNumber: 1,
    sortOrder: 4,
    profile: {
      yearEstablished: '1984',
      founders: 'Tadashi Yanai',
      headquarters: 'Japan',
      businessDescription:
        'UNIQLO is a casual wear designer, manufacturer and retailer from Japan. It has been a wholly owned subsidiary of Fast Retailing Co., Ltd since November 2005. Operating under the SPA (Specialty store retailer of Private label Apparel) model, Uniqlo controls every stage of production—from design and manufacturing to retail—ensuring strict quality control and adaptability to market trends.\n\nAs of 2024, Uniqlo has at least 3,600 stores worldwide. The brand has been warmly received in Asian markets and gained popularity in America and Europe.',
    },
    caseStudy: {
      title: 'Growth vs sustainability',
      body: "In 2024, Uniqlo reported its third consecutive year of record earnings, with international revenues rising by 19% and a 4.7% increase in Japan. This success is driven by Uniqlo's focus on functional, high-quality basics rather than fleeting fashion trends. Signature product lines like HeatTech and AIRism highlight the company's dedication to innovative, performance-enhanced apparel.\n\nHowever, Uniqlo's heavy reliance on synthetic fabrics like polyester raises environmental concerns. During washing, these materials shed microfibers that enter waterways, contributing to microplastic pollution and posing risks to marine ecosystems.",
      question:
        'If you were a Uniqlo executive team, how would you balance business growth and sustainability in the next five years? How can Uniqlo enhance product innovation to attract new customer segments without compromising quality?',
    },
  },
  {
    slug: 'ron88',
    company: 'RON88',
    type: 'case_study',
    stationNumber: 1,
    sortOrder: 5,
    profile: {
      yearEstablished: '1993',
      headquarters: 'Indonesia',
      businessDescription:
        'RON88 is an Indonesian bottled water brand aiming to redefine how young consumers perceive hydration. In a highly competitive market dominated by established brands, RON88 seeks to position itself as more than just drinking water — but as a modern lifestyle brand connected to youth culture, digital trends, and everyday experiences.\n\nThe company focuses on premium quality hydration while building a strong emotional connection with Gen Z audiences through creative branding, social media engagement, and community-driven campaigns.',
    },
    caseStudy: {
      title: "Indonesia's Most TikTok-Worthy Water Brand",
      body: "Indonesia's Gen Z consumers spend hours daily consuming short-form content on platforms such as TikTok and Instagram Reels. Viral trends, aesthetic branding, and relatable storytelling increasingly influence purchasing decisions — even for everyday products like bottled water.\n\nCompetitors aggressively invest in celebrity endorsements, large-scale advertising, sports sponsorships, and lifestyle campaigns. RON88 wants to become Indonesia's Most TikTok-Worthy Water Brand with a digital campaign targeting Gen Z aged 16–24 — but faces limited marketing budget, low national awareness, lack of strong digital identity, and intense competition. RON88 believes that with the right strategy, creativity can outperform budget.",
      question:
        'As the marketing strategy team of RON88, create a digital campaign using social media platforms such as TikTok and/or Instagram that can transform RON88 into a viral Gen Z lifestyle brand in Indonesia.',
    },
  },
];

export const INNOVATION_CARDS: InnovationCardContent[] = [
  {
    slug: 'tesla',
    company: 'Tesla',
    type: 'innovation_card',
    stationNumber: 3,
    sortOrder: 1,
    sections: [
      {
        title: 'Advanced Energy Technologies',
        body: "Tesla's dedication to renewable energy is reflected in its diverse product lineup, including solar panels, the Tesla Solar Roof, and large-scale battery storage solutions like the Megapack. These innovations are designed to build a sustainable energy ecosystem that seamlessly integrates with electric vehicle technology.",
      },
      {
        title: 'Self-Driving Features and We, Robot',
        body: "Tesla's focus on self-driving technology has led to major improvements in its Full Self-Driving (FSD) system. By using a large neural network trained on real-world data from millions of vehicles, Tesla constantly improves its self-driving software. The future of autonomy will be realized through a fleet of autonomous vehicles and robots — Robotaxi, Robovan, and Tesla Optimus.",
      },
      {
        title: 'Supercharging Network',
        body: "One of Tesla's most impactful innovations is its global Supercharger network. This extensive system allows Tesla owners to recharge quickly and easily, reducing range anxiety and making long trips more practical. Features like vehicle-to-grid (V2G) capabilities further improve the efficiency of Tesla's charging ecosystem.",
      },
      {
        title: 'Sophisticated and Ergonomic Car Designs',
        body: "Tesla's design philosophy integrates cutting-edge technology with minimalist, ergonomic aesthetics. Its vehicles are built for both high performance and efficiency while prioritizing an exceptional user experience — intuitive touchscreen controls, spacious interiors, and futuristic exteriors designed for maximum aerodynamic efficiency.",
      },
    ],
  },
  {
    slug: 'netflix',
    company: 'Netflix',
    type: 'innovation_card',
    stationNumber: 3,
    sortOrder: 2,
    sections: [
      {
        title: 'From Film Rental to Streaming Dominance',
        body: "Netflix's transformation from a DVD rental service to a global streaming platform is a remarkable success story. Recognizing the digital shift, the company invested heavily in developing a streaming infrastructure that allowed instant access to films and TV shows — paving the way for on-demand content consumption.",
      },
      {
        title: 'Personalized Technology and Data Analytics',
        body: "One of Netflix's most notable innovations is its personalized recommendation engine. Using advanced algorithms, Netflix analyzes viewing habits, search queries, and user interactions to curate content suggestions tailored to each subscriber.",
      },
      {
        title: 'Innovative Original Film and Series Production',
        body: 'Netflix has invested billions in producing a diverse slate of films and TV series. With groundbreaking projects like Stranger Things, Money Heist, Emily in Paris and Squid Game, Netflix has set new standards for storytelling and production quality.',
      },
      {
        title: 'Social Media Marketing and Audience Engagement',
        body: 'Netflix leverages platforms like Twitter, Instagram, and YouTube to generate buzz around new releases. By using memes, interactive posts, and behind-the-scenes content, Netflix fosters a strong fan community and creates viral marketing moments that drive viewership.',
      },
    ],
  },
  {
    slug: 'openai',
    company: 'OpenAI',
    type: 'innovation_card',
    stationNumber: 3,
    sortOrder: 3,
    sections: [
      {
        title: 'Pioneering the Future of Artificial Intelligence',
        body: "OpenAI, founded in December 2015, has emerged as a frontrunner in AI. With a mission to ensure that AGI benefits all of humanity, the company's growth reflects innovation and ethical AI development — including OpenAI Gym, a toolkit for developing and comparing reinforcement learning algorithms.",
      },
      {
        title: 'Sora — A New Era of AI Video Generation',
        body: 'Sora is a generative AI model that can create videos from text. This technology enables automatic video generation, extends existing video durations, and enhances text understanding. In business, Sora can enhance knowledge management and support entertainment, game development, customer service, and product simulation — with important ethical guardrails around deepfakes and copyright.',
      },
      {
        title: 'First Collaboration in Southeast Asia (Grab)',
        body: "Grab announced collaboration with OpenAI to develop AI for Grab users, partners and employees — including ChatGPT Enterprise for employees, voice and text features for accessibility, AI-powered chatbots for customer support, and faster GrabMaps updates.",
      },
      {
        title: 'The o3-Mini Model',
        body: 'OpenAI launched a new AI model for free, speeding up product releases in response to competition. CEO Sam Altman promised better models and faster releases — introducing o3-mini on January 23, days after DeepSeek unveiled R1.',
      },
    ],
  },
  {
    slug: 'uniqlo',
    company: 'Uniqlo',
    type: 'innovation_card',
    stationNumber: 3,
    sortOrder: 4,
    sections: [
      {
        title: 'LifeWear Philosophy',
        body: "Uniqlo's LifeWear concept focuses on creating high-quality, functional clothing that meets daily needs — simplicity, longevity, and versatility. Each region's culture and lifestyle inform product selection; for example, HeatTech products prominently featured in Osaka during winter.",
      },
      {
        title: 'HeatTech Technology',
        body: 'Developed with Toray Industries, HeatTech fabric retains and generates warmth by absorbing moisture from the body. Despite benefits, reliance on synthetic fibers raises microfiber pollution concerns — Uniqlo and Toray are exploring eco-friendly alternatives.',
      },
      {
        title: 'AIRism Fabric',
        body: 'Toray and Uniqlo partnered for 20 years. AIRism uses ultra-fine fibers that quickly absorb and dry sweat, making it comfortable in hot weather.',
      },
      {
        title: 'Collaborations with Designers',
        body: "Uniqlo collaborates with renowned designers — from Alexander Wang in 2008 to Clare Waight Keller and Jonathan Anderson — blending high-fashion aesthetics with accessibility and faster entry into markets where brand awareness is weaker.",
      },
    ],
  },
  {
    slug: 'ron88',
    company: 'RON88',
    type: 'innovation_card',
    stationNumber: 3,
    sortOrder: 5,
    sections: [
      {
        title: 'Diverse Packaging Solutions',
        body: 'RON88 provides cup packaging, bottles (240 ml, 380 ml, 500 ml, and 600 ml), family-size bottles (1,500 ml), and gallon packaging — meeting different lifestyles and usage occasions.',
      },
      {
        title: 'Strategic Brand Collaborations',
        body: 'RON88 collaborates with globally recognized brands such as Disney, Justice League, Looney Tunes, and Warner Bros. for limited-edition packaging and exclusive product experiences.',
      },
      {
        title: 'Sustainable Glass Packaging Innovation',
        body: 'RON88 introduced premium glass bottle packaging with Indonesian batik motifs — reducing single-use plastic dependence and winning the Asia Packaging Award.',
      },
      {
        title: 'International Quality Recognition',
        body: 'Recognitions include Gold Award from Monde Selection, Superior Taste Award, Hexagonal Crystal Water certification by Masaru Emoto, Superbrands, and Brand Choice Award.',
      },
      {
        title: '100% Natural Mountain Spring Transparency',
        body: 'RON88 sources water from 100% natural mountain springs without drilling. Product labels and scannable barcodes let customers explore the exact spring source location and condition.',
      },
    ],
  },
];

export function getCaseStudy(slug: CompanySlug): CaseStudyContent | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

export function getInnovationCard(slug: CompanySlug): InnovationCardContent | undefined {
  return INNOVATION_CARDS.find((c) => c.slug === slug);
}

export function getPairedInnovationSlug(caseSlug: CompanySlug): CompanySlug {
  return caseSlug;
}
