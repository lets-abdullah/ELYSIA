import { Service } from '../types';

export const SERVICES_DATA: Service[] = [
  {
    id: 'serenity-spa',
    title: 'The Aurum Holistic Spa & Wellness',
    category: 'Spa',
    subtitle: 'Ancient Mineral Rituals & Advanced Hydrotherapy',
    description: 'Immerse your senses in custom hydrotherapy pools, obsidian stone massages, organic pearl body wraps, and bespoke facial treatments designed by master aesthetic therapists.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Thermal Himalayan Salt Sauna & Ice Cave',
      'Hydra-Facial & Diamond Microdermabrasion',
      'Couples Oceanfront Outdoor Massage Pavilion',
      'Custom Botanical Essential Oil Blending',
      'Private Meditation & Yoga Deck'
    ],
    hours: '07:00 AM – 10:00 PM Daily'
  },
  {
    id: 'letoile-dining',
    title: 'L’Étoile Michelin-Starred Fine Dining',
    category: 'Dining',
    subtitle: 'Contemporary French-Mediterranean Gastronomy',
    description: 'Led by Executive Chef Antoine Laurent, L’Étoile transforms seasonal artisanal ingredients into unforgettable culinary art paired with rare grand cru vintages.',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    features: [
      '7-Course Chef’s Tasting Menu with Sommelier Pairing',
      'Glass-Walled Temperature-Controlled Wine Vault',
      'Private Chef’s Table inside Kitchen Sanctuary',
      'Sunset Terrace Seating over Ocean Cliffs'
    ],
    hours: 'Breakfast: 07:00-11:00 | Dinner: 18:30-23:00'
  },
  {
    id: 'bespoke-concierge',
    title: '24/7 Bespoke Butler & VIP Concierge',
    category: 'Concierge',
    subtitle: 'Uncompromising Service Tailored to Your Desires',
    description: 'From private jet chartering and exclusive helipad transfers to rare event ticketing and custom itinerary curation, our Clefs d’Or concierges fulfill every request effortlessly.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Personal Butler Packing & Unpacking Service',
      'Private Helicopter & Yacht Charter Curation',
      'VIP Priority Access to Exclusive Local Venues',
      'In-Suite Private Dining & Cocktail Mixologist'
    ],
    hours: '24 Hours / 7 Days A Week'
  },
  {
    id: 'luxury-transport',
    title: 'Chauffeur Fleet & Private Aviation Transport',
    category: 'Transport',
    subtitle: 'Seamless Mobility in Rolls-Royce & Maybach Vehicles',
    description: 'Travel in ultimate privacy and comfort. Our professional uniformed chauffeurs provide airport pickups, city excursions, and scenic coastal tours.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Rolls-Royce Phantom & Mercedes-Maybach S-Class',
      'Direct Runway Pickup & Fast-Track Customs',
      'Wi-Fi, Champagne & Chilled Refreshments Onboard',
      'Customized Regional Day Tour Itineraries'
    ],
    hours: 'On Demand 24/7'
  }
];
