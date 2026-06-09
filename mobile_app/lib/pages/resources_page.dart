import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class ResourcesPage extends StatefulWidget {
  const ResourcesPage({super.key});

  @override
  State<ResourcesPage> createState() => _ResourcesPageState();
}

class _ResourcesPageState extends State<ResourcesPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();

  List<dynamic> _articles = [];
  List<dynamic> _constitution = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      _fetchData();
    });
    _fetchData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });

    try {
      final query = _searchController.text;
      if (_tabController.index == 0) {
        final results = await ApiService.getArticles(q: query);
        if (!mounted) return;
        setState(() {
          _articles = results;
        });
      } else {
        final results = await ApiService.getConstitution(q: query);
        if (!mounted) return;
        setState(() {
          _constitution = results;
        });
      }
    } catch (e) {
      // Error silently ignored — UI shows empty state
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
        // Tab Header & Search
        Container(
          color: const Color(0xFF0D0D0D),
          child: Column(
            children: [
              TabBar(
                controller: _tabController,
                indicatorColor: const Color(0xFFC5A880),
                labelColor: const Color(0xFFC5A880),
                unselectedLabelColor: Colors.white38,
                labelStyle: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
                tabs: const [
                  Tab(text: 'Citizen Rights & Guides'),
                  Tab(text: 'Simplified Constitution'),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: TextField(
                  controller: _searchController,
                  onSubmitted: (_) => _fetchData(),
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: _tabController.index == 0
                        ? 'Search traffic, landlord rules...'
                        : 'Search Article 14, equality, privacy...',
                    hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                    prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFC5A880), size: 20),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, color: Colors.white38, size: 20),
                            onPressed: () {
                              _searchController.clear();
                              _fetchData();
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: const Color(0xFF161616),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Color(0xFF222222)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Color(0xFFC5A880)),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // List Content
        Expanded(
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC5A880)),
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildArticlesList(),
                    _buildConstitutionList(),
                  ],
                ),
        ),
      ],
    );
  }

  Widget _buildArticlesList() {
    if (_articles.isEmpty) {
      return _buildEmptyState('No legal guides found');
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(12.0),
      itemCount: _articles.length,
      itemBuilder: (context, index) {
        final art = _articles[index];
        return Card(
          color: const Color(0xFF121212),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: Color(0xFF2E241F)),
          ),
          margin: const EdgeInsets.only(bottom: 12),
          child: Theme(
            data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
            child: ExpansionTile(
              iconColor: const Color(0xFFC5A880),
              collapsedIconColor: const Color(0xFFC5A880),
              title: Text(
                art['title'],
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.playfairDisplay(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
              subtitle: Text(
                'Category: ${art['category']}',
                style: GoogleFonts.inter(color: Colors.white38, fontSize: 11),
              ),
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    art['content'],
                    style: GoogleFonts.inter(
                      color: Colors.white70,
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildConstitutionList() {
    if (_constitution.isEmpty) {
      return _buildEmptyState('No constitutional articles found');
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(12.0),
      itemCount: _constitution.length,
      itemBuilder: (context, index) {
        final con = _constitution[index];
        return Card(
          color: const Color(0xFF121212),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: Color(0xFF2E241F)),
          ),
          margin: const EdgeInsets.only(bottom: 12),
          child: Theme(
            data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
            child: ExpansionTile(
              iconColor: const Color(0xFFC5A880),
              collapsedIconColor: const Color(0xFFC5A880),
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF221A15),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFFC5A880).withOpacity(0.3)),
                    ),
                    child: Text(
                      con['article_number'],
                      style: GoogleFonts.inter(
                        color: const Color(0xFFC5A880),
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      con['title'],
                      style: GoogleFonts.playfairDisplay(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ),
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4.0),
                child: Text(
                  'Category: ${con['category']}',
                  style: GoogleFonts.inter(color: Colors.white38, fontSize: 11),
                ),
              ),
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Simplified Legal Intent:',
                        style: GoogleFonts.inter(
                          color: const Color(0xFFC5A880),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        con['summary'],
                        style: GoogleFonts.inter(
                          color: Colors.white70,
                          fontSize: 13,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(String text) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.bookmark_outline_rounded, size: 48, color: Colors.white24),
          const SizedBox(height: 12),
          Text(
            text,
            style: GoogleFonts.playfairDisplay(
              color: Colors.white38,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}
