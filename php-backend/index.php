<?php
// Enable CORS and headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load database setup
require_once __DIR__ . '/config/db.php';

// Helper: Decode input payload
$inputData = json_decode(file_get_contents('php://input'), true) ?? [];

// Helper: JWT Secret Key
define('JWT_SECRET', 'lexcounsel_secret_key_12345');

// Helper: Base64 Url Encode/Decode
function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}
function base64UrlDecode($data) {
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

// Helper: Generate Token
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode(json_encode($payload));
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    return "$base64Header.$base64Payload." . base64UrlEncode($signature);
}

// Helper: Verify Token
function verifyJWT($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;
    
    $header = base64UrlDecode($parts[0]);
    $payloadJson = base64UrlDecode($parts[1]);
    $signatureProvided = $parts[2];
    
    $payload = json_decode($payloadJson, true);
    if (!$payload) return false;
    
    // Check expiry
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    // Check signature
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode(json_encode($payload));
    $signatureCheck = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    
    if (hash_equals(base64UrlEncode($signatureCheck), $signatureProvided)) {
        return $payload;
    }
    return false;
}

// Helper: Get authenticated user from headers
function getAuthenticatedUser() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : '');
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $userData = verifyJWT($jwt);
        if ($userData) {
            return $userData;
        }
    }
    return null;
}

// Parse Route Request Path
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = str_replace('/api', '', $requestUri);
$method = $_SERVER['REQUEST_METHOD'];

