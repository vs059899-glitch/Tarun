<?php
/**
 * Hostinger PHP Lead Capture Handler
 * For Hostinger Shared Web Hosting deployments without Node.js daemon
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body.']);
    exit;
}

$email = isset($data['email']) ? trim($data['email']) : '';
$fullName = isset($data['fullName']) ? trim($data['fullName']) : (isset($data['full_name']) ? trim($data['full_name']) : 'Anonymous Visitor');
$companyName = isset($data['companyName']) ? trim($data['companyName']) : (isset($data['company_name']) ? trim($data['company_name']) : 'Not specified');
$phone = isset($data['phone']) ? trim($data['phone']) : 'Not specified';
$source = isset($data['source']) ? trim($data['source']) : 'Hostinger Website Lead';
$fileStatus = isset($data['uploadedFileStatus']) ? trim($data['uploadedFileStatus']) : (isset($data['uploaded_file_status']) ? trim($data['uploaded_file_status']) : 'No File Uploaded');

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please enter a valid email address.']);
    exit;
}

$leadId = 'lead_' . round(microtime(true) * 1000) . '_' . substr(md5(uniqid(rand(), true)), 0, 5);
$timestamp = date('c');

$leadRecord = [
    'lead_id' => $leadId,
    'full_name' => $fullName,
    'email' => $email,
    'company_name' => $companyName,
    'phone' => $phone,
    'source' => $source,
    'uploaded_file_status' => $fileStatus,
    'created_at' => $timestamp,
    'last_activity' => $timestamp,
    'status' => 'New'
];

// 1. Save to local data/leads.json if directory writable
$dataDir = __DIR__ . '/../../data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$leadsFile = $dataDir . '/leads.json';
$existingLeads = [];
if (file_exists($leadsFile)) {
    $existingLeads = json_decode(file_get_contents($leadsFile), true) ?: [];
}
$existingLeads[] = $leadRecord;
@file_put_contents($leadsFile, json_encode($existingLeads, JSON_PRETTY_PRINT));

// 2. Dispatch email notification to vs059899@gmail.com
$adminEmail = getenv('ADMIN_EMAIL') ?: 'vs059899@gmail.com';
$subject = "🌟 [Resa Life Sci] New Cosmetic Lead: {$fullName} ({$companyName})";

$messageBody = "New Cosmetic Business Lead Captured via Hostinger Web App:\n\n"
    . "Full Name: {$fullName}\n"
    . "Email: {$email}\n"
    . "Company: {$companyName}\n"
    . "Phone: {$phone}\n"
    . "Source: {$source}\n"
    . "File Attachment Status: {$fileStatus}\n"
    . "Timestamp: {$timestamp}\n"
    . "Lead ID: {$leadId}\n\n"
    . "Resa Life Sci Formulation Desk\nBawana Industrial Area, New Delhi";

$headers = "From: no-reply@" . ($_SERVER['SERVER_NAME'] ?? 'resalifesci.com') . "\r\n"
    . "Reply-To: {$email}\r\n"
    . "X-Mailer: PHP/" . phpversion();

@mail($adminEmail, $subject, $messageBody, $headers);

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Thanks! Your details have been saved.',
    'lead' => $leadRecord
]);
