import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import 'profile_page.dart';

class SearchPage extends StatefulWidget {
  final String? initialSpecialty;

  const SearchPage({super.key, this.initialSpecialty});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedSpecialty = 'All';
  String _selectedState = 'All';
  List<dynamic> _advocates = [];
  bool _isLoading = false;

  final List<String> _specialties = [
    'All',
    'Criminal',
    'Corporate',
    'Family',
    'Intellectual Property',
    'Tax',
    'Cyber',
  ];

  final List<String> _states = [
    'All',
    'Delhi',
    'Maharashtra',
    'Karnataka',
    'Rajasthan',
    'Gujarat',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialSpecialty != null && _specialties.contains(widget.initialSpecialty)) {
      _selectedSpecialty = widget.initialSpecialty!;
    }
    _fetchAdvocates();
  }

  @override
  void didUpdateWidget(covariant SearchPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialSpecialty != null && widget.initialSpecialty != oldWidget.initialSpecialty) {
      setState(() {
        _selectedSpecialty = widget.initialSpecialty!;
      });
      _fetchAdvocates();
    }
  }

  Future<void> _fetchAdvocates() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });

    try {
      final results = await ApiService.getAdvocates(
        q: _searchController.text,
        specialty: _selectedSpecialty == 'All' ? '' : _selectedSpecialty,
        state: _selectedState == 'All' ? '' : _selectedState,
      );
      if (!mounted) return;
      setState(() {
        _advocates = results;
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading advocates: $e', overflow: TextOverflow.ellipsis),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Filter and Search Header
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: const BoxDecoration(
            color: Color(0xFF0D0D0D),
            border: Border(
              bottom: BorderSide(color: Color(0xFF222222), width: 1.0),
            ),
          ),
          child: Column(
            children: [
              // Search Input
              TextField(
                controller: _searchController,
                onSubmitted: (_) => _fetchAdvocates(),
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search advocates or courts...',
                  hintStyle: const TextStyle(color: Colors.white38),
                  prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFC5A880)),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, color: Colors.white38),
                          onPressed: () {
                            _searchController.clear();
                            _fetchAdvocates();
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: const Color(0xFF161616),
                  contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF333333)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFC5A880)),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Filter Dropdowns
              Row(
                children: [
                  // Specialty Dropdown
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF161616),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF222222)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedSpecialty,
                          isExpanded: true,
                          dropdownColor: const Color(0xFF121212),
                          icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFC5A880)),
                          style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                          onChanged: (String? newValue) {
                            if (newValue != null) {
                              setState(() {
                                _selectedSpecialty = newValue;
                              });
                              _fetchAdvocates();
                            }
                          },
                          items: _specialties.map<DropdownMenuItem<String>>((String value) {
                            return DropdownMenuItem<String>(
                              value: value,
                              child: Text(value, overflow: TextOverflow.ellipsis),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // State Dropdown
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF161616),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF222222)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedState,
                          isExpanded: true,
                          dropdownColor: const Color(0xFF121212),
                          icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFC5A880)),
                          style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                          onChanged: (String? newValue) {
                            if (newValue != null) {
                              setState(() {
                                _selectedState = newValue;
                              });
                              _fetchAdvocates();
                            }
                          },
                          items: _states.map<DropdownMenuItem<String>>((String value) {
                            return DropdownMenuItem<String>(
                              value: value,
                              child: Text(value, overflow: TextOverflow.ellipsis),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Results Section
        Expanded(
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC5A880)),
                  ),
                )
              : _advocates.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.gavel_outlined, size: 64, color: Colors.white24),
                          const SizedBox(height: 16),
                          Text(
                            'No advocates match your search',
                            style: GoogleFonts.playfairDisplay(
                              color: Colors.white54,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Try resetting filters or search terms.',
                            style: GoogleFonts.inter(
                              color: Colors.white38,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.all(16.0),
                      itemCount: _advocates.length,
                      itemBuilder: (context, index) {
                        final adv = _advocates[index];
                        return _buildAdvocateCard(context, adv);
                      },
                    ),
        ),
      ],
    );
  }

  Widget _buildAdvocateCard(BuildContext context, Map<String, dynamic> adv) {
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
        margin: const EdgeInsets.only(bottom: 16.0),
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
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      adv['profile_image'] ?? 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop',
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        width: 70,
                        height: 70,
                        color: const Color(0xFF222222),
                        child: const Icon(Icons.person, color: Color(0xFFC5A880), size: 30),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Advocate Meta Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                adv['full_name'],
                                style: GoogleFonts.playfairDisplay(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 17,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E3A1E),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'Verified',
                                style: GoogleFonts.inter(
                                  color: Colors.lightGreenAccent,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${adv['specialty']} Specialist',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            color: const Color(0xFFC5A880),
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          adv['court'],
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, color: Colors.white38, size: 12),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                '${adv['district']}, ${adv['state']}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.inter(
                                  color: Colors.white38,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '${adv['experience_years']} Yrs',
                              style: GoogleFonts.inter(
                                color: Colors.white70,
                                fontSize: 11,
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
            ),
            Divider(color: const Color(0xFF2E241F), height: 1),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bio Summary',
                    style: GoogleFonts.playfairDisplay(
                      color: const Color(0xFFC5A880),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    adv['bio'] ?? 'No bio provided.',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      color: Colors.white70,
                      fontSize: 12,
                      height: 1.4,
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
}