// Switch routing logic
try {
    // 1. POST /api/auth/register
    if ($route === '/auth/register' && $method === 'POST') {
        $email = $inputData['email'] ?? '';
        $password = $inputData['password'] ?? '';
        $role = $inputData['role'] ?? 'client';
        
        if (empty($email) || empty($password) || empty($role)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email, password and role are required.']);
            exit();
        }

        // Check user exists
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already registered.']);
            exit();
        }

        // Hashing and insertion
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmtUser = $db->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
        $stmtUser->execute([$email, $hashed, $role]);
        $userId = $db->lastInsertId();

        if ($role === 'advocate') {
            $fullName = $inputData['full_name'] ?? '';
            $barNumber = $inputData['bar_number'] ?? '';
            $exp = $inputData['experience_years'] ?? 0;
            $specialty = $inputData['specialty'] ?? '';
            $court = $inputData['court'] ?? '';
            $state = $inputData['state'] ?? '';
            $district = $inputData['district'] ?? '';
            $bio = $inputData['bio'] ?? '';
            $caseTheory = $inputData['case_theory_approach'] ?? '';
            $phone = $inputData['contact_phone'] ?? '';
            $contactEmail = $inputData['contact_email'] ?? $email;
            $profileImage = $inputData['profile_image'] ?? 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop';

            if (empty($fullName) || empty($barNumber) || empty($exp) || empty($specialty) || empty($court) || empty($state) || empty($district)) {
                $db->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);
                http_response_code(400);
                echo json_encode(['error' => 'All advocate details are required.']);
                exit();
            }

            // Check bar registration duplicate
            $stmtBar = $db->prepare("SELECT * FROM advocates WHERE bar_number = ?");
            $stmtBar->execute([$barNumber]);
            if ($stmtBar->fetch()) {
                $db->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);
                http_response_code(400);
                echo json_encode(['error' => 'Bar Council Registration Number already registered.']);
                exit();
            }

            $stmtAdv = $db->prepare("INSERT INTO advocates (user_id, full_name, bar_number, experience_years, specialty, court, state, district, bio, case_theory_approach, contact_phone, contact_email, profile_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
            $stmtAdv->execute([
                $userId, $fullName, $barNumber, (int)$exp, $specialty, $court, $state, $district, $bio, $caseTheory, $phone, $contactEmail, $profileImage
            ]);
        }

        $payload = ['id' => $userId, 'email' => $email, 'role' => $role, 'exp' => time() + (7 * 24 * 3600)];
        $token = generateJWT($payload);

        http_response_code(201);
        echo json_encode([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => ['id' => $userId, 'email' => $email, 'role' => $role]
        ]);
        exit();
    }

    // 2. POST /api/auth/login
    elseif ($route === '/auth/login' && $method === 'POST') {
        $email = $inputData['email'] ?? '';
        $password = $inputData['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required.']);
            exit();
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid credentials.']);
            exit();
        }

        $payload = ['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role'], 'exp' => time() + (7 * 24 * 3600)];
        $token = generateJWT($payload);

        echo json_encode([
            'token' => $token,
            'user' => ['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]
        ]);
        exit();
    }

    // 3. GET /api/auth/me
    elseif ($route === '/auth/me' && $method === 'GET') {
        $currentUser = getAuthenticatedUser();
        if (!$currentUser) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized.']);
            exit();
        }

        $stmt = $db->prepare("SELECT id, email, role FROM users WHERE id = ?");
        $stmt->execute([$currentUser['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found.']);
            exit();
        }

        $advocateProfile = null;
        if ($user['role'] === 'advocate') {
            $stmtAdv = $db->prepare("SELECT * FROM advocates WHERE user_id = ?");
            $stmtAdv->execute([$user['id']]);
            $advocateProfile = $stmtAdv->fetch() ?: null;
        }

        echo json_encode(['user' => $user, 'advocateProfile' => $advocateProfile]);
        exit();
    }

    // 4. GET /api/advocates
    elseif ($route === '/advocates' && $method === 'GET') {
        $q = $_GET['q'] ?? '';
        $specialty = $_GET['specialty'] ?? '';
        $state = $_GET['state'] ?? '';
        $district = $_GET['district'] ?? '';

        $sql = "SELECT * FROM advocates WHERE status = 'verified'";
        $params = [];

        if (!empty($q)) {
            $sql .= " AND (full_name LIKE ? OR bio LIKE ? OR court LIKE ?)";
            $params[] = "%$q%";
            $params[] = "%$q%";
            $params[] = "%$q%";
        }
        if (!empty($specialty)) {
            $sql .= " AND specialty = ?";
            $params[] = $specialty;
        }
        if (!empty($state)) {
            $sql .= " AND state LIKE ?";
            $params[] = "%$state%";
        }
        if (!empty($district)) {
            $sql .= " AND district LIKE ?";
            $params[] = "%$district%";
        }

        $sql .= " ORDER BY experience_years DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // 5. GET /api/advocates/{id}
    elseif (preg_match('/^\/advocates\/(\d+)$/', $route, $matches) && $method === 'GET') {
        $advocateId = $matches[1];
        $stmt = $db->prepare("SELECT * FROM advocates WHERE id = ?");
        $stmt->execute([$advocateId]);
        $advocate = $stmt->fetch();

        if (!$advocate) {
            http_response_code(404);
            echo json_encode(['error' => 'Advocate profile not found.']);
            exit();
        }

        echo json_encode($advocate);
        exit();
    }

    // 6. GET /api/advocates/{id}/cases
    elseif (preg_match('/^\/advocates\/(\d+)\/cases$/', $route, $matches) && $method === 'GET') {
        $advocateId = $matches[1];
        $stmt = $db->prepare("SELECT * FROM advocate_cases WHERE advocate_id = ? ORDER BY case_year DESC");
        $stmt->execute([$advocateId]);
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // 7. POST /api/advocates/{id}/message
    elseif (preg_match('/^\/advocates\/(\d+)\/message$/', $route, $matches) && $method === 'POST') {
        $advocateId = $matches[1];
        $senderName = $inputData['sender_name'] ?? '';
        $senderEmail = $inputData['sender_email'] ?? '';
        $senderPhone = $inputData['sender_phone'] ?? '';
        $messageText = $inputData['message_text'] ?? '';

        if (empty($senderName) || empty($senderEmail) || empty($messageText)) {
            http_response_code(400);
            echo json_encode(['error' => 'Sender name, email, and message details are required.']);
            exit();
        }

        $stmtCheck = $db->prepare("SELECT id FROM advocates WHERE id = ?");
        $stmtCheck->execute([$advocateId]);
        if (!$stmtCheck->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Advocate profile not found.']);
            exit();
        }

        $stmt = $db->prepare("INSERT INTO messages (sender_name, sender_email, sender_phone, advocate_id, message_text) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$senderName, $senderEmail, $senderPhone, $advocateId, $messageText]);

        http_response_code(201);
        echo json_encode(['message' => 'Message sent successfully.']);
        exit();
    }

    // 8. GET /api/dashboard/advocate
    elseif ($route === '/dashboard/advocate' && $method === 'GET') {
        $currentUser = getAuthenticatedUser();
        if (!$currentUser || $currentUser['role'] !== 'advocate') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized advocate workspace.']);
            exit();
        }

        $stmtAdv = $db->prepare("SELECT * FROM advocates WHERE user_id = ?");
        $stmtAdv->execute([$currentUser['id']]);
        $advocate = $stmtAdv->fetch();

        if (!$advocate) {
            http_response_code(404);
            echo json_encode(['error' => 'Advocate profile not found.']);
            exit();
        }

        $stmtMsg = $db->prepare("SELECT * FROM messages WHERE advocate_id = ? ORDER BY created_at DESC");
        $stmtMsg->execute([$advocate['id']]);
        $messages = $stmtMsg->fetchAll();

        $stmtCases = $db->prepare("SELECT * FROM advocate_cases WHERE advocate_id = ? ORDER BY case_year DESC");
        $stmtCases->execute([$advocate['id']]);
        $cases = $stmtCases->fetchAll();

        echo json_encode(['profile' => $advocate, 'messages' => $messages, 'cases' => $cases]);
        exit();
    }

    // 9. PUT /api/dashboard/advocate/profile
    elseif ($route === '/dashboard/advocate/profile' && $method === 'PUT') {
        $currentUser = getAuthenticatedUser();
        if (!$currentUser || $currentUser['role'] !== 'advocate') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized advocate workspace.']);
            exit();
        }

        $bio = $inputData['bio'] ?? '';
        $caseTheory = $inputData['case_theory_approach'] ?? '';
        $phone = $inputData['contact_phone'] ?? '';
        $contactEmail = $inputData['contact_email'] ?? '';
        $profileImage = $inputData['profile_image'] ?? '';
        $court = $inputData['court'] ?? '';
        $specialty = $inputData['specialty'] ?? '';
        $exp = $inputData['experience_years'] ?? 0;

        $stmt = $db->prepare("UPDATE advocates SET bio = ?, case_theory_approach = ?, contact_phone = ?, contact_email = ?, profile_image = ?, court = ?, specialty = ?, experience_years = ? WHERE user_id = ?");
        $stmt->execute([$bio, $caseTheory, $phone, $contactEmail, $profileImage, $court, $specialty, (int)$exp, $currentUser['id']]);

        echo json_encode(['message' => 'Profile updated successfully.']);
        exit();
    }

    // 10. POST /api/dashboard/advocate/cases
    elseif ($route === '/dashboard/advocate/cases' && $method === 'POST') {
        $currentUser = getAuthenticatedUser();
        if (!$currentUser || $currentUser['role'] !== 'advocate') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized advocate workspace.']);
            exit();
        }

        $title = $inputData['title'] ?? '';
        $desc = $inputData['description'] ?? '';
        $result = $inputData['result'] ?? '';
        $year = $inputData['case_year'] ?? '';

        if (empty($title) || empty($desc) || empty($result) || empty($year)) {
            http_response_code(400);
            echo json_encode(['error' => 'All case details are required.']);
            exit();
        }

        $stmtAdv = $db->prepare("SELECT id FROM advocates WHERE user_id = ?");
        $stmtAdv->execute([$currentUser['id']]);
        $advocate = $stmtAdv->fetch();

        $stmt = $db->prepare("INSERT INTO advocate_cases (advocate_id, title, description, result, case_year) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$advocate['id'], $title, $desc, $result, (int)$year]);

        http_response_code(201);
        echo json_encode(['message' => 'Case study added successfully.']);
        exit();
    }

    // 11. DELETE /api/dashboard/advocate/cases/{caseId}
    elseif (preg_match('/^\/dashboard\/advocate\/cases\/(\d+)$/', $route, $matches) && $method === 'DELETE') {
        $currentUser = getAuthenticatedUser();
        $caseId = $matches[1];

        if (!$currentUser || $currentUser['role'] !== 'advocate') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized.']);
            exit();
        }

        $stmtAdv = $db->prepare("SELECT id FROM advocates WHERE user_id = ?");
        $stmtAdv->execute([$currentUser['id']]);
        $advocate = $stmtAdv->fetch();

        $stmtCase = $db->prepare("SELECT advocate_id FROM advocate_cases WHERE id = ?");
        $stmtCase->execute([$caseId]);
        $c = $stmtCase->fetch();

        if (!$c || $c['advocate_id'] !== $advocate['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized deletion.']);
            exit();
        }

        $db->prepare("DELETE FROM advocate_cases WHERE id = ?")->execute([$caseId]);
        echo json_encode(['message' => 'Case study deleted successfully.']);
        exit();
    }

    // 12. GET /api/articles
    elseif ($route === '/articles' && $method === 'GET') {
        $q = $_GET['q'] ?? '';
        $category = $_GET['category'] ?? '';

        $sql = "SELECT * FROM articles WHERE 1=1";
        $params = [];

        if (!empty($category)) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        if (!empty($q)) {
            $sql .= " AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)";
            $params[] = "%$q%";
            $params[] = "%$q%";
            $params[] = "%$q%";
        }

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // 13. GET /api/constitution
    elseif ($route === '/constitution' && $method === 'GET') {
        $q = $_GET['q'] ?? '';
        $category = $_GET['category'] ?? '';

        $sql = "SELECT * FROM constitution_articles WHERE 1=1";
        $params = [];

        if (!empty($category)) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        if (!empty($q)) {
            $sql .= " AND (article_number LIKE ? OR title LIKE ? OR summary LIKE ?)";
            $params[] = "%$q%";
            $params[] = "%$q%";
            $params[] = "%$q%";
        }

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // 14. POST /api/matchmaker
    elseif ($route === '/matchmaker' && $method === 'POST') {
        $description = $inputData['description'] ?? '';
        
        if (empty($description) || strlen($description) < 10) {
            http_response_code(400);
            echo json_encode(['error' => 'Please enter a more detailed case description (minimum 10 characters).']);
            exit();
        }

        $desc = strtolower($description);

        $keywordMappings = [
            'Criminal' => ['jail', 'bail', 'arrest', 'police', 'theft', 'crime', 'murder', 'fraud', 'assault', 'criminal', 'cheating', 'kidnap', 'scam', 'extortion'],
            'Corporate' => ['company', 'business', 'contract', 'incorporate', 'partner', 'founders', 'merger', 'funding', 'shares', 'corporate', 'startup', 'board', 'incorporation'],
            'Family' => ['divorce', 'custody', 'marriage', 'wife', 'husband', 'child', 'alimony', 'maintenance', 'family', 'partition', 'will', 'estate', 'property inheritance', 'domestic'],
            'Intellectual Property' => ['patent', 'trademark', 'copyright', 'logo', 'brand', 'design copyright', 'infringement', 'intellectual property', 'copycat', 'patent filing', 'ip protection'],
            'Tax' => ['tax', 'gst', 'audit', 'customs', 'income tax', 'revenue', 'finance', 'it returns', 'excise', 'taxation', 'service tax'],
            'Cyber' => ['hack', 'cyber', 'online', 'scam', 'data leak', 'privacy', 'phishing', 'defamation', 'internet', 'social media', 'profile hacked', 'otp fraud']
        ];

        $matchedSpecialty = null;
        $maxMatchesCount = 0;

        foreach ($keywordMappings as $specialty => $keywords) {
            $matchesCount = 0;
            foreach ($keywords as $word) {
                if (strpos($desc, $word) !== false) {
                    $matchesCount++;
                }
            }
            if ($matchesCount > $maxMatchesCount) {
                $maxMatchesCount = $matchesCount;
                $matchedSpecialty = $specialty;
            }
        }

        $advocates = [];
        if ($matchedSpecialty) {
            $stmt = $db->prepare("SELECT * FROM advocates WHERE status = 'verified' AND specialty = ? ORDER BY experience_years DESC LIMIT 3");
            $stmt->execute([$matchedSpecialty]);
            $advocates = $stmt->fetchAll();
        }

        if (count($advocates) < 3) {
            $existingIds = array_map(function($a) { return $a['id']; }, $advocates);
            $sqlFallback = "SELECT * FROM advocates WHERE status = 'verified'";
            $paramsFallback = [];
            
            if (count($existingIds) > 0) {
                $placeholders = implode(',', array_fill(0, count($existingIds), '?'));
                $sqlFallback .= " AND id NOT IN ($placeholders)";
                $paramsFallback = $existingIds;
            }
            
            $sqlFallback .= " ORDER BY experience_years DESC LIMIT ?";
            $paramsFallback[] = 3 - count($advocates);
            
            $stmtFallback = $db->prepare($sqlFallback);
            $stmtFallback->execute($paramsFallback);
            $fallbacks = $stmtFallback->fetchAll();
            $advocates = array_merge($advocates, $fallbacks);
        }

        echo json_encode([
            'specialtyMatched' => $matchedSpecialty ?: 'General Practice / Combined Consultation',
            'matchScore' => $maxMatchesCount,
            'advocates' => $advocates
        ]);
        exit();
    }

    // 15. GET /api/admin/advocates
    elseif ($route === '/admin/advocates' && $method === 'GET') {
        $currentUser = getAuthenticatedUser();
        if (!$currentUser || $currentUser['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized. Admin role required.']);
            exit();
        }

        $stmt = $db->query("SELECT * FROM advocates ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // 16. PUT /api/admin/advocates/{id}/status
    elseif (preg_match('/^\/admin\/advocates\/(\d+)\/status$/', $route, $matches) && $method === 'PUT') {
        $currentUser = getAuthenticatedUser();
        $advocateId = $matches[1];
        $status = $inputData['status'] ?? '';

        if (!$currentUser || $currentUser['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized. Admin role required.']);
            exit();
        }

        if (!in_array($status, ['verified', 'rejected', 'pending'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid status.']);
            exit();
        }

        $stmt = $db->prepare("UPDATE advocates SET status = ? WHERE id = ?");
        $stmt->execute([$status, $advocateId]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Advocate profile not found.']);
            exit();
        }

        echo json_encode(['message' => "Advocate status updated to $status."]);
        exit();
    }

    // Route not found
    else {
        http_response_code(404);
        echo json_encode(['error' => 'API route not found.']);
        exit();
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit();
}
