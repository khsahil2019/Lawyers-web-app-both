import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'profile_page.dart';

class HomePage extends StatelessWidget {
  final Function(int tabIndex, {String? specialty}) onNavigate;

  const HomePage({super.key, required this.onNavigate});

  final List<Map<String, dynamic>> specialties = const [
    {'name': 'Criminal', 'icon': Icons.gavel_rounded, 'desc': 'Defense & Bail'},
    {'name': 'Corporate', 'icon': Icons.business_rounded, 'desc': 'M&A, Contracts'},
    {'name': 'Family', 'icon': Icons.people_alt_rounded, 'desc': 'Divorce & Custody'},
    {'name': 'Intellectual Property', 'icon': Icons.copyright_rounded, 'desc': 'Patents & TM'},
    {'name': 'Tax', 'icon': Icons.account_balance_wallet_rounded, 'desc': 'GST & Appeals'},
    {'name': 'Cyber', 'icon': Icons.security_rounded, 'desc': 'Data & Online Fraud'},
  ];

  final List<Map<String, dynamic>> pioneers = const [
    {
      'id': 1,
      'full_name': 'Harish Salve',
      'experience_years': 42,
      'specialty': 'Corporate',
      'court': 'Supreme Court of India',
      'bio': 'One of India\'s most prominent senior advocates. Served as Solicitor General of India. Known for high-profile international arbitrations and constitutional matters.',
      'profile_image': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      'state': 'Delhi',
      'district': 'New Delhi',
      'case_theory_approach': 'Combining rigorous statutory interpretation with international law precedents to craft bulletproof corporate protections.'
    },
    {
      'id': 2,
      'full_name': 'Indira Jaising',
      'experience_years': 45,
      'specialty': 'Family',
      'court': 'Supreme Court of India',
      'bio': 'Pioneering feminist advocate and human rights champion. First woman to be appointed Additional Solicitor General of India. Noted for drafting domestic violence laws.',
      'profile_image': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      'state': 'Delhi',
      'district': 'New Delhi',
      'case_theory_approach': 'Litigating with a strong focus on gender equity, human rights, and social justice mandates.'
    },
    {
      'id': 3,
      'full_name': 'Fali S. Nariman',
      'experience_years': 60,
      'specialty': 'Criminal',
      'court': 'Supreme Court of India',
      'bio': 'Legendary constitutional jurist and senior advocate. Awarded Padma Vibhushan. Acted in landmark constitutional judgments defining the basic structure doctrine.',
      'profile_image': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      'state': 'Delhi',
      'district': 'New Delhi',
      'case_theory_approach': 'Defending judicial independence and civil liberty values through strict constitutional adherence.'
    }
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Banner Section
          _buildHeroBanner(context),

          const SizedBox(height: 24),

          // Categories Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              'Select Practice Specialty',
              style: GoogleFonts.playfairDisplay(
                color: const Color(0xFFC5A880),
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Categories Grid
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                mainAxisExtent: 115,
              ),
              itemCount: specialties.length,
              itemBuilder: (context, index) {
                final spec = specialties[index];
                return _buildCategoryCard(context, spec);
              },
            ),
          ),

          const SizedBox(height: 32),

          // Legal Pioneers Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Legal Pioneers of India',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.playfairDisplay(
                      color: const Color(0xFFC5A880),
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () => onNavigate(1),
                  child: Text(
                    'View All',
                    style: GoogleFonts.inter(
                      color: const Color(0xFFC5A880),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Legal Pioneers Carousel/Horizontal List
          SizedBox(
            height: 285,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 12.0),
              itemCount: pioneers.length,
              itemBuilder: (context, index) {
                final pioneer = pioneers[index];
                return _buildPioneerCard(context, pioneer);
              },
            ),
          ),

          const SizedBox(height: 32),

          // Matchmaker Call-To-Action Card
          _buildMatchmakerCTA(context),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildHeroBanner(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF121212), Color(0xFF1E1610)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        border: Border(
          bottom: BorderSide(
            color: Color(0xFFC5A880),
            width: 1.5,
          ),
        ),
      ),
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          Text(
            'LEXCOUNSEL',
            style: GoogleFonts.playfairDisplay(
              color: const Color(0xFFC5A880),
              fontSize: 32,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'India\'s Premier Verified Advocate Network',
            style: GoogleFonts.inter(
              color: Colors.white70,
              fontSize: 16,
              fontWeight: FontWeight.w300,
            ),
          ),
          const SizedBox(height: 24),
          // Search Input Mimic
          GestureDetector(
            onTap: () => onNavigate(1), // Go to directory search
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: const Color(0xFFC5A880).withOpacity(0.5),
                  width: 1.0,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFC5A880).withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.search_rounded,
                    color: Color(0xFFC5A880),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Search lawyers by name, specialty, state...',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        color: Colors.white38,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryCard(BuildContext context, Map<String, dynamic> spec) {
    return InkWell(
      onTap: () => onNavigate(1, specialty: spec['name']),
      borderRadius: BorderRadius.circular(12),
      child: Ink(
        decoration: BoxDecoration(
          color: const Color(0xFF121212),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: const Color(0xFF333333),
            width: 1.0,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                spec['icon'],
                color: const Color(0xFFC5A880),
                size: 24,
              ),
              const SizedBox(height: 6),
              Text(
                spec['name'],
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.playfairDisplay(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                spec['desc'],
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(
                  color: Colors.white54,
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPioneerCard(BuildContext context, Map<String, dynamic> p) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProfilePage(advocate: p),
          ),
        );
      },
      child: Container(
        width: 170,
        margin: const EdgeInsets.symmetric(horizontal: 6.0),
        decoration: BoxDecoration(
          color: const Color(0xFF121212),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: const Color(0xFF2E241F),
            width: 1.0,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: Image.network(
                p['profile_image'],
                height: 120,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: const Color(0xFF222222),
                  height: 120,
                  child: const Icon(Icons.person, color: Color(0xFFC5A880), size: 40),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    p['full_name'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.playfairDisplay(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    p['court'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      color: const Color(0xFFC5A880),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${p['experience_years']}+ Yrs Experience',
                    style: GoogleFonts.inter(
                      color: Colors.white38,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    p['bio'],
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      color: Colors.white60,
                      fontSize: 10,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMatchmakerCTA(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF221A15), Color(0xFF0F0F0F)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFC5A880).withOpacity(0.4),
          width: 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.psychology_rounded,
                color: Color(0xFFC5A880),
                size: 32,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'AI Advocate Matchmaker',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.playfairDisplay(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Explain your legal dispute or query in simple words, and our intelligence engine will analyze the issue to match you with the best-fit verified advocates.',
            style: GoogleFonts.inter(
              color: Colors.white70,
              fontSize: 13,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => onNavigate(2), // Matchmaker tab
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFC5A880),
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
            child: Text(
              'Match Me Now',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
