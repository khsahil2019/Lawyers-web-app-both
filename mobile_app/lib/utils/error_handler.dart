import 'dart:async';
import 'dart:io';

/// Maps any Dart/Flutter exception into a concise, friendly, human-readable
/// message that makes sense to a non-technical user of the LexCounsel app.
class AppError {
  final String title;
  final String message;
  final AppErrorType type;

  const AppError({
    required this.title,
    required this.message,
    required this.type,
  });

  @override
  String toString() => message;
}

enum AppErrorType {
  network,       // No internet / server unreachable
  timeout,       // Server too slow
  auth,          // Authentication / session issue
  server,        // 5xx server errors
  notFound,      // 404 / resource missing
  permission,    // 403 forbidden
  validation,    // Bad input data
  unknown,       // Catch-all
}

class ErrorHandler {
  /// Convert any thrown object into an [AppError] with friendly text.
  static AppError parse(Object error) {
    // No internet connection
    if (error is SocketException) {
      return const AppError(
        title: 'No Connection',
        message: 'You appear to be offline. Please check your Wi-Fi or mobile data and try again.',
        type: AppErrorType.network,
      );
    }

    // Server took too long
    if (error is TimeoutException) {
      return const AppError(
        title: 'Slow Response',
        message: 'The server is taking too long to respond. Please try again in a moment.',
        type: AppErrorType.timeout,
      );
    }

    // HTTP client exceptions (e.g. URL issues)
    if (error is HttpException) {
      return AppError(
        title: 'Connection Problem',
        message: 'We could not reach the LexCounsel servers. Please try again shortly.',
        type: AppErrorType.network,
      );
    }

    // JSON / data format errors
    if (error is FormatException) {
      return const AppError(
        title: 'Data Error',
        message: 'We received unexpected data from the server. Please try again.',
        type: AppErrorType.server,
      );
    }

    // Argument / state errors (programming errors, fall back gracefully)
    if (error is ArgumentError || error is StateError) {
      return const AppError(
        title: 'Something Went Wrong',
        message: 'An unexpected problem occurred. Please restart the app if this continues.',
        type: AppErrorType.unknown,
      );
    }

    // Generic string errors — keep them friendly
    final msg = error.toString().toLowerCase();

    if (msg.contains('connection refused') || msg.contains('network')) {
      return const AppError(
        title: 'Server Unreachable',
        message: 'Cannot connect to the server right now. Please ensure the server is running and try again.',
        type: AppErrorType.network,
      );
    }

    if (msg.contains('401') || msg.contains('unauthorized') || msg.contains('token')) {
      return const AppError(
        title: 'Session Expired',
        message: 'Your session has expired. Please sign in again to continue.',
        type: AppErrorType.auth,
      );
    }

    if (msg.contains('403') || msg.contains('forbidden')) {
      return const AppError(
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
        type: AppErrorType.permission,
      );
    }

    if (msg.contains('404') || msg.contains('not found')) {
      return const AppError(
        title: 'Not Found',
        message: 'The requested information could not be found. It may have been removed.',
        type: AppErrorType.notFound,
      );
    }

    if (msg.contains('500') || msg.contains('internal server')) {
      return const AppError(
        title: 'Server Error',
        message: 'Our servers are experiencing issues. Please try again in a few minutes.',
        type: AppErrorType.server,
      );
    }

    if (msg.contains('timeout') || msg.contains('timed out')) {
      return const AppError(
        title: 'Timed Out',
        message: 'The request timed out. Please check your connection and try again.',
        type: AppErrorType.timeout,
      );
    }

    // Truly unknown — generic but human-friendly
    return const AppError(
      title: 'Something Went Wrong',
      message: 'We encountered an unexpected problem. Please try again, or restart the app if the issue persists.',
      type: AppErrorType.unknown,
    );
  }

  /// Friendly message for when an API returns no results.
  static String noResults(String context) =>
      'No $context found matching your search. Try different keywords or filters.';

  /// Auth-specific friendly messages.
  static String loginFailed(String? serverMessage) {
    if (serverMessage == null || serverMessage.isEmpty) {
      return 'Sign-in failed. Please check your email and password and try again.';
    }
    if (serverMessage.toLowerCase().contains('invalid') ||
        serverMessage.toLowerCase().contains('wrong') ||
        serverMessage.toLowerCase().contains('incorrect')) {
      return 'The email or password you entered is incorrect. Please try again.';
    }
    if (serverMessage.toLowerCase().contains('not found') ||
        serverMessage.toLowerCase().contains('no user')) {
      return 'No account found with this email address. Please sign up first.';
    }
    return serverMessage;
  }

  static String registerFailed(String? serverMessage) {
    if (serverMessage == null || serverMessage.isEmpty) {
      return 'Registration failed. Please check your details and try again.';
    }
    if (serverMessage.toLowerCase().contains('exist') ||
        serverMessage.toLowerCase().contains('taken') ||
        serverMessage.toLowerCase().contains('duplicate')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    return serverMessage;
  }
}
