

export const COUNTRIES = [
  { code: 'DE', name: 'Германия' },
  { code: 'AT', name: 'Австрия' },
  { code: 'BE', name: 'Бельгия' },
  { code: 'BG', name: 'Болгария' },
  { code: 'HR', name: 'Хорватия' },
  { code: 'CY', name: 'Кипр' },
  { code: 'CZ', name: 'Чехия' },
  { code: 'DK', name: 'Дания' },
  { code: 'EE', name: 'Эстония' },
  { code: 'FI', name: 'Финляндия' },
  { code: 'FR', name: 'Франция' },
  { code: 'GR', name: 'Греция' },
  { code: 'HU', name: 'Венгрия' },
  { code: 'IE', name: 'Ирландия' },
  { code: 'IT', name: 'Италия' },
  { code: 'LV', name: 'Латвия' },
  { code: 'LT', name: 'Литва' },
  { code: 'LU', name: 'Люксембург' },
  { code: 'MT', name: 'Мальта' },
  { code: 'NL', name: 'Нидерланды' },
  { code: 'PL', name: 'Польша' },
  { code: 'PT', name: 'Португалия' },
  { code: 'RO', name: 'Румыния' },
  { code: 'SK', name: 'Словакия' },
  { code: 'SI', name: 'Словения' },
  { code: 'ES', name: 'Испания' },
  { code: 'SE', name: 'Швеция' },
  { code: 'CH', name: 'Швейцария' },
  { code: 'RU', name: 'Россия' },
  { code: 'US', name: 'США' },
];

export const EASTERN_EU_COUNTRIES = [
    'Болгария', 'Венгрия', 'Латвия', 'Литва', 'Польша',
    'Румыния', 'Словакия', 'Словения', 'Хорватия', 'Чехия', 'Эстония'
];

export const MOCK_CITIES: Record<string, string[]> = {
    'Германия': ['Berlin', 'München', 'Hamburg', 'Frankfurt am Main', 'Köln', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
    'Австрия': ['Wien', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'],
    'Бельгия': ['Bruxelles', 'Antwerpen', 'Gent', 'Charleroi', 'Liège'],
    'Нидерланды': ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven'],
    'Франция': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg'],
    'Швейцария': ['Zürich', 'Genève', 'Basel', 'Lausanne', 'Bern'],
    'Польша': ['Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk'],
    'Чехия': ['Praha', 'Brno', 'Ostrava', 'Plzeň'],
    'Румыния': ['București', 'Cluj-Napoca', 'Timișoara', 'Iași'],
    'Венгрия': ['Budapest', 'Debrecen', 'Szeged'],
    'Болгария': ['Sofia', 'Plovdiv', 'Varna'],
    'Россия': ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'],
    'США': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
    'Испания': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
    'Италия': ['Roma', 'Milano', 'Napoli', 'Torino'],
    // Fallback for others
    'default': ['Capital City', 'Major City']
};
