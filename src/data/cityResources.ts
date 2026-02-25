export interface CityFacility {
  name: string;
  phone: string;
  address: string;
  category: 'shelter' | 'food' | 'medical' | 'bathrooms' | 'power' | 'lockers';
  hours?: string;
}

export interface CityROI {
  erVisitCost: number;
  readmission30dCost: number;
  shelterReferralCost: number;
  annualShelterCost: number;
  source: string;
}

export interface CityData {
  label: string;
  outreachPhone: string;
  outreachLabel: string;
  facilities: CityFacility[];
  roi: CityROI;
}

export const CITY_KEYS = [
  'san-jose',
  'san-francisco',
  'oakland',
  'sacramento',
  'fresno',
  'long-beach',
  'bakersfield',
  'anaheim',
  'santa-ana',
  'riverside',
  'stockton',
  'chula-vista',
  'concord',
  'modesto',
  'santa-rosa',
] as const;

export type CityKey = typeof CITY_KEYS[number];

export const cityResources: Record<CityKey, CityData> = {
  'san-jose': {
    label: 'San Jose',
    outreachPhone: '4085107600',
    outreachLabel: 'HomeFirst Services',
    facilities: [
      { name: 'HomeFirst Services — Boccardo Reception Center', phone: '4085107600', address: '2011 Little Orchard St, San Jose, CA 95125', category: 'shelter', hours: '24/7' },
      { name: 'Sacred Heart Community Service', phone: '4082782000', address: '1381 S 1st St, San Jose, CA 95110', category: 'food', hours: 'Mon–Fri 9am–5pm' },
      { name: 'Gardner Health Services', phone: '4082721111', address: '645 S 2nd St, San Jose, CA 95112', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Billy DeFrank LGBTQ+ Center', phone: '4082938250', address: '938 The Alameda, San Jose, CA 95126', category: 'bathrooms', hours: 'Mon–Fri 10am–6pm' },
      { name: 'San Jose Public Library — Main', phone: '4088082000', address: '150 E San Fernando St, San Jose, CA 95112', category: 'power', hours: 'Mon–Thu 10am–8pm, Fri–Sat 10am–6pm' },
      { name: 'South Bay Community Services', phone: '4082811175', address: '330 Commerce Way, San Jose, CA 95131', category: 'lockers', hours: 'Mon–Fri 9am–5pm' },
    ],
    roi: { erVisitCost: 3200, readmission30dCost: 18500, shelterReferralCost: 85, annualShelterCost: 14000, source: 'UCSF Benioff Homelessness & Housing Initiative 2023' },
  },
  'san-francisco': {
    label: 'San Francisco',
    outreachPhone: '4153557401',
    outreachLabel: 'SF HOT Team',
    facilities: [
      { name: 'MSC South Navigation Center', phone: '4155570390', address: '525 5th St, San Francisco, CA 94107', category: 'shelter', hours: '24/7' },
      { name: 'St. Anthony Foundation Dining Room', phone: '4158928000', address: '150 Golden Gate Ave, San Francisco, CA 94102', category: 'food', hours: 'Mon–Fri 10am–12:30pm' },
      { name: 'Tom Waddell Urban Health Clinic', phone: '4155547400', address: '230 Golden Gate Ave, San Francisco, CA 94102', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Glide Memorial Church Restrooms', phone: '4155742100', address: '330 Ellis St, San Francisco, CA 94102', category: 'bathrooms', hours: 'Daily 9am–5pm' },
      { name: 'SF Public Library — Main', phone: '4155575400', address: '100 Larkin St, San Francisco, CA 94102', category: 'power', hours: 'Mon–Thu 10am–6pm, Sat 10am–6pm' },
      { name: 'Lava Mae Mobile Hygiene', phone: '4159573507', address: 'Various SF locations', category: 'lockers', hours: 'Check lavamae.org' },
    ],
    roi: { erVisitCost: 3800, readmission30dCost: 22000, shelterReferralCost: 95, annualShelterCost: 22500, source: 'SF Dept of Public Health Cost Analysis 2023' },
  },
  'oakland': {
    label: 'Oakland',
    outreachPhone: '5108918950',
    outreachLabel: 'Oakland Street Medicine',
    facilities: [
      { name: 'Henry Robinson Multi-Service Center', phone: '5108320444', address: '1449 Howard St, Oakland, CA 94612', category: 'shelter', hours: '24/7 emergency' },
      { name: 'Alameda County Community Food Bank', phone: '5107773700', address: '7900 Edgewater Dr, Oakland, CA 94621', category: 'food', hours: 'Mon–Fri 8am–4pm' },
      { name: 'LifeLong Medical Care Oakland', phone: '5106250700', address: '1428 Franklin St, Oakland, CA 94612', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Oakland Public Library — Main', phone: '5102381197', address: '125 14th St, Oakland, CA 94612', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Oakland Public Library — Charging', phone: '5102381197', address: '125 14th St, Oakland, CA 94612', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'BOSS (Building Opportunities for Self-Sufficiency)', phone: '5106488696', address: '1918 University Ave, Berkeley, CA 94704', category: 'lockers', hours: 'Mon–Fri 9am–5pm' },
    ],
    roi: { erVisitCost: 3100, readmission30dCost: 17800, shelterReferralCost: 80, annualShelterCost: 13500, source: 'Alameda County Health Care for the Homeless 2023' },
  },
  'sacramento': {
    label: 'Sacramento',
    outreachPhone: '9164410166',
    outreachLabel: 'Hope Cooperative',
    facilities: [
      { name: 'Volunteers of America — North 16th Street', phone: '9164438737', address: '1321 N 16th St, Sacramento, CA 95811', category: 'shelter', hours: '24/7' },
      { name: 'Loaves & Fishes — Dining Room', phone: '9164469874', address: '1321 N C St, Sacramento, CA 95811', category: 'food', hours: 'Daily 7:30am–9am' },
      { name: 'Sacramento County Homeless Medical Respite', phone: '9167759000', address: '2020 Stockton Blvd, Sacramento, CA 95817', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Sacramento Central Library', phone: '9162645265', address: '828 I St, Sacramento, CA 95814', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Sacramento Central Library — Charging', phone: '9162645265', address: '828 I St, Sacramento, CA 95814', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Union Gospel Mission Sacramento', phone: '9164474536', address: '414 4th St, Sacramento, CA 95814', category: 'lockers', hours: 'Daily 7am–9pm' },
    ],
    roi: { erVisitCost: 2900, readmission30dCost: 16500, shelterReferralCost: 75, annualShelterCost: 12000, source: 'Sacramento County HHS Cost Benefit Study 2022' },
  },
  'fresno': {
    label: 'Fresno',
    outreachPhone: '5594438441',
    outreachLabel: 'Fresno EOC Outreach',
    facilities: [
      { name: 'Poverello House', phone: '5592378323', address: '412 F St, Fresno, CA 93706', category: 'shelter', hours: '24/7' },
      { name: 'Poverello House Dining Room', phone: '5592378323', address: '412 F St, Fresno, CA 93706', category: 'food', hours: 'Daily 7am–7pm' },
      { name: 'Fresno EOC Health Services', phone: '5594438441', address: '1920 Mariposa Mall, Fresno, CA 93721', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Fresno Central Library', phone: '5592173915', address: '2420 Mariposa St, Fresno, CA 93721', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Fresno Central Library — Charging', phone: '5592173915', address: '2420 Mariposa St, Fresno, CA 93721', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Fresno Rescue Mission', phone: '5592680839', address: '310 G St, Fresno, CA 93706', category: 'lockers', hours: 'Daily 8am–5pm' },
    ],
    roi: { erVisitCost: 2700, readmission30dCost: 15200, shelterReferralCost: 65, annualShelterCost: 10500, source: 'Fresno County Dept of Behavioral Health 2022' },
  },
  'long-beach': {
    label: 'Long Beach',
    outreachPhone: '5624956100',
    outreachLabel: 'Mercy House Outreach',
    facilities: [
      { name: 'Courtyard Transitional Center', phone: '5624956100', address: '1523 MLK Jr Ave, Long Beach, CA 90813', category: 'shelter', hours: '24/7' },
      { name: 'Long Beach Rescue Mission', phone: '5624374181', address: '322 Pacific Ave, Long Beach, CA 90802', category: 'food', hours: 'Daily 7am–7pm' },
      { name: 'Long Beach Community Health Centers', phone: '5624272000', address: '3510 E 3rd St, Long Beach, CA 90804', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Long Beach Main Library', phone: '5625706100', address: '101 Pacific Ave, Long Beach, CA 90822', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Long Beach Main Library — Charging', phone: '5625706100', address: '101 Pacific Ave, Long Beach, CA 90822', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Salvation Army Long Beach', phone: '5624911310', address: '1351 Pacific Ave, Long Beach, CA 90813', category: 'lockers', hours: 'Mon–Fri 9am–4pm' },
    ],
    roi: { erVisitCost: 3000, readmission30dCost: 17000, shelterReferralCost: 78, annualShelterCost: 13000, source: 'LA County Homeless Services Cost Analysis 2023' },
  },
  'bakersfield': {
    label: 'Bakersfield',
    outreachPhone: '6613270508',
    outreachLabel: 'Bakersfield Homeless Center',
    facilities: [
      { name: 'Bakersfield Homeless Center', phone: '6613270508', address: '1600 E Truxtun Ave, Bakersfield, CA 93305', category: 'shelter', hours: '24/7' },
      { name: 'Mission at Kern County', phone: '6618615900', address: '830 Beale Ave, Bakersfield, CA 93305', category: 'food', hours: 'Daily 7am–7pm' },
      { name: 'Clinica Sierra Vista', phone: '6618648888', address: '1430 Truxtun Ave, Bakersfield, CA 93301', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Beale Memorial Library', phone: '6618685100', address: '701 Truxtun Ave, Bakersfield, CA 93301', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Beale Memorial Library — Charging', phone: '6618685100', address: '701 Truxtun Ave, Bakersfield, CA 93301', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Salvation Army Bakersfield', phone: '6618722413', address: '819 Sonora St, Bakersfield, CA 93305', category: 'lockers', hours: 'Mon–Fri 9am–5pm' },
    ],
    roi: { erVisitCost: 2600, readmission30dCost: 14500, shelterReferralCost: 60, annualShelterCost: 10000, source: 'Kern County Health Dept 2022' },
  },
  'anaheim': {
    label: 'Anaheim',
    outreachPhone: '7146860017',
    outreachLabel: 'Anaheim Family YMCA',
    facilities: [
      { name: 'Illumination Foundation Anaheim', phone: '7148444673', address: '1240 S State College Blvd, Anaheim, CA 92806', category: 'shelter', hours: '24/7' },
      { name: 'Salvation Army Anaheim', phone: '7149560070', address: '1520 W 16th St, Anaheim, CA 92804', category: 'food', hours: 'Daily 8am–6pm' },
      { name: 'Illumination Foundation Medical', phone: '7148444673', address: '1240 S State College Blvd, Anaheim, CA 92806', category: 'medical', hours: 'Mon–Fri 9am–5pm' },
      { name: 'Anaheim Central Library', phone: '7147655600', address: '500 W Broadway, Anaheim, CA 92805', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Anaheim Central Library — Charging', phone: '7147655600', address: '500 W Broadway, Anaheim, CA 92805', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'OC Rescue Mission', phone: '7145475955', address: '1 Hope Dr, Tustin, CA 92782', category: 'lockers', hours: 'Daily 8am–5pm' },
    ],
    roi: { erVisitCost: 2950, readmission30dCost: 16800, shelterReferralCost: 76, annualShelterCost: 12500, source: 'OC Health Care Agency 2023' },
  },
  'santa-ana': {
    label: 'Santa Ana',
    outreachPhone: '7145695000',
    outreachLabel: 'Mercy House Santa Ana',
    facilities: [
      { name: 'Mercy House — Depot Navigation Center', phone: '7145695000', address: '1000 E Santa Ana Blvd, Santa Ana, CA 92701', category: 'shelter', hours: '24/7' },
      { name: 'Catholic Charities Santa Ana', phone: '7149533980', address: '201 E 4th St, Santa Ana, CA 92701', category: 'food', hours: 'Mon–Fri 8:30am–4:30pm' },
      { name: 'Share Our Selves Medical Clinic', phone: '9495371960', address: '1550 Superior Ave, Costa Mesa, CA 92627', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Santa Ana Public Library', phone: '7146475250', address: '26 Civic Center Plaza, Santa Ana, CA 92701', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Santa Ana Public Library — Charging', phone: '7146475250', address: '26 Civic Center Plaza, Santa Ana, CA 92701', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Salvation Army Santa Ana', phone: '7145424765', address: '818 E 3rd St, Santa Ana, CA 92701', category: 'lockers', hours: 'Mon–Fri 9am–4pm' },
    ],
    roi: { erVisitCost: 2900, readmission30dCost: 16500, shelterReferralCost: 75, annualShelterCost: 12200, source: 'OC Health Care Agency 2023' },
  },
  'riverside': {
    label: 'Riverside',
    outreachPhone: '9513583020',
    outreachLabel: 'Path of Life Ministries',
    facilities: [
      { name: 'Path of Life — Riverside Navigation Center', phone: '9513583020', address: '7th & Brockton, Riverside, CA 92501', category: 'shelter', hours: '24/7' },
      { name: 'Lighthouse Social Services', phone: '9516824845', address: '4296 Green St, Riverside, CA 92501', category: 'food', hours: 'Mon–Fri 9am–3pm' },
      { name: 'Riverside University Health System', phone: '9519556000', address: '26520 Cactus Ave, Moreno Valley, CA 92555', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Riverside Public Library — Main', phone: '9518265311', address: '3581 Mission Inn Ave, Riverside, CA 92501', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Riverside Public Library — Charging', phone: '9518265311', address: '3581 Mission Inn Ave, Riverside, CA 92501', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Salvation Army Riverside', phone: '9518263421', address: '4075 Chicago Ave, Riverside, CA 92507', category: 'lockers', hours: 'Mon–Fri 9am–4pm' },
    ],
    roi: { erVisitCost: 2750, readmission30dCost: 15600, shelterReferralCost: 68, annualShelterCost: 11200, source: 'Riverside County DPSS 2022' },
  },
  'stockton': {
    label: 'Stockton',
    outreachPhone: '2099482601',
    outreachLabel: 'Gospel Center Rescue Mission',
    facilities: [
      { name: 'Gospel Center Rescue Mission', phone: '2099482601', address: '445 S San Joaquin St, Stockton, CA 95203', category: 'shelter', hours: '24/7' },
      { name: 'Emergency Food Bank of Stockton', phone: '2094641065', address: '7 W Scotts Ave, Stockton, CA 95203', category: 'food', hours: 'Mon–Fri 9am–4pm' },
      { name: 'San Joaquin County Health Centers', phone: '2094684240', address: '500 W Hospital Rd, French Camp, CA 95231', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Stockton–San Joaquin County Library', phone: '2099373200', address: '605 N El Dorado St, Stockton, CA 95202', category: 'bathrooms', hours: 'Mon–Thu 10am–7pm' },
      { name: 'Stockton–San Joaquin County Library — Charging', phone: '2099373200', address: '605 N El Dorado St, Stockton, CA 95202', category: 'power', hours: 'Mon–Thu 10am–7pm' },
      { name: 'Salvation Army Stockton', phone: '2099483651', address: '735 N Commerce St, Stockton, CA 95202', category: 'lockers', hours: 'Mon–Fri 9am–5pm' },
    ],
    roi: { erVisitCost: 2650, readmission30dCost: 14800, shelterReferralCost: 63, annualShelterCost: 10800, source: 'San Joaquin County Behavioral Health 2022' },
  },
  'chula-vista': {
    label: 'Chula Vista',
    outreachPhone: '6195795724',
    outreachLabel: 'South Bay Community Services',
    facilities: [
      { name: 'South Bay Community Services', phone: '6195795724', address: '1124 Bay Blvd, Chula Vista, CA 91911', category: 'shelter', hours: 'Mon–Fri 9am–5pm' },
      { name: 'Second Chance Inc.', phone: '6195214200', address: '6145 Imperial Ave, San Diego, CA 92114', category: 'food', hours: 'Mon–Fri 8am–4pm' },
      { name: 'Family Health Centers of San Diego', phone: '6192345353', address: '823 Gateway Center Way, San Diego, CA 92102', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Chula Vista Library — Civic Center', phone: '6195853742', address: '365 F St, Chula Vista, CA 91910', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Chula Vista Library — Charging', phone: '6195853742', address: '365 F St, Chula Vista, CA 91910', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Salvation Army Chula Vista', number: '6194224831', phone: '6194224831', address: '1250 3rd Ave, Chula Vista, CA 91911', category: 'lockers', hours: 'Mon–Fri 9am–4pm' },
    ],
    roi: { erVisitCost: 2850, readmission30dCost: 16200, shelterReferralCost: 72, annualShelterCost: 11800, source: 'San Diego County HHSA 2023' },
  },
  'concord': {
    label: 'Concord',
    outreachPhone: '9256820550',
    outreachLabel: 'Contra Costa Health Services',
    facilities: [
      { name: 'Contra Costa Navigation Center (Brookside)', phone: '9256820550', address: '1 Alvarado Square, Richmond, CA 94801', category: 'shelter', hours: '24/7' },
      { name: 'Food Bank of Contra Costa', phone: '9256764400', address: '4010 Nelson Ave, Concord, CA 94520', category: 'food', hours: 'Mon–Fri 8am–4:30pm' },
      { name: 'Contra Costa Health Plan Clinics', phone: '8774267065', address: '595 Center Ave, Martinez, CA 94553', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Concord Library', phone: '9256465455', address: '2900 Salvio St, Concord, CA 94519', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Concord Library — Charging', phone: '9256465455', address: '2900 Salvio St, Concord, CA 94519', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Salvation Army Concord', phone: '9256841882', address: '2200 Salvio St, Concord, CA 94520', category: 'lockers', hours: 'Mon–Fri 9am–5pm' },
    ],
    roi: { erVisitCost: 2950, readmission30dCost: 16800, shelterReferralCost: 74, annualShelterCost: 12300, source: 'Contra Costa HSD 2022' },
  },
  'modesto': {
    label: 'Modesto',
    outreachPhone: '2095583396',
    outreachLabel: 'Modesto Gospel Mission',
    facilities: [
      { name: 'Modesto Gospel Mission', phone: '2095583396', address: '1400 Yosemite Blvd, Modesto, CA 95354', category: 'shelter', hours: '24/7' },
      { name: 'Second Harvest Food Bank of Stanislaus', phone: '2095292411', address: '1101 Kansas Ave, Modesto, CA 95351', category: 'food', hours: 'Mon–Fri 8am–4pm' },
      { name: 'Stanislaus County Behavioral Health', phone: '8005874636', address: '800 Scenic Dr, Modesto, CA 95350', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Modesto Library — Main', phone: '2095775495', address: '1500 I St, Modesto, CA 95354', category: 'bathrooms', hours: 'Mon–Thu 10am–7pm' },
      { name: 'Modesto Library — Charging', phone: '2095775495', address: '1500 I St, Modesto, CA 95354', category: 'power', hours: 'Mon–Thu 10am–7pm' },
      { name: 'Salvation Army Modesto', phone: '2095214431', address: '320 9th St, Modesto, CA 95354', category: 'lockers', hours: 'Mon–Fri 9am–4pm' },
    ],
    roi: { erVisitCost: 2600, readmission30dCost: 14400, shelterReferralCost: 61, annualShelterCost: 10200, source: 'Stanislaus County HSA 2022' },
  },
  'santa-rosa': {
    label: 'Santa Rosa',
    outreachPhone: '7075488448',
    outreachLabel: 'Sonoma County HOPE',
    facilities: [
      { name: 'Sonoma County HOPE Navigation Center', phone: '7075488448', address: '2819 Santa Rosa Ave, Santa Rosa, CA 95407', category: 'shelter', hours: '24/7' },
      { name: 'Catholic Charities Food Pantry SR', phone: '7075287600', address: '987 Airway Dr, Santa Rosa, CA 95403', category: 'food', hours: 'Mon–Fri 9am–3pm' },
      { name: 'Sonoma County Indian Health Project', phone: '7075664182', address: '144 Stony Point Rd, Santa Rosa, CA 95401', category: 'medical', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Santa Rosa Central Library', phone: '7075432489', address: '211 E St, Santa Rosa, CA 95404', category: 'bathrooms', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Santa Rosa Central Library — Charging', phone: '7075432489', address: '211 E St, Santa Rosa, CA 95404', category: 'power', hours: 'Mon–Thu 10am–8pm' },
      { name: 'Salvation Army Santa Rosa', phone: '7075421313', address: '91 Freemont Dr, Santa Rosa, CA 95401', category: 'lockers', hours: 'Mon–Fri 9am–5pm' },
    ],
    roi: { erVisitCost: 2900, readmission30dCost: 16500, shelterReferralCost: 73, annualShelterCost: 12000, source: 'Sonoma County DBCS 2022' },
  },
};
