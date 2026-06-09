import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import 'profile_page.dart';

class MatchmakerPage extends StatefulWidget {
  const MatchmakerPage({super.key});

  @override
  State<MatchmakerPage> createState() => _MatchmakerPageState();
}

class _MatchmakerPageState extends State<MatchmakerPage> {
  final TextEditingController _descController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  Map<String, dynamic>? _results;

  Future<void> _submitMatchRequest() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _results = null;
    });

    try {
      final res = await ApiService.matchmaker(_descController.text);
      if (res != null) {
        setState(() {
          _results = res;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to get match recommendations. Please try again.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF221A15), Color(0xFF0F0F0F)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFC5A880).withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.psychology_rounded, color: Color(0xFFC5A880), size: 30),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'AI Legal Matchmaker',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.playfairDisplay(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Explain your situation in plain text (e.g. "my landlord is refusing to pay back security deposit" or "got a notice from police for traffic fine"). Our system will automatically classify your dispute and matches you with verified specialists.',
                  style: GoogleFonts.inter(
                    color: Colors.white70,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          _isLoading
              ? _buildLoadingState()
              : _results == null
                  ? _buildInputForm()
                  : _buildResultsState(),
        ],
      ),
    );
  }

  Widget _buildInputForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Describe your issue below:',
            style: GoogleFonts.inter(
              color: const Color(0xFFC5A880),
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _descController,
            validator: (v) {
              if (v == null || v.trim().isEmpty) {
                return 'Please describe your dispute';
              }
              if (v.trim().length < 10) {
                return 'Please write at least 10 characters for a better match';
              }
              return null;
            },
            style: const TextStyle(color: Colors.white),
            maxLines: 6,
            decoration: const InputDecoration(
              hintText: 'Enter case details, landlord issues, bail queries, startup contracts or tax notices...',
              hintStyle: TextStyle(color: Colors.white30, fontSize: 13),
              filled: true,
              fillColor: Color(0xFF121212),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Color(0xFF333333)),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Color(0xFFC5A880)),
              ),
              errorBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Colors.redAccent),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Colors.redAccent),
              ),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: _submitMatchRequest,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC5A880),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                'Run Intelligent Matcher',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 40),
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC5A880)),
          ),
          const SizedBox(height: 20),
          Text(
            'Analyzing legal descriptors...',
            style: GoogleFonts.playfairDisplay(
              color: Colors.white70,
              fontSize: 16,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Mapping specialized keywords and scoring profiles',
            style: GoogleFonts.inter(
              color: Colors.white38,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsState() {
    final specialtyMatched = _results!['specialtyMatched'] ?? 'General Practice';
    final matchScore = _results!['matchScore'] ?? 0;
    final List<dynamic> advocates = _results!['advocates'] ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Match Diagnosis Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF161616),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF2E241F)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MATCH DIAGNOSIS',
                style: GoogleFonts.inter(
                  color: const Color(0xFFC5A880),
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Flexible(
                    child: Text(
                      'Matched specialty:',
                      style: GoogleFonts.inter(color: Colors.white70, fontSize: 13),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      specialtyMatched,
                      textAlign: TextAlign.end,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Flexible(
                    child: Text(
                      'Match Strength:',
                      style: GoogleFonts.inter(color: Colors.white70, fontSize: 13),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: matchScore > 0 ? const Color(0xFF1E3A1E) : const Color(0xFF333333),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      matchScore > 0 ? 'High ($matchScore)' : 'General',
                      style: GoogleFonts.inter(
                        color: matchScore > 0 ? Colors.lightGreenAccent : Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Matched Advocates Title
        Text(
          'Recommended Legal Professionals',
          style: GoogleFonts.playfairDisplay(
            color: const Color(0xFFC5A880),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),

        // Advocates List
        ...advocates.map((adv) => _buildMatchedAdvocateCard(adv)),

        const SizedBox(height: 24),

        // Run Again Button
        SizedBox(
          width: double.infinity,
          height: 44,
          child: OutlinedButton(
            onPressed: () {
              setState(() {
                _results = null;
              });
            },
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFC5A880)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              'Reset & New Match',
              style: GoogleFonts.inter(
                color: const Color(0xFFC5A880),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMatchedAdvocateCard(Map<String, dynamic> adv) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProfilePage(advocate: adv),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF121212),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF222222)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                adv['profile_image'] ?? 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop',
                width: 60,
                height: 60,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  width: 60,
                  height: 60,
                  color: const Color(0xFF222222),
                  child: const Icon(Icons.person, color: Color(0xFFC5A880), size: 24),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    adv['full_name'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.playfairDisplay(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${adv['specialty']} • ${adv['court']}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      color: const Color(0xFFC5A880),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Experience: ${adv['experience_years']} Years',
                    style: GoogleFonts.inter(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Color(0xFFC5A880)),
          ],
        ),
      ),
    );
  }
}
