import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class DashboardPage extends StatefulWidget {
  final VoidCallback onSignOut;

  const DashboardPage({super.key, required this.onSignOut});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage>
    with SingleTickerProviderStateMixin {
  String? _userRole;
  bool _isLoading = true;

  Map<String, dynamic>? _advocateProfile;
  List<dynamic> _advocateMessages = [];
  List<dynamic> _advocateCases = [];
  List<dynamic> _allAdvocates = [];

  final _caseFormKey = GlobalKey<FormState>();
  final TextEditingController _caseTitleController = TextEditingController();
  final TextEditingController _caseDescController = TextEditingController();
  final TextEditingController _caseYearController = TextEditingController();
  String _selectedCaseResult = 'Won';

  final _profileFormKey = GlobalKey<FormState>();
  late TextEditingController _bioController;
  late TextEditingController _theoryController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late TextEditingController _courtController;
  late TextEditingController _expController;

  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _checkRoleAndLoad();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _caseTitleController.dispose();
    _caseDescController.dispose();
    _caseYearController.dispose();
    super.dispose();
  }

  Future<void> _checkRoleAndLoad() async {
    setState(() => _isLoading = true);
    final role = await ApiService.getUserRole();
    setState(() => _userRole = role);
    if (role == 'advocate') {
      await _loadAdvocateDashboard();
    } else if (role == 'admin') {
      await _loadAdminDashboard();
    } else {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadAdvocateDashboard() async {
    try {
      final data = await ApiService.getAdvocateDashboard();
      if (data != null) {
        setState(() {
          _advocateProfile = data['profile'];
          _advocateMessages = data['messages'] ?? [];
          _advocateCases = data['cases'] ?? [];
          _bioController = TextEditingController(text: _advocateProfile!['bio'] ?? '');
          _theoryController = TextEditingController(text: _advocateProfile!['case_theory_approach'] ?? '');
          _phoneController = TextEditingController(text: _advocateProfile!['contact_phone'] ?? '');
          _emailController = TextEditingController(text: _advocateProfile!['contact_email'] ?? '');
          _courtController = TextEditingController(text: _advocateProfile!['court'] ?? '');
          _expController = TextEditingController(text: _advocateProfile!['experience_years']?.toString() ?? '0');
        });
      }
    } catch (e) {
      if (mounted) _showSnackBar('Error loading dashboard: $e', Colors.redAccent);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadAdminDashboard() async {
    try {
      final results = await ApiService.getAdminAdvocates();
      setState(() => _allAdvocates = results);
    } catch (e) {
      if (mounted) _showSnackBar('Error loading admin list: $e', Colors.redAccent);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _addCaseStudy() async {
    if (!_caseFormKey.currentState!.validate()) return;
    final caseData = {
      'title': _caseTitleController.text.trim(),
      'description': _caseDescController.text.trim(),
      'result': _selectedCaseResult,
      'case_year': int.tryParse(_caseYearController.text.trim()) ?? DateTime.now().year,
    };
    final success = await ApiService.addCaseStudy(caseData);
    if (mounted) {
      if (success) {
        _showSnackBar('Case study added successfully!', Colors.green);
        _caseTitleController.clear();
        _caseDescController.clear();
        _caseYearController.clear();
        Navigator.pop(context);
        _loadAdvocateDashboard();
      } else {
        _showSnackBar('Failed to add case study.', Colors.redAccent);
      }
    }
  }

  Future<void> _deleteCaseStudy(int caseId) async {
    final success = await ApiService.deleteCaseStudy(caseId);
    if (mounted) {
      if (success) {
        _showSnackBar('Case study deleted successfully.', Colors.green);
        _loadAdvocateDashboard();
      } else {
        _showSnackBar('Failed to delete case study.', Colors.redAccent);
      }
    }
  }

  Future<void> _saveAdvocateProfile() async {
    if (!_profileFormKey.currentState!.validate()) return;
    final profileData = {
      'bio': _bioController.text.trim(),
      'case_theory_approach': _theoryController.text.trim(),
      'contact_phone': _phoneController.text.trim(),
      'contact_email': _emailController.text.trim(),
      'court': _courtController.text.trim(),
      'experience_years': int.tryParse(_expController.text.trim()) ?? 0,
      'specialty': _advocateProfile!['specialty'] ?? '',
    };
    final success = await ApiService.updateAdvocateProfile(profileData);
    if (mounted) {
      if (success) {
        _showSnackBar('Profile updated successfully!', Colors.green);
        _loadAdvocateDashboard();
      } else {
        _showSnackBar('Failed to save profile.', Colors.redAccent);
      }
    }
  }

  Future<void> _updateStatus(int advocateId, String newStatus) async {
    final success = await ApiService.updateAdvocateStatus(advocateId, newStatus);
    if (mounted) {
      if (success) {
        _showSnackBar('Status updated to $newStatus', Colors.green);
        _loadAdminDashboard();
      } else {
        _showSnackBar('Failed to update status.', Colors.redAccent);
      }
    }
  }

  void _showSnackBar(String text, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(text, overflow: TextOverflow.ellipsis), backgroundColor: color),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC5A880)),
        ),
      );
    }
    if (_userRole == 'client') return _buildClientDashboard();
    if (_userRole == 'advocate') return _buildAdvocateDashboard();
    if (_userRole == 'admin') return _buildAdminDashboard();

    return Center(
      child: ElevatedButton(
        onPressed: widget.onSignOut,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFC5A880),
          foregroundColor: Colors.black,
        ),
        child: Text('Sign Out', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
      ),
    );
  }

  // ─── CLIENT DASHBOARD ────────────────────────────────────────────────────

  Widget _buildClientDashboard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 40),
          const Icon(Icons.account_circle_outlined, color: Color(0xFFC5A880), size: 80),
          const SizedBox(height: 24),
          Text(
            'Client Workspace',
            style: GoogleFonts.playfairDisplay(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            'Welcome to LexCounsel. You are logged in as a Client. You can securely request consultations, search verified advocates, read citizen guidelines, and use the AI Matchmaker.',
            style: GoogleFonts.inter(color: Colors.white70, fontSize: 14, height: 1.5),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: widget.onSignOut,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC5A880),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text('Sign Out Session', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  // ─── ADVOCATE DASHBOARD ───────────────────────────────────────────────────

  Widget _buildAdvocateDashboard() {
    if (_advocateProfile == null) {
      return Center(
        child: Text(
          'Advocate profile could not be loaded.',
          style: GoogleFonts.inter(color: Colors.white54),
        ),
      );
    }
    final status = _advocateProfile!['status'] ?? 'pending';
    final isVerified = status == 'verified';

    return Scaffold(
      backgroundColor: const Color(0xFF070707),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        elevation: 0,
        title: Text(
          'Advocate Portal',
          style: GoogleFonts.playfairDisplay(
            color: const Color(0xFFC5A880),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFC5A880)),
            onPressed: widget.onSignOut,
            tooltip: 'Sign Out',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFC5A880),
          labelColor: const Color(0xFFC5A880),
          unselectedLabelColor: Colors.white38,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          labelStyle: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: const [
            Tab(text: 'Inbox Leads'),
            Tab(text: 'Cases Portfolio'),
            Tab(text: 'Profile Settings'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildInboxTab(status, isVerified),
          _buildAdvocateCasesTab(),
          _buildProfileSettingsTab(),
        ],
      ),
    );
  }

  Widget _buildInboxTab(String status, bool isVerified) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isVerified ? const Color(0xFF1E3A1E) : const Color(0xFF3E2D1A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isVerified ? Colors.lightGreen : Colors.orangeAccent,
                width: 0.5,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  isVerified ? Icons.verified_rounded : Icons.pending_actions_rounded,
                  color: isVerified ? Colors.lightGreenAccent : Colors.orangeAccent,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isVerified ? 'Profile Verified' : 'Verification Pending',
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isVerified
                            ? 'Your profile is publicly searchable in the directory.'
                            : 'Admin is reviewing your credentials. Not publicly visible yet.',
                        style: GoogleFonts.inter(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          Text(
            'Client Lead Messages (${_advocateMessages.length})',
            style: GoogleFonts.playfairDisplay(
              color: const Color(0xFFC5A880),
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),

          if (_advocateMessages.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 32.0),
              child: Center(
                child: Text(
                  'No client lead messages received yet.',
                  style: GoogleFonts.inter(color: Colors.white38),
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _advocateMessages.length,
              itemBuilder: (context, index) {
                final msg = _advocateMessages[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF121212),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF222222)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              msg['sender_name'] ?? '',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            msg['created_at']?.split(' ')[0] ?? '',
                            style: GoogleFonts.inter(color: Colors.white38, fontSize: 10),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${msg['sender_email'] ?? ''} · ${msg['sender_phone'] ?? 'N/A'}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(color: const Color(0xFFC5A880), fontSize: 11),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        msg['message_text'] ?? '',
                        style: GoogleFonts.inter(color: Colors.white70, fontSize: 12, height: 1.4),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildAdvocateCasesTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Portfolios (${_advocateCases.length})',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.playfairDisplay(
                    color: const Color(0xFFC5A880),
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: _showAddCaseDialog,
                icon: const Icon(Icons.add, size: 15, color: Colors.black),
                label: Text(
                  'Add',
                  style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC5A880),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (_advocateCases.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 32.0),
              child: Center(
                child: Text(
                  'No portfolio case histories recorded.',
                  style: GoogleFonts.inter(color: Colors.white38),
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _advocateCases.length,
              itemBuilder: (context, index) {
                final c = _advocateCases[index];
                final isWon = c['result'] == 'Won';
                final isSettled = c['result'] == 'Settled';
                Color resultColor = isWon
                    ? Colors.lightGreenAccent
                    : isSettled
                        ? Colors.orangeAccent
                        : Colors.redAccent;
                Color resultBg = isWon
                    ? const Color(0xFF1E3A1E)
                    : isSettled
                        ? const Color(0xFF3E2D1A)
                        : const Color(0xFF3A1E1E);

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF121212),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF222222)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              c['title'] ?? '',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.playfairDisplay(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          IconButton(
                            constraints: const BoxConstraints(),
                            padding: const EdgeInsets.only(left: 8),
                            icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                            onPressed: () => _deleteCaseStudy(int.parse(c['id'].toString())),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            'Year: ${c['case_year']}',
                            style: GoogleFonts.inter(color: Colors.white38, fontSize: 11),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: resultBg,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              c['result'] ?? '',
                              style: GoogleFonts.inter(color: resultColor, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        c['description'] ?? '',
                        style: GoogleFonts.inter(color: Colors.white70, fontSize: 12, height: 1.4),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  void _showAddCaseDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Dialog(
              backgroundColor: const Color(0xFF121212),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: Color(0xFFC5A880)),
              ),
              insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Form(
                  key: _caseFormKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Record Case Study',
                        style: GoogleFonts.playfairDisplay(
                          color: const Color(0xFFC5A880),
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _caseTitleController,
                        validator: (v) => v == null || v.trim().isEmpty ? 'Enter case title' : null,
                        style: const TextStyle(color: Colors.white),
                        decoration: _buildDialogInput('Case Name / Title'),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _caseYearController,
                        validator: (v) => v == null || int.tryParse(v) == null ? 'Enter valid year' : null,
                        style: const TextStyle(color: Colors.white),
                        keyboardType: TextInputType.number,
                        decoration: _buildDialogInput('Dispute Resolution Year'),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _selectedCaseResult,
                        dropdownColor: const Color(0xFF121212),
                        style: GoogleFonts.inter(color: Colors.white),
                        decoration: _buildDialogInput('Result Outcome'),
                        isExpanded: true,
                        onChanged: (v) {
                          if (v != null) setDialogState(() => _selectedCaseResult = v);
                        },
                        items: const [
                          DropdownMenuItem(value: 'Won', child: Text('Won')),
                          DropdownMenuItem(value: 'Lost', child: Text('Lost')),
                          DropdownMenuItem(value: 'Settled', child: Text('Settled')),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _caseDescController,
                        validator: (v) => v == null || v.trim().isEmpty ? 'Enter description' : null,
                        style: const TextStyle(color: Colors.white),
                        maxLines: 3,
                        decoration: _buildDialogInput('Case details and outcome summary'),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: Text('Cancel', style: GoogleFonts.inter(color: Colors.white38)),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: _addCaseStudy,
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFC5A880)),
                            child: Text(
                              'Save Case',
                              style: GoogleFonts.inter(color: Colors.black, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  InputDecoration _buildDialogInput(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.white54, fontSize: 13),
      enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF333333))),
      focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFFC5A880))),
      errorBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.redAccent)),
      focusedErrorBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.redAccent)),
    );
  }

  Widget _buildProfileSettingsTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _profileFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Profile & Bio Settings',
              style: GoogleFonts.playfairDisplay(
                color: const Color(0xFFC5A880),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _bioController,
              validator: (v) => v == null || v.trim().isEmpty ? 'Biography is required' : null,
              style: const TextStyle(color: Colors.white),
              maxLines: 4,
              decoration: _buildSettingsInput('Professional Biography', Icons.description_outlined),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _theoryController,
              validator: (v) => v == null || v.trim().isEmpty ? 'Strategy is required' : null,
              style: const TextStyle(color: Colors.white),
              maxLines: 3,
              decoration: _buildSettingsInput('Strategic Case Approach', Icons.psychology_outlined),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _phoneController,
              validator: (v) => v == null || v.trim().isEmpty ? 'Phone is required' : null,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.phone,
              decoration: _buildSettingsInput('Public Phone Number', Icons.phone_outlined),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _emailController,
              validator: (v) => v == null || v.trim().isEmpty ? 'Email is required' : null,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.emailAddress,
              decoration: _buildSettingsInput('Public Email Address', Icons.email_outlined),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _courtController,
              validator: (v) => v == null || v.trim().isEmpty ? 'Court is required' : null,
              style: const TextStyle(color: Colors.white),
              decoration: _buildSettingsInput('Court of Practice', Icons.account_balance_outlined),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _expController,
              validator: (v) => v == null || int.tryParse(v) == null ? 'Experience years required' : null,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.number,
              decoration: _buildSettingsInput('Experience Years', Icons.history_edu_outlined),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _saveAdvocateProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC5A880),
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Text(
                  'Update Profile Details',
                  style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  InputDecoration _buildSettingsInput(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.white54, fontSize: 13),
      prefixIcon: Icon(icon, color: const Color(0xFFC5A880), size: 20),
      filled: true,
      fillColor: const Color(0xFF121212),
      enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF222222))),
      focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFC5A880))),
      errorBorder: const OutlineInputBorder(borderSide: BorderSide(color: Colors.redAccent)),
      focusedErrorBorder: const OutlineInputBorder(borderSide: BorderSide(color: Colors.redAccent)),
    );
  }

  // ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────

  Widget _buildAdminDashboard() {
    return Scaffold(
      backgroundColor: const Color(0xFF070707),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        elevation: 0,
        title: Text(
          'Admin Moderation Panel',
          style: GoogleFonts.playfairDisplay(
            color: const Color(0xFFC5A880),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFC5A880)),
            onPressed: widget.onSignOut,
            tooltip: 'Sign Out',
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Advocate Entries (${_allAdvocates.length})',
              style: GoogleFonts.playfairDisplay(
                color: const Color(0xFFC5A880),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            if (_allAdvocates.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 32.0),
                child: Center(
                  child: Text(
                    'No advocate registrations recorded.',
                    style: GoogleFonts.inter(color: Colors.white38),
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _allAdvocates.length,
                itemBuilder: (context, index) {
                  final adv = _allAdvocates[index];
                  final status = adv['status'] ?? 'pending';
                  final isVerified = status == 'verified';
                  final isRejected = status == 'rejected';

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF121212),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF222222)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Name + Badge — always safe with Expanded
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                adv['full_name'] ?? '',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.playfairDisplay(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: isVerified
                                    ? const Color(0xFF1E3A1E)
                                    : isRejected
                                        ? const Color(0xFF3A1E1E)
                                        : const Color(0xFF3E2D1A),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                status.toUpperCase(),
                                style: GoogleFonts.inter(
                                  color: isVerified
                                      ? Colors.lightGreenAccent
                                      : isRejected
                                          ? Colors.redAccent
                                          : Colors.orangeAccent,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Bar: ${adv['bar_number'] ?? ''}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(color: const Color(0xFFC5A880), fontSize: 11),
                        ),
                        Text(
                          '${adv['court'] ?? ''} · ${adv['specialty'] ?? ''}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(color: Colors.white54, fontSize: 11),
                        ),
                        const SizedBox(height: 12),
                        // Action buttons — Wrap prevents overflow on small screens
                        Wrap(
                          alignment: WrapAlignment.end,
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            if (!isVerified)
                              ElevatedButton(
                                onPressed: () => _updateStatus(
                                  int.parse(adv['id'].toString()),
                                  'verified',
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: Text(
                                  'Verify',
                                  style: GoogleFonts.inter(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            if (!isRejected)
                              OutlinedButton(
                                onPressed: () => _updateStatus(
                                  int.parse(adv['id'].toString()),
                                  'rejected',
                                ),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.redAccent),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: Text(
                                  'Reject',
                                  style: GoogleFonts.inter(color: Colors.redAccent, fontSize: 12),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
