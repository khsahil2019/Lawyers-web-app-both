import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class AuthPage extends StatefulWidget {
  final VoidCallback onAuthSuccess;

  const AuthPage({super.key, required this.onAuthSuccess});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  bool _isLogin = true;
  bool _isLoading = false;
  final _formKey = GlobalKey<FormState>();

  // General fields
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String _selectedRole = 'client'; // 'client' or 'advocate'

  // Advocate specific fields
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _barController = TextEditingController();
  final TextEditingController _expController = TextEditingController();
  final TextEditingController _courtController = TextEditingController();
  final TextEditingController _stateController = TextEditingController();
  final TextEditingController _districtController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _bioController = TextEditingController();
  final TextEditingController _theoryController = TextEditingController();

  String _selectedSpecialty = 'Criminal';

  final List<String> _specialties = [
    'Criminal',
    'Corporate',
    'Family',
    'Intellectual Property',
    'Tax',
    'Cyber',
  ];

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _barController.dispose();
    _expController.dispose();
    _courtController.dispose();
    _stateController.dispose();
    _districtController.dispose();
    _phoneController.dispose();
    _bioController.dispose();
    _theoryController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      if (_isLogin) {
        final res = await ApiService.login(
          _emailController.text.trim(),
          _passwordController.text,
        );

        if (mounted) {
          if (res['success']) {
            widget.onAuthSuccess();
          } else {
            _showError(res['error']);
          }
        }
      } else {
        // Register payload
        final Map<String, dynamic> payload = {
          'email': _emailController.text.trim(),
          'password': _passwordController.text,
          'role': _selectedRole,
        };

        if (_selectedRole == 'advocate') {
          payload.addAll({
            'full_name': _nameController.text.trim(),
            'bar_number': _barController.text.trim(),
            'experience_years': int.tryParse(_expController.text.trim()) ?? 0,
            'specialty': _selectedSpecialty,
            'court': _courtController.text.trim(),
            'state': _stateController.text.trim(),
            'district': _districtController.text.trim(),
            'contact_phone': _phoneController.text.trim(),
            'bio': _bioController.text.trim(),
            'case_theory_approach': _theoryController.text.trim(),
          });
        }

        final res = await ApiService.register(payload);

        if (mounted) {
          if (res['success']) {
            _showSuccess(
              _selectedRole == 'advocate'
                  ? 'Registration submitted! Advocate profile is pending admin verification.'
                  : 'Client registration successful.',
            );
            widget.onAuthSuccess();
          } else {
            _showError(res['error']);
          }
        }
      }
    } catch (e) {
      _showError('Connection error: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.redAccent),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            Center(
              child: Text(
                _isLogin ? 'Sign In' : 'Create Account',
                style: GoogleFonts.playfairDisplay(
                  color: const Color(0xFFC5A880),
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Text(
                _isLogin
                    ? 'Welcome back to LexCounsel secure legal workspace.'
                    : 'Join LexCounsel advocate database or request legal services.',
                style: GoogleFonts.inter(color: Colors.white54, fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 32),

            // Email Field
            TextFormField(
              controller: _emailController,
              validator: (v) => v == null || v.trim().isEmpty ? 'Please enter email' : null,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.emailAddress,
              decoration: _buildInputDecoration('Email Address', Icons.email_outlined),
            ),
            const SizedBox(height: 16),

            // Password Field
            TextFormField(
              controller: _passwordController,
              validator: (v) => v == null || v.length < 6 ? 'Password must be 6+ chars' : null,
              style: const TextStyle(color: Colors.white),
              obscureText: true,
              decoration: _buildInputDecoration('Password', Icons.lock_outline),
            ),
            const SizedBox(height: 16),

            // Toggle Register Role
            if (!_isLogin) ...[
              Text(
                'Account Type',
                style: GoogleFonts.inter(
                  color: const Color(0xFFC5A880),
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildRoleButton('client', 'Client / Case Owner'),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildRoleButton('advocate', 'Advocate Profile'),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Advocate profile registration inputs
              if (_selectedRole == 'advocate') _buildAdvocateFormFields(),
            ],

            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC5A880),
                  foregroundColor: Colors.black,
                  disabledBackgroundColor: const Color(0xFFC5A880).withOpacity(0.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                        ),
                      )
                    : Text(
                        _isLogin ? 'Sign In to Workspace' : 'Submit Registration',
                        style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
              ),
            ),
            const SizedBox(height: 16),

            // Toggle link
            Center(
              child: TextButton(
                onPressed: () {
                  setState(() {
                    _isLogin = !_isLogin;
                  });
                },
                child: Text(
                  _isLogin
                      ? "Don't have an account? Sign Up"
                      : 'Already have an account? Sign In',
                  style: GoogleFonts.inter(color: const Color(0xFFC5A880)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleButton(String role, String label) {
    final bool isSelected = _selectedRole == role;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedRole = role;
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFC5A880) : const Color(0xFF121212),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? const Color(0xFFC5A880) : const Color(0xFF333333),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            color: isSelected ? Colors.black : Colors.white70,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildAdvocateFormFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(color: Color(0xFF333333), height: 32),
        Text(
          'Professional Advocate Profile Details',
          style: GoogleFonts.playfairDisplay(
            color: const Color(0xFFC5A880),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),

        // Full Name
        TextFormField(
          controller: _nameController,
          validator: (v) => _selectedRole == 'advocate' && (v == null || v.trim().isEmpty) ? 'Enter full name' : null,
          style: const TextStyle(color: Colors.white),
          decoration: _buildInputDecoration('Full Name', Icons.person_outline),
        ),
        const SizedBox(height: 16),

        // Bar Registration
        TextFormField(
          controller: _barController,
          validator: (v) => _selectedRole == 'advocate' && (v == null || v.trim().isEmpty) ? 'Enter Bar Registration Number' : null,
          style: const TextStyle(color: Colors.white),
          decoration: _buildInputDecoration('Bar Registration # (e.g. D/1203/2011)', Icons.badge_outlined),
        ),
        const SizedBox(height: 16),

        // Experience Years
        TextFormField(
          controller: _expController,
          validator: (v) => _selectedRole == 'advocate' && (v == null || int.tryParse(v.trim()) == null) ? 'Enter valid years of experience' : null,
          style: const TextStyle(color: Colors.white),
          keyboardType: TextInputType.number,
          decoration: _buildInputDecoration('Years of Experience', Icons.history_edu_outlined),
        ),
        const SizedBox(height: 16),

        // Specialty Dropdown
        DropdownButtonFormField<String>(
          value: _selectedSpecialty,
          dropdownColor: const Color(0xFF121212),
          style: GoogleFonts.inter(color: Colors.white),
          decoration: _buildInputDecoration('Practice Specialty', Icons.gavel_rounded),
          onChanged: (v) {
            if (v != null) {
              setState(() {
                _selectedSpecialty = v;
              });
            }
          },
          items: _specialties.map((e) {
            return DropdownMenuItem(value: e, child: Text(e));
          }).toList(),
        ),
        const SizedBox(height: 16),

        // Court of Practice
        TextFormField(
          controller: _courtController,
          validator: (v) => _selectedRole == 'advocate' && (v == null || v.trim().isEmpty) ? 'Enter Primary Court of Practice' : null,
          style: const TextStyle(color: Colors.white),
          decoration: _buildInputDecoration('Primary Court (e.g. Supreme Court)', Icons.account_balance_outlined),
        ),
        const SizedBox(height: 16),

        // Location Info
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _stateController,
                validator: (v) => _selectedRole == 'advocate' && (v == null || v.trim().isEmpty) ? 'Enter state' : null,
                style: const TextStyle(color: Colors.white),
                decoration: _buildInputDecoration('State', Icons.map_outlined),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextFormField(
                controller: _districtController,
                validator: (v) => _selectedRole == 'advocate' && (v == null || v.trim().isEmpty) ? 'Enter district' : null,
                style: const TextStyle(color: Colors.white),
                decoration: _buildInputDecoration('District', Icons.pin_drop_outlined),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Contact Phone
        TextFormField(
          controller: _phoneController,
          validator: (v) => _selectedRole == 'advocate' && (v == null || v.trim().isEmpty) ? 'Enter contact phone' : null,
          style: const TextStyle(color: Colors.white),
          keyboardType: TextInputType.phone,
          decoration: _buildInputDecoration('Public Phone Number', Icons.phone_outlined),
        ),
        const SizedBox(height: 16),

        // Biography
        TextFormField(
          controller: _bioController,
          style: const TextStyle(color: Colors.white),
          maxLines: 3,
          decoration: _buildInputDecoration('Biography Description', Icons.description_outlined),
        ),
        const SizedBox(height: 16),

        // Case Theory Approach
        TextFormField(
          controller: _theoryController,
          style: const TextStyle(color: Colors.white),
          maxLines: 3,
          decoration: _buildInputDecoration('Advocacy & Litigation Strategy', Icons.psychology_outlined),
        ),
      ],
    );
  }

  InputDecoration _buildInputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.white54, fontSize: 13),
      prefixIcon: Icon(icon, color: const Color(0xFFC5A880), size: 20),
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
