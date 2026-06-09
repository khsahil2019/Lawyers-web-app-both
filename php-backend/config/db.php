<?php
$dbPath = __DIR__ . '/../database.sqlite';

try {
    $db = new PDO("sqlite:$dbPath");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    initializeDatabase($db);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

function initializeDatabase($db) {
    // 1. Users Table
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'client',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 2. Advocates Table
    $db->exec("CREATE TABLE IF NOT EXISTS advocates (
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
        case_theory_approach TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        profile_image TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // 3. Advocate Cases
    $db->exec("CREATE TABLE IF NOT EXISTS advocate_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        advocate_id INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        result TEXT NOT NULL,
        case_year INTEGER NOT NULL,
        FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE
    )");

    // 4. Articles
    $db->exec("CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT
    )");

    // 5. Constitution Articles
    $db->exec("CREATE TABLE IF NOT EXISTS constitution_articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_number TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        category TEXT NOT NULL
    )");

    // 6. Messages
    $db->exec("CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        sender_phone TEXT,
        advocate_id INTEGER,
        message_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE
    )");

    // Seed data if empty
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $rowCount = $stmt->fetch()['count'];

    if ($rowCount == 0) {
        // Hash passwords
        $defaultPassword = password_hash('password123', PASSWORD_BCRYPT);
        $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);

        // Seed Admin
        $db->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)")
           ->execute(['admin@lexcounsel.in', $adminPassword, 'admin']);

        // Seed Advocates
        $mockAdvocates = [
            [
                'email' => 'malhotra@lexcounsel.in',
                'full_name' => 'Harish Malhotra',
                'bar_number' => 'D/1203/2011',
                'experience_years' => 15,
                'specialty' => 'Criminal',
                'court' => 'Delhi High Court',
                'state' => 'Delhi',
                'district' => 'New Delhi',
                'bio' => 'Senior Criminal Defense lawyer with 15+ years of litigation practice. Specializes in white collar crimes, corporate defense, and constitutional writs.',
                'case_theory_approach' => 'My litigation strategy relies on meticulous pre-trial evidence reviews and client communication. The cross-examination is where criminal trials are won.',
                'contact_phone' => '+91 98765 43210',
                'contact_email' => 'malhotra.law@gmail.com',
                'profile_image' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
                'status' => 'verified',
                'cases' => [
                    ['title' => 'State vs. RK Industries Corp', 'description' => 'Acquitted CFO in 50 Cr fraud case by proving ledger books were fabricated.', 'result' => 'Won', 'case_year' => 2023],
                    ['title' => 'Bail Application of S. Kedia', 'description' => 'Secured regular bail in a disputed money laundering prosecution.', 'result' => 'Won', 'case_year' => 2022]
                ]
            ],
            [
                'email' => 'sharma@lexcounsel.in',
                'full_name' => 'Ananya Sharma',
                'bar_number' => 'MAH/4922/2018',
                'experience_years' => 8,
                'specialty' => 'Family',
                'court' => 'Bombay High Court',
                'state' => 'Maharashtra',
                'district' => 'Mumbai',
                'bio' => 'Dedicated family law advocate dealing with divorce, child custody, domestic relations, and estate planning. Committed to resolving conflicts amicably.',
                'case_theory_approach' => 'I focus heavily on pre-trial mediations to minimize emotional and financial drainage for families.',
                'contact_phone' => '+91 98123 45678',
                'contact_email' => 'ananya.sharma@yahoo.com',
                'profile_image' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
                'status' => 'verified',
                'cases' => [
                    ['title' => 'Deshpande Custody Dispute', 'description' => 'Obtained guardianship rights for the mother with visitation rights for the father.', 'result' => 'Won', 'case_year' => 2024]
                ]
            ],
            [
                'email' => 'iyer@lexcounsel.in',
                'full_name' => 'Rajesh K. Iyer',
                'bar_number' => 'KAR/8431/2014',
                'experience_years' => 12,
                'specialty' => 'Corporate',
                'court' => 'Karnataka High Court',
                'state' => 'Karnataka',
                'district' => 'Bengaluru',
                'bio' => 'Advises tech startups and multinational corporations on mergers & acquisitions, venture capital funding, IP licensing, and contract disputes.',
                'case_theory_approach' => 'My focus is strategic commercial contract designs that shield clients from future courtroom trials.',
                'contact_phone' => '+91 99000 12345',
                'contact_email' => 'rajesh.iyer@iyerassociates.in',
                'profile_image' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
                'status' => 'verified',
                'cases' => [
                    ['title' => 'FinTech Acquisition', 'description' => 'Drafted purchase agreements worth 150 Million USD.', 'result' => 'Settled', 'case_year' => 2023]
                ]
            ],
            [
                'email' => 'priya@lexcounsel.in',
                'full_name' => 'Priya Deshmukh',
                'bar_number' => 'MAH/9320/2020',
                'experience_years' => 6,
                'specialty' => 'Intellectual Property',
                'court' => 'Pune District Court',
                'state' => 'Maharashtra',
                'district' => 'Pune',
                'bio' => 'Focuses on patents, trademarks, copyright registration, and intellectual property litigation. Has successfully represented multiple design firms.',
                'case_theory_approach' => 'Securing digital and mechanical intellectual capital through detailed engineering audits.',
                'contact_phone' => '+91 98666 54321',
                'contact_email' => 'priya.deshmukh@ipshield.com',
                'profile_image' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
                'status' => 'verified',
                'cases' => [
                    ['title' => 'AutoGear Patent Injunction', 'description' => 'Obtained permanent injunction protecting engine valve patent.', 'result' => 'Won', 'case_year' => 2024]
                ]
            ],
            [
                'email' => 'vikram@lexcounsel.in',
                'full_name' => 'Vikram Singh',
                'bar_number' => 'RAJ/3811/2016',
                'experience_years' => 10,
                'specialty' => 'Tax',
                'court' => 'Rajasthan High Court',
                'state' => 'Rajasthan',
                'district' => 'Jaipur',
                'bio' => 'Experienced tax consultant and litigator handling GST disputes, direct tax assessments, and appeals. Helping businesses navigate complex regulatory frames.',
                'case_theory_approach' => 'Strict statutory reading combined with precedents analysis is the best defense in corporate audits.',
                'contact_phone' => '+91 94140 98765',
                'contact_email' => 'vikram.singh@jaipurtax.com',
                'profile_image' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
                'status' => 'verified',
                'cases' => [
                    ['title' => 'Jaipur Minerals GST Dispute', 'description' => 'Successfully appealed input credit denial saving 2.3 Cr.', 'result' => 'Won', 'case_year' => 2023]
                ]
            ],
            [
                'email' => 'amit@lexcounsel.in',
                'full_name' => 'Amit Patel',
                'bar_number' => 'GUJ/7412/2019',
                'experience_years' => 7,
                'specialty' => 'Cyber',
                'court' => 'Gujarat High Court',
                'state' => 'Gujarat',
                'district' => 'Ahmedabad',
                'bio' => 'Cyber security legal advisor specializing in data privacy compliance, cybersecurity breaches, online defamation, and digital fraud representation.',
                'case_theory_approach' => 'Establishing the link between network forensics logs and evidence acts in IT prosecutions.',
                'contact_phone' => '+91 98250 55667',
                'contact_email' => 'amit.patel@cyberlaw.in',
                'profile_image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                'status' => 'verified',
                'cases' => [
                    ['title' => 'NDA Breach Defense', 'description' => 'Proved IP spoofing, securing client acquittal in alleged source code theft.', 'result' => 'Won', 'case_year' => 2024]
                ]
            ]
        ];

        // Seeding advocates
        foreach ($mockAdvocates as $adv) {
            $stmtUser = $db->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
            $stmtUser->execute([$adv['email'], $defaultPassword, 'advocate']);
            $userId = $db->lastInsertId();

            $stmtAdv = $db->prepare("INSERT INTO advocates (user_id, full_name, bar_number, experience_years, specialty, court, state, district, bio, case_theory_approach, contact_phone, contact_email, profile_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmtAdv->execute([
                $userId, $adv['full_name'], $adv['bar_number'], $adv['experience_years'],
                $adv['specialty'], $adv['court'], $adv['state'], $adv['district'],
                $adv['bio'], $adv['case_theory_approach'], $adv['contact_phone'],
                $adv['contact_email'], $adv['profile_image'], $adv['status']
            ]);
            $advocateId = $db->lastInsertId();

            if (isset($adv['cases'])) {
                foreach ($adv['cases'] as $c) {
                    $db->prepare("INSERT INTO advocate_cases (advocate_id, title, description, result, case_year) VALUES (?, ?, ?, ?, ?)")
                       ->execute([$advocateId, $c['title'], $c['description'], $c['result'], $c['case_year']]);
                }
            }
        }

        // Seed Articles
        $mockArticles = [
            [
                'title' => 'What to do if stopped by Traffic Police',
                'category' => 'Daily Life Rules',
                'tags' => 'traffic, police, car, driving, license',
                'content' => "Knowing your rights when stopped by traffic police is essential for every driver. Here are the key rules in India:\n\n1. **Right to ID**: The officer must be in uniform and wear a visible name tag. If in plain clothes, you can ask for identification.\n2. **No Keys Snatching**: The police officer is legally prohibited from snatching your vehicle keys or deflating tires.\n3. **Fine Book Receipt**: Only officers of sub-inspector rank or above can fine you on the spot. If fined, always demand a proper receipt/challan.\n4. **Document Copies**: Under the Motor Vehicles Act, you can show digital copies of your RC, license, and insurance via Digilocker or mParivahan. Physical copies are not strictly required.\n5. **Right to remain in vehicle**: You are not forced to step out of the car unless searching for narcotics or suspected of alcohol influence."
            ],
            [
                'title' => 'A Guide to filing a First Information Report (FIR)',
                'category' => 'Citizen Rights',
                'tags' => 'police, FIR, arrest, crime, police station',
                'content' => "An FIR is a vital document that initiates criminal investigation. Understanding FIR rules is crucial:\n\n1. **Zero FIR**: If a crime occurred outside a police station's jurisdiction, they cannot refuse to register it. They must register a 'Zero FIR' and transfer it to the correct station.\n2. **No Fee**: Registration of an FIR is completely free of charge.\n3. **Free Copy**: You have a legal right to receive a copy of the registered FIR immediately, free of cost.\n4. **Refusal Penalty**: If the police refuse to register your complaint, you can write to the Superintendent of Police (SP) or approach a Judicial Magistrate under Section 156(3) of CrPC."
            ],
            [
                'title' => 'Tenant Rights against Unlawful Eviction',
                'category' => 'Daily Life Rules',
                'tags' => 'rent, tenant, house, eviction, landlord',
                'content' => "Tenants are legally protected against sudden evictions by landlords in India:\n\n1. **Eviction Notice**: A landlord cannot evict you without serving a prior written notice (usually 15 to 30 days) stating valid grounds.\n2. **No Utility Disconnections**: Evicting a tenant by turning off electricity or water lines is strictly illegal.\n3. **Valid Grounds**: Eviction is only valid for non-payment of rent, violating tenancy terms, causing structural damage, or if the landlord needs the property for self-habitation.\n4. **Security Refund**: Security deposit must be refunded in full at the time of vacating."
            ]
        ];

        foreach ($mockArticles as $art) {
            $db->prepare("INSERT INTO articles (title, content, category, tags) VALUES (?, ?, ?, ?)")
               ->execute([$art['title'], $art['content'], $art['category'], $art['tags']]);
        }

        // Seed Constitution Articles
        $mockConstitution = [
            [
                'article_number' => 'Article 14',
                'title' => 'Equality Before Law',
                'summary' => 'Guarantees that every person, citizen or foreigner, is equal before the law and entitled to equal protection of laws within India. It prohibits discrimination on arbitrary grounds.',
                'category' => 'Fundamental Rights'
            ],
            [
                'article_number' => 'Article 19',
                'title' => 'Protection of Six Freedom Rights',
                'summary' => 'Guarantees citizens: (a) Freedom of speech & expression, (b) Peaceable assembly, (c) Forming unions/cooperatives, (d) Free movement across India, (e) Residing anywhere, and (g) Practicing any trade/profession.',
                'category' => 'Fundamental Rights'
            ],
            [
                'article_number' => 'Article 21',
                'title' => 'Protection of Life and Personal Liberty',
                'summary' => 'No person shall be deprived of their life or personal liberty except according to procedure established by law. This article has been expanded by courts to include rights to privacy, clean air, education, and livelihood.',
                'category' => 'Fundamental Rights'
            ],
            [
                'article_number' => 'Article 32',
                'title' => 'Right to Constitutional Remedies',
                'summary' => 'Empowers citizens to directly petition the Supreme Court of India for enforcement of their Fundamental Rights. The Court can issue Writs (Habeas Corpus, Mandamus, etc.) for corrective actions.',
                'category' => 'Fundamental Rights'
            ]
        ];

        foreach ($mockConstitution as $con) {
            $db->prepare("INSERT INTO constitution_articles (article_number, title, summary, category) VALUES (?, ?, ?, ?)")
               ->execute([$con['article_number'], $con['title'], $con['summary'], $con['category']]);
        }
    }
}
