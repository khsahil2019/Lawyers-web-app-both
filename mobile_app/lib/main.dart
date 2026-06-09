import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'pages/home_page.dart';
import 'pages/search_page.dart';
import 'pages/matchmaker_page.dart';
import 'pages/resources_page.dart';
import 'pages/auth_page.dart';
import 'pages/dashboard_page.dart';
import 'services/api_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LexCounsel',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF070707),
        primaryColor: const Color(0xFFC5A880),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFC5A880),
          secondary: Color(0xFFC5A880),
          background: Color(0xFF070707),
          surface: Color(0xFF121212),
        ),
        textTheme: GoogleFonts.interTextTheme(
          ThemeData.dark().textTheme,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0D0D0D),
          elevation: 0,
          iconTheme: IconThemeData(color: Color(0xFFC5A880)),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF0D0D0D),
          selectedItemColor: Color(0xFFC5A880),
          unselectedItemColor: Colors.white30,
          selectedLabelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
          unselectedLabelStyle: TextStyle(fontSize: 11),
        ),
      ),
      home: const MainNavigationWrapper(),
    );
  }
}

class MainNavigationWrapper extends StatefulWidget {
  const MainNavigationWrapper({super.key});

  @override
  State<MainNavigationWrapper> createState() => _MainNavigationWrapperState();
}

class _MainNavigationWrapperState extends State<MainNavigationWrapper> {
  int _currentIndex = 0;
  bool _isAuthenticated = false;
  String? _specialtyFilter;
  bool _isCheckingAuth = true;

  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final token = await ApiService.getToken();
    if (token != null) {
      final user = await ApiService.getMe();
      setState(() {
        _isAuthenticated = user != null;
        _isCheckingAuth = false;
      });
    } else {
      setState(() {
        _isAuthenticated = false;
        _isCheckingAuth = false;
      });
    }
  }

  void _onNavigate(int tabIndex, {String? specialty}) {
    setState(() {
      _currentIndex = tabIndex;
      _specialtyFilter = specialty;
    });
  }

  void _onAuthSuccess() {
    setState(() {
      _isAuthenticated = true;
      _currentIndex = 4; // Stay on dashboard
    });
  }

  void _onSignOut() async {
    await ApiService.removeToken();
    setState(() {
      _isAuthenticated = false;
      _currentIndex = 0; // Go to home
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isCheckingAuth) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC5A880)),
          ),
        ),
      );
    }

    final List<Widget> pages = [
      HomePage(onNavigate: _onNavigate),
      SearchPage(initialSpecialty: _specialtyFilter),
      const MatchmakerPage(),
      const ResourcesPage(),
      _isAuthenticated
          ? DashboardPage(onSignOut: _onSignOut)
          : AuthPage(onAuthSuccess: _onAuthSuccess),
    ];

    final List<String> titles = [
      'LexCounsel',
      'Advocate Directory',
      'Legal Matchmaker',
      'Resource Center',
      _isAuthenticated ? 'My Workspace' : 'Workspace Authentication'
    ];

    return Scaffold(
      appBar: _currentIndex == 0 || _currentIndex == 4 && _isAuthenticated
          ? null // Home has custom hero banner, Advocate/Admin dashboards have custom appbars
          : AppBar(
              title: Text(
                titles[_currentIndex],
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.playfairDisplay(
                  color: const Color(0xFFC5A880),
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
              centerTitle: true,
            ),
      body: SafeArea(child: pages[_currentIndex]),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
            if (index != 1) {
              _specialtyFilter = null; // Clear search filter when clicking away
            }
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search_outlined),
            activeIcon: Icon(Icons.search_rounded),
            label: 'Directory',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.psychology_outlined),
            activeIcon: Icon(Icons.psychology_rounded),
            label: 'Matchmaker',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bookmark_outline_rounded),
            activeIcon: Icon(Icons.bookmark_rounded),
            label: 'Resources',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_circle_outlined),
            activeIcon: Icon(Icons.account_circle_rounded),
            label: 'Workspace',
          ),
        ],
      ),
    );
  }
}
