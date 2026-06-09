import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class ProfilePage extends StatefulWidget {
  final Map<String, dynamic> advocate;

  const ProfilePage({super.key, required this.advocate});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _cases = [];
  bool _isLoadingCases = false;

  // Form Fields for Message Lead
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();
  bool _isSendingMessage = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (_tabController.index == 1 && _cases.isEmpty) {
        _fetchCases();
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _fetchCases() async {
    setState(() {
      _isLoadingCases = true;
    });

    try {
      final advocateId = widget.advocate['id'];
      if (advocateId != null) {
        final results = await ApiService.getAdvocateCases(int.parse(advocateId.toString()));
        setState(() {
          _cases = results;
        });
      }
    } catch (e) {
      // Handle error
    } finally {
      setState(() {
        _isLoadingCases = false;
      });
    }
  }

  Future<void> _sendMessage() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSendingMessage = true;
    });

    try {
      final advocateId = widget.advocate['id'];
      if (advocateId != null) {
        final success = await ApiService.sendMessage(
          int.parse(advocateId.toString()),
          _nameController.text,
          _emailController.text,
          _phoneController.text,
          _messageController.text,
        );

        if (mounted) {
          if (success) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Consultation request sent successfully!'),
                backgroundColor: Colors.green,
              ),
            );
            _nameController.clear();
            _emailController.clear();
            _phoneController.clear();
            _messageController.clear();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Failed to send request. Please try again.'),
                backgroundColor: Colors.redAccent,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSendingMessage = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final adv = widget.advocate;
    return Scaffold(
      backgroundColor: const Color(0xFF070707),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Color(0xFFC5A880)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Advocate Profile',
          style: GoogleFonts.playfairDisplay(
            color: const Color(0xFFC5A880),
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Column(
        children: [
          // Header Profile Overview Card
          _buildProfileHeader(adv),

          // Tab Bar Navigation
          Container(
            color: const Color(0xFF0D0D0D),
            child: TabBar(
              controller: _tabController,
              indicatorColor: const Color(0xFFC5A880),
              labelColor: const Color(0xFFC5A880),
              unselectedLabelColor: Colors.white38,
              labelStyle: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
              tabs: const [
                Tab(text: 'Overview'),
                Tab(text: 'Case Portfolio'),
                Tab(text: 'Consultation'),
              ],
            ),
          ),

          // Tab Body Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildOverviewTab(adv),
                _buildCasesTab(),
                _buildConsultationTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader(Map<String, dynamic> adv) {
    return Container(
      padding: const EdgeInsets.all(20.0),
      decoration: const BoxDecoration(
        color: Color(0xFF0D0D0D),
        border: Border(
          bottom: BorderSide(color: Color(0xFF222222), width: 1.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(
              adv['profile_image'] ?? 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop',
              width: 80,
              height: 80,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                width: 80,
                height: 80,
                color: const Color(0xFF222222),
                child: const Icon(Icons.person, color: Color(0xFFC5A880), size: 35),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  adv['full_name'],
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.playfairDisplay(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${adv['specialty']} Specialist',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    color: const Color(0xFFC5A880),
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  adv['court'],
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(color: Colors.white70, fontSize: 13),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on_outlined, color: Colors.white38, size: 14),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        '${adv['district']}, ${adv['state']}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(color: Colors.white38, fontSize: 12),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${adv['experience_years']}+ Yrs',
                      style: GoogleFonts.inter(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewTab(Map<String, dynamic> adv) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Bio
          Text(
            'Professional Biography',
            style: GoogleFonts.playfairDisplay(
              color: const Color(0xFFC5A880),
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            adv['bio'] ?? 'No bio description provided.',
            style: GoogleFonts.inter(
              color: Colors.white70,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),

          // Advocacy Strategy
          Text(
            'Litigation & Advocacy Strategy',
            style: GoogleFonts.playfairDisplay(
              color: const Color(0xFFC5A880),
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            adv['case_theory_approach'] ?? 'Focuses on strategic analysis and court preparation tailored to case merits.',
            style: GoogleFonts.inter(
              color: Colors.white70,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),

          // Bar Council Meta
          Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: const Color(0xFF121212),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF222222)),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_user_rounded, color: Color(0xFFC5A880), size: 28),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Bar Council Number',
                        style: GoogleFonts.inter(color: Colors.white38, fontSize: 11),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        adv['bar_number'] ?? 'N/A',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCasesTab() {
    if (_isLoadingCases) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC5A880)),
        ),
      );
    }

    if (_cases.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.assignment_turned_in_outlined, size: 50, color: Colors.white24),
            const SizedBox(height: 12),
            Text(
              'No public case history recorded',
              style: GoogleFonts.playfairDisplay(
                color: Colors.white38,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(20.0),
      itemCount: _cases.length,
      itemBuilder: (context, index) {
        final c = _cases[index];
        final bool isWon = c['result'] == 'Won';
        final bool isSettled = c['result'] == 'Settled';

        return Container(
          margin: const EdgeInsets.only(bottom: 16.0),
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: const Color(0xFF121212),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF222222)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      c['title'],
                      style: GoogleFonts.playfairDisplay(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isWon
                          ? const Color(0xFF1E3A1E)
                          : isSettled
                              ? const Color(0xFF3E2D1A)
                              : const Color(0xFF3A1E1E),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      c['result'],
                      style: GoogleFonts.inter(
                        color: isWon
                            ? Colors.lightGreenAccent
                            : isSettled
                                ? Colors.orangeAccent
                                : Colors.redAccent,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Year: ${c['case_year']}',
                style: GoogleFonts.inter(color: Colors.white38, fontSize: 11),
              ),
              const SizedBox(height: 10),
              Text(
                c['description'],
                style: GoogleFonts.inter(
                  color: Colors.white70,
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildConsultationTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(20.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Secure Legal Lead Form',
              style: GoogleFonts.playfairDisplay(
                color: const Color(0xFFC5A880),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Fill out the details below to submit a secure consultation inquiry directly to ${widget.advocate['full_name']}.',
              style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
            ),
            const SizedBox(height: 20),

            // Client Name
            TextFormField(
              controller: _nameController,
              validator: (v) => v == null || v.trim().isEmpty ? 'Enter your name' : null,
              style: const TextStyle(color: Colors.white),
              decoration: _buildInputDecoration('Full Name', Icons.person_outline),
            ),
            const SizedBox(height: 16),

            // Client Email
            TextFormField(
              controller: _emailController,
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Enter your email';
                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(v)) return 'Enter a valid email';
                return null;
              },
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.emailAddress,
              decoration: _buildInputDecoration('Email Address', Icons.email_outlined),
            ),
            const SizedBox(height: 16),

            // Client Phone
            TextFormField(
              controller: _phoneController,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.phone,
              decoration: _buildInputDecoration('Phone Number (Optional)', Icons.phone_outlined),
            ),
            const SizedBox(height: 16),

            // Brief Case Description
            TextFormField(
              controller: _messageController,
              validator: (v) => v == null || v.trim().isEmpty ? 'Enter your message details' : null,
              style: const TextStyle(color: Colors.white),
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Describe your dispute / inquiry details',
                labelStyle: TextStyle(color: Colors.white54, fontSize: 14),
                alignLabelWithHint: true,
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
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isSendingMessage ? null : _sendMessage,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC5A880),
                  foregroundColor: Colors.black,
                  disabledBackgroundColor: const Color(0xFFC5A880).withOpacity(0.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: _isSendingMessage
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                        ),
                      )
                    : Text(
                        'Submit Case Lead',
                        style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.white54, fontSize: 14),
      prefixIcon: Icon(icon, color: const Color(0xFFC5A880)),
      filled: true,
      fillColor: const Color(0xFF121212),
      enabledBorder: const OutlineInputBorder(
        borderSide: BorderSide(color: Color(0xFF333333)),
      ),
      focusedBorder: const OutlineInputBorder(
        borderSide: BorderSide(color: Color(0xFFC5A880)),
      ),
      errorBorder: const OutlineInputBorder(
        borderSide: BorderSide(color: Colors.redAccent),
      ),
      focusedErrorBorder: const OutlineInputBorder(
        borderSide: BorderSide(color: Colors.redAccent),
      ),
    );
  }
}
