import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database:', dbPath);
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'client', -- 'client', 'advocate', 'admin'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Advocates Table
    db.run(`
      CREATE TABLE IF NOT EXISTS advocates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        full_name TEXT NOT NULL,
        bar_number TEXT UNIQUE NOT NULL,
        experience_years INTEGER NOT NULL,
        specialty TEXT NOT NULL,
        court TEXT NOT NULL,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        bio TEXT,
        case_theory_approach TEXT, -- Philosophy/Litigation approach
        contact_phone TEXT,
        contact_email TEXT,
        profile_image TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Advocate Cases Table (Landmark representations / Portfolios)
    db.run(`
      CREATE TABLE IF NOT EXISTS advocate_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        advocate_id INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        result TEXT NOT NULL, -- 'Won', 'Settled', 'Dismissed', 'Pending'
        case_year INTEGER NOT NULL,
        FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE
      )
    `);

    // 4. Articles / Daily Life Rules Table
    db.run(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL, -- 'Daily Life Rules', 'Citizen Rights', 'Legal Guide'
        tags TEXT
      )
    `);

    // 5. Simplified Constitution Table
    db.run(`
      CREATE TABLE IF NOT EXISTS constitution_articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_number TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        category TEXT NOT NULL -- 'Fundamental Rights', 'Duties', 'Directive Principles', 'State Policy'
      )
    `);

    // 6. Messages Table (Leads)
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        sender_phone TEXT,
        advocate_id INTEGER,
        message_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE
      )
    `);

    // Seed data
    seedDatabase();
  });
}

function seedDatabase() {
  db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
    if (err) return;

    if (row.count === 0) {
      console.log("Seeding expanded database tables...");

      const hashPassword = (password) => bcrypt.hashSync(password, 10);
      const defaultPassword = hashPassword('password123');
      const adminPassword = hashPassword('admin123');

      // 1. Seed Admin
      db.run("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", ['admin@lexcounsel.in', adminPassword, 'admin']);

      // 2. Advocates detailed specifications
      const mockAdvocates = [
        {
          email: 'malhotra@lexcounsel.in',
          role: 'advocate',
          full_name: 'Harish Malhotra',
          bar_number: 'D/1203/2011',
          experience_years: 15,
          specialty: 'Criminal',
          court: 'Delhi High Court',
          state: 'Delhi',
          district: 'New Delhi',
          bio: 'Senior Criminal Defense lawyer with 15+ years of trial court and appellate experience. Focused on protecting civil liberties, corporate compliance disputes, and white collar crimes.',
          case_theory_approach: 'My trial strategy relies on extensive pre-trial deposition reviews and meticulous cross-examinations. I believe a case is won or lost in details of the prosecution evidence.',
          contact_phone: '+91 98765 43210',
          contact_email: 'malhotra.law@gmail.com',
          profile_image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
          status: 'verified',
          cases: [
            { title: 'State vs. RK Industries Corp', description: 'Represented CFO accused in a 50 Crore financial evasion conspiracy. Landed complete acquittal by proving fabrication of ledger accounts.', result: 'Won', case_year: 2023 },
            { title: 'In Re: Bail Application of S. Kedia', description: 'Secured high-profile bail for client in an alleged money laundering prosecution under PMLA.', result: 'Won', case_year: 2022 }
          ]
        },
        {
          email: 'sharma@lexcounsel.in',
          role: 'advocate',
          full_name: 'Ananya Sharma',
          bar_number: 'MAH/4922/2018',
          experience_years: 8,
          specialty: 'Family',
          court: 'Bombay High Court',
          state: 'Maharashtra',
          district: 'Mumbai',
          bio: 'Devoted Family Court specialist. Handles complex divorces, mutual consent separations, child guardianship custody, and partition suits with high empathy and confidentiality.',
          case_theory_approach: 'Litigation in family disputes should always be the absolute last resort. I prioritize mediation, helping clients settle conflicts constructively without emotional drainage.',
          contact_phone: '+91 98123 45678',
          contact_email: 'ananya.sharma@yahoo.com',
          profile_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
          status: 'verified',
          cases: [
            { title: 'Aditi Deshpande vs. Sameer Deshpande', description: 'Disputed child custody suit. Obtained sole guardianship for the mother while establishing structured visitation rights for the father.', result: 'Won', case_year: 2024 },
            { title: 'Settlement Dispute of Merchant Estate', description: 'Mediated family partition suit of 12 Crore assets among three siblings without courtroom litigation.', result: 'Settled', case_year: 2023 }
          ]
        },
        {
          email: 'iyer@lexcounsel.in',
          role: 'advocate',
          full_name: 'Rajesh K. Iyer',
          bar_number: 'KAR/8431/2014',
          experience_years: 12,
          specialty: 'Corporate',
          court: 'Karnataka High Court',
          state: 'Karnataka',
          district: 'Bengaluru',
          bio: 'Corporate transactional and advisory counsel. Deals with joint ventures, tech company startup structuring, venture fundings, compliance filings, and M&A.',
          case_theory_approach: 'My philosophy is proactive legal risk mitigation. I design commercial contracts and corporate structures that insulate businesses from future court litigation.',
          contact_phone: '+91 99000 12345',
          contact_email: 'rajesh.iyer@iyerassociates.in',
          profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
          status: 'verified',
          cases: [
            { title: 'Acquisition of FinTech startup by Global Bank', description: 'Drafted and executed acquisitions agreements worth 150 Million USD including intellectual property transfers.', result: 'Settled', case_year: 2023 },
            { title: 'Shareholders dispute in AgriTech Ltd', description: 'Represented minority founders in an oppression and mismanagement petition before NCLT, securing fair buyout valuation.', result: 'Won', case_year: 2022 }
          ]
        },
        {
          email: 'priya@lexcounsel.in',
          role: 'advocate',
          full_name: 'Priya Deshmukh',
          bar_number: 'MAH/9320/2020',
          experience_years: 6,
          specialty: 'Intellectual Property',
          court: 'Pune District Court',
          state: 'Maharashtra',
          district: 'Pune',
          bio: 'Specialist in Patents, Copyrights, and Trademarks. Successfully protected design innovations for automobile giants and software copyrights for multiple firms.',
          case_theory_approach: 'Protecting intellectual capital is vital in modern markets. I combine deep engineering understandings with legal frameworks to secure ironclad patent protection.',
          contact_phone: '+91 98666 54321',
          contact_email: 'priya.deshmukh@ipshield.com',
          profile_image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
          status: 'verified',
          cases: [
            { title: 'AutoGear Corp vs. Dynamic Parts Inc', description: 'Patent infringement suit concerning automobile engine valve designs. Secured a permanent injunction against the infringer.', result: 'Won', case_year: 2024 },
            { title: 'Design Copyright of Fashion Lab Ltd', description: 'Defended designer brand in a copycat design imitation case, securing immediate withdrawal of infringing apparel products.', result: 'Won', case_year: 2023 }
          ]
        },
        {
          email: 'vikram@lexcounsel.in',
          role: 'advocate',
          full_name: 'Vikram Singh',
          bar_number: 'RAJ/3811/2016',
          experience_years: 10,
          specialty: 'Tax',
          court: 'Rajasthan High Court',
          state: 'Rajasthan',
          district: 'Jaipur',
          bio: 'Experienced tax litigator and consultant. Resolving complex GST audits, corporate tax assessments, customs duties classifications, and service tax disputes.',
          case_theory_approach: 'Taxation laws are highly objective. My litigation approach is grounded in solid statutory interpretations and analyzing supreme court precedents.',
          contact_phone: '+91 94140 98765',
          contact_email: 'vikram.singh@jaipurtax.com',
          profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
          status: 'verified',
          cases: [
            { title: 'Jaipur Minerals vs. Commissioner of GST', description: 'Challenged unlawful input tax credit denial, saving the mining concern 2.3 Crore in tax penalty.', result: 'Won', case_year: 2023 },
            { title: 'Royal Resorts Group vs. Income Tax Dept', description: 'Successfully argued appeal before ITAT in high-value asset valuation assessments.', result: 'Won', case_year: 2022 }
          ]
        },
        {
          email: 'amit@lexcounsel.in',
          role: 'advocate',
          full_name: 'Amit Patel',
          bar_number: 'GUJ/7412/2019',
          experience_years: 7,
          specialty: 'Cyber',
          court: 'Gujarat High Court',
          state: 'Gujarat',
          district: 'Ahmedabad',
          bio: 'Cyber security and digital privacy lawyer. Specializes in IT Act prosecutions, online defamation cases, cyber frauds, phishing scams, and corporate data leakage.',
          case_theory_approach: 'Cyber law requires an understanding of both bits and statutes. I bridge technical logs, forensics, and evidence acts to establish a solid defense.',
          contact_phone: '+91 98250 55667',
          contact_email: 'amit.patel@cyberlaw.in',
          profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          status: 'verified',
          cases: [
            { title: 'State vs. J. Shah', description: 'Defended employee accused of violating NDA and intellectual theft. Proved IP spoofing, resulting in discharge.', result: 'Won', case_year: 2024 },
            { title: 'Crypto Scam Injunction', description: 'Secured freezing order on fraudulent digital wallets, recovering assets for victims of a Ponzi scheme.', result: 'Won', case_year: 2023 }
          ]
        }
      ];

      // Insert Advocates and their Cases
      for (const adv of mockAdvocates) {
        db.run(
          "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
          [adv.email, defaultPassword, adv.role],
          function(err) {
            if (err) return;
            const userId = this.lastID;
            db.run(
              `INSERT INTO advocates (user_id, full_name, bar_number, experience_years, specialty, court, state, district, bio, case_theory_approach, contact_phone, contact_email, profile_image, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                userId,
                adv.full_name,
                adv.bar_number,
                adv.experience_years,
                adv.specialty,
                adv.court,
                adv.state,
                adv.district,
                adv.bio,
                adv.case_theory_approach,
                adv.contact_phone,
                adv.contact_email,
                adv.profile_image,
                adv.status
              ],
              function(err) {
                if (err) return;
                const advocateId = this.lastID;
                // Seed cases for this advocate
                if (adv.cases) {
                  for (const c of adv.cases) {
                    db.run(
                      "INSERT INTO advocate_cases (advocate_id, title, description, result, case_year) VALUES (?, ?, ?, ?, ?)",
                      [advocateId, c.title, c.description, c.result, c.case_year]
                    );
                  }
                }
              }
            );
          }
        );
      }

      // 3. Seed Articles / Daily Life Rules
      const mockArticles = [
        {
          title: 'What to do if stopped by Traffic Police',
          category: 'Daily Life Rules',
          tags: 'traffic, police, car, driving, license',
          content: `Knowing your rights when stopped by traffic police is essential for every driver. Here are the key rules in India:\n\n1. **Right to ID**: The officer must be in uniform and wear a visible name tag. If in plain clothes, you can ask for identification.\n2. **No Keys Snatching**: The police officer is legally prohibited from snatching your vehicle keys or deflating tires. If they do, note it down; it violates police regulations.\n3. **Fine Book Receipt**: Only officers of sub-inspector rank or above can fine you on the spot. If fined, always demand a proper receipt/challan.\n4. **Document Copies**: Under the Motor Vehicles Act, you can show digital copies of your RC, license, and insurance via Digilocker or mParivahan. Physical copies are not strictly required.\n5. **Right to remain in vehicle**: You are not forced to step out of the car unless searching for narcotics or suspected of alcohol influence.`
        },
        {
          title: 'A Guide to filing a First Information Report (FIR)',
          category: 'Citizen Rights',
          tags: 'police, FIR, arrest, crime, police station',
          content: `An FIR is a vital document that initiates criminal investigation. Understanding FIR rules is crucial:\n\n1. **Zero FIR**: If a crime occurred outside a police station's jurisdiction, they cannot refuse to register it. They must register a 'Zero FIR' and transfer it to the correct station.\n2. **No Fee**: Registration of an FIR is completely free of charge. Charging money is illegal.\n3. **Free Copy**: You have a legal right to receive a copy of the registered FIR immediately, free of cost.\n4. **Refusal Penalty**: If the police refuse to register your complaint, you can write to the Superintendent of Police (SP) or approach a Judicial Magistrate under Section 156(3) of CrPC.\n5. **Read Before Signing**: Once typed or written, the officer must read out the contents to you. Only sign if it is an accurate statement of your complaint.`
        },
        {
          title: 'Consumer Court: Filing a Complaint against Defective Products',
          category: 'Legal Guide',
          tags: 'consumer, store, product, refund, shopping',
          content: `The Consumer Protection Act 2019 protects buyers from defective goods and poor services:\n\n1. **No Lawyer Required**: You do not need a lawyer to file a complaint in Consumer Commissions. You can draft and argue your own case.\n2. **Territorial Jurisdiction**: You can file a case in a consumer court near your place of residence, rather than where the seller's shop is located.\n3. **Three-Tier System**: Depending on claim value, complaints are filed at District (up to 50 Lakhs), State (50 Lakhs to 2 Crores), or National levels.\n4. **Filing Window**: You must file a complaint within 2 years from the date the defect or cause of dispute arose.\n5. **Refund & Compensation**: You can demand product replacement, full refunds, and additional compensation for mental agony.`
        },
        {
          title: 'Tenant Rights against Unlawful Eviction',
          category: 'Daily Life Rules',
          tags: 'rent, tenant, house, eviction, landlord',
          content: `Tenants are legally protected against sudden evictions by landlords in India:\n\n1. **Eviction Notice**: A landlord cannot evict you without serving a prior written notice (usually 15 to 30 days) stating valid grounds.\n2. **No Utility Disconnections**: Evicting a tenant by turning off electricity or water lines is strictly illegal. The landlord can face criminal action for doing so.\n3. **Valid Grounds**: Eviction is only valid for non-payment of rent, violating tenancy terms, causing structural damage, or if the landlord needs the property for self-habitation.\n4. **Security Refund**: Security deposit must be refunded in full at the time of vacating, minus reasonable wear-and-tear damages.`
        },
        {
          title: 'Maternity Benefit Rights for Female Employees',
          category: 'Citizen Rights',
          tags: 'job, corporate, work, maternity, pregnancy, leave',
          content: `Under the Maternity Benefit Act, working women have comprehensive legal rights:\n\n1. **Paid Leave**: Every female employee who has worked for at least 80 days is entitled to 26 weeks of fully paid maternity leave.\n2. **Protection from Termination**: It is illegal for an employer to terminate or dismiss a female employee during her maternity leave period.\n3. **Creche Facility**: Establishments with 50 or more employees must provide a creche facility within a prescribed distance.\n4. **Medical Bonus**: In addition to paid leave, women are entitled to a medical bonus of up to Rs. 3,500 if pre-natal confinement care is not provided.`
        }
      ];

      for (const art of mockArticles) {
        db.run(
          "INSERT INTO articles (title, content, category, tags) VALUES (?, ?, ?, ?)",
          [art.title, art.content, art.category, art.tags]
        );
      }

      // 4. Seed Constitution Explorer
      const mockConstitution = [
        {
          article_number: 'Article 14',
          title: 'Equality Before Law',
          summary: 'Guarantees that every person, citizen or foreigner, is equal before the law and entitled to equal protection of laws within India. It prohibits discrimination on arbitrary grounds.',
          category: 'Fundamental Rights'
        },
        {
          article_number: 'Article 19',
          title: 'Protection of Six Freedom Rights',
          summary: 'Guarantees citizens: (a) Freedom of speech & expression, (b) Peaceable assembly, (c) Forming unions/cooperatives, (d) Free movement across India, (e) Residing anywhere, and (g) Practicing any trade/profession.',
          category: 'Fundamental Rights'
        },
        {
          article_number: 'Article 21',
          title: 'Protection of Life and Personal Liberty',
          summary: 'No person shall be deprived of their life or personal liberty except according to procedure established by law. This article has been expanded by courts to include rights to privacy, clean air, education, and livelihood.',
          category: 'Fundamental Rights'
        },
        {
          article_number: 'Article 21A',
          title: 'Right to Education',
          summary: 'Declares that the State shall provide free and compulsory education to all children aged six to fourteen years in such a manner as the State may determine.',
          category: 'Fundamental Rights'
        },
        {
          article_number: 'Article 32',
          title: 'Right to Constitutional Remedies',
          summary: 'Empowers citizens to directly petition the Supreme Court of India for enforcement of their Fundamental Rights. The Court can issue Writs (Habeas Corpus, Mandamus, etc.) for corrective actions.',
          category: 'Fundamental Rights'
        },
        {
          article_number: 'Article 51A',
          title: 'Fundamental Duties of Citizens',
          summary: 'Details 11 fundamental duties, including respecting the Constitution & Flag, safeguarding public property, protecting the natural environment, promoting national harmony, and providing education opportunities to children.',
          category: 'Duties'
        },
        {
          article_number: 'Article 44',
          title: 'Uniform Civil Code',
          summary: 'Directs the State to secure for citizens a uniform civil code throughout the territory of India, seeking to standardize personal laws regarding marriage, divorce, and inheritance across communities.',
          category: 'Directive Principles'
        }
      ];

      for (const con of mockConstitution) {
        db.run(
          "INSERT INTO constitution_articles (article_number, title, summary, category) VALUES (?, ?, ?, ?)",
          [con.article_number, con.title, con.summary, con.category]
        );
      }
      console.log("Database successfully seeded with new features data.");
    }
  });
}

// Promisify database actions
export const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export default db;
