import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8000/api';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:8000/api';
      }
    } catch (_) {}
    return 'http://localhost:8000/api';
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_role');
    await prefs.remove('user_email');
  }

  static Future<String?> getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_role');
  }

  static Future<void> saveUserRole(String role) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_role', role);
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Auth: Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      await saveToken(data['token']);
      await saveUserRole(data['user']['role']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', data['user']['email']);
      return {'success': true, 'user': data['user']};
    } else {
      return {'success': false, 'error': data['error'] ?? 'Login failed'};
    }
  }

  // Auth: Register
  static Future<Map<String, dynamic>> register(Map<String, dynamic> registerData) async {
    final url = Uri.parse('$baseUrl/auth/register');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(registerData),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201 || response.statusCode == 200) {
      await saveToken(data['token']);
      await saveUserRole(data['user']['role']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', data['user']['email']);
      return {'success': true, 'user': data['user']};
    } else {
      return {'success': false, 'error': data['error'] ?? 'Registration failed'};
    }
  }

  // Auth: Get Current Profile
  static Future<Map<String, dynamic>?> getMe() async {
    final token = await getToken();
    if (token == null) return null;

    final url = Uri.parse('$baseUrl/auth/me');
    final headers = await _getHeaders();
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      await removeToken();
      return null;
    }
  }

  // Advocates Search
  static Future<List<dynamic>> getAdvocates({
    String q = '',
    String specialty = '',
    String state = '',
    String district = '',
  }) async {
    var queryParams = <String>[];
    if (q.isNotEmpty) queryParams.add('q=${Uri.encodeComponent(q)}');
    if (specialty.isNotEmpty) queryParams.add('specialty=${Uri.encodeComponent(specialty)}');
    if (state.isNotEmpty) queryParams.add('state=${Uri.encodeComponent(state)}');
    if (district.isNotEmpty) queryParams.add('district=${Uri.encodeComponent(district)}');

    final queryString = queryParams.isNotEmpty ? '?${queryParams.join('&')}' : '';
    final url = Uri.parse('$baseUrl/advocates$queryString');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  // Advocate Details
  static Future<Map<String, dynamic>?> getAdvocateDetails(int id) async {
    final url = Uri.parse('$baseUrl/advocates/$id');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  // Advocate Cases
  static Future<List<dynamic>> getAdvocateCases(int advocateId) async {
    final url = Uri.parse('$baseUrl/advocates/$advocateId/cases');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  // Send Lead Message
  static Future<bool> sendMessage(
    int advocateId,
    String senderName,
    String senderEmail,
    String senderPhone,
    String messageText,
  ) async {
    final url = Uri.parse('$baseUrl/advocates/$advocateId/message');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'sender_name': senderName,
        'sender_email': senderEmail,
        'sender_phone': senderPhone,
        'message_text': messageText,
      }),
    );
    return response.statusCode == 201 || response.statusCode == 200;
  }

  // Advocate Dashboard Data
  static Future<Map<String, dynamic>?> getAdvocateDashboard() async {
    final url = Uri.parse('$baseUrl/dashboard/advocate');
    final headers = await _getHeaders();
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  // Advocate: Update Profile Settings
  static Future<bool> updateAdvocateProfile(Map<String, dynamic> profileData) async {
    final url = Uri.parse('$baseUrl/dashboard/advocate/profile');
    final headers = await _getHeaders();
    final response = await http.put(
      url,
      headers: headers,
      body: jsonEncode(profileData),
    );
    return response.statusCode == 200;
  }

  // Advocate: Add Portfolio Case
  static Future<bool> addCaseStudy(Map<String, dynamic> caseData) async {
    final url = Uri.parse('$baseUrl/dashboard/advocate/cases');
    final headers = await _getHeaders();
    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode(caseData),
    );
    return response.statusCode == 201 || response.statusCode == 200;
  }

  // Advocate: Delete Case Study
  static Future<bool> deleteCaseStudy(int caseId) async {
    final url = Uri.parse('$baseUrl/dashboard/advocate/cases/$caseId');
    final headers = await _getHeaders();
    final response = await http.delete(url, headers: headers);
    return response.statusCode == 200;
  }

  // Articles & Guidelines
  static Future<List<dynamic>> getArticles({String q = '', String category = ''}) async {
    var queryParams = <String>[];
    if (q.isNotEmpty) queryParams.add('q=${Uri.encodeComponent(q)}');
    if (category.isNotEmpty) queryParams.add('category=${Uri.encodeComponent(category)}');

    final queryString = queryParams.isNotEmpty ? '?${queryParams.join('&')}' : '';
    final url = Uri.parse('$baseUrl/articles$queryString');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  // Constitution Articles
  static Future<List<dynamic>> getConstitution({String q = '', String category = ''}) async {
    var queryParams = <String>[];
    if (q.isNotEmpty) queryParams.add('q=${Uri.encodeComponent(q)}');
    if (category.isNotEmpty) queryParams.add('category=${Uri.encodeComponent(category)}');

    final queryString = queryParams.isNotEmpty ? '?${queryParams.join('&')}' : '';
    final url = Uri.parse('$baseUrl/constitution$queryString');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  // AI Matchmaker Matching
  static Future<Map<String, dynamic>?> matchmaker(String description) async {
    final url = Uri.parse('$baseUrl/matchmaker');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'description': description}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  // Admin Dashboard List
  static Future<List<dynamic>> getAdminAdvocates() async {
    final url = Uri.parse('$baseUrl/admin/advocates');
    final headers = await _getHeaders();
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  // Admin Status Update
  static Future<bool> updateAdvocateStatus(int advocateId, String status) async {
    final url = Uri.parse('$baseUrl/admin/advocates/$advocateId/status');
    final headers = await _getHeaders();
    final response = await http.put(
      url,
      headers: headers,
      body: jsonEncode({'status': status}),
    );
    return response.statusCode == 200;
  }
}
