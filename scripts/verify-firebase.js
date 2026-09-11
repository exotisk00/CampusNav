import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- CAMPUSNAV FIREBASE INTEGRATION VERIFICATION ---\n');

// 1. Check firestore.rules
console.log('1. Validating Firestore Security Rules (firestore.rules):');
const firestoreRulesPath = path.join(rootDir, 'firestore.rules');
assert(fs.existsSync(firestoreRulesPath), 'firestore.rules exists');
if (fs.existsSync(firestoreRulesPath)) {
  const rulesContent = fs.readFileSync(firestoreRulesPath, 'utf8');
  assert(rulesContent.includes("rules_version = '2'"), 'Uses rules version 2');
  assert(rulesContent.includes('match /databases/{database}/documents'), 'Matches root database');
  assert(rulesContent.includes('match /users/{userId}'), 'Defines rules for /users/{userId}');
  assert(rulesContent.includes('request.auth.uid == userId'), 'Enforces user profile ownership');
  assert(rulesContent.includes('match /notifications/{notificationId}'), 'Defines subcollection rules for notifications');
  assert(rulesContent.includes('match /rsvps/{eventId}'), 'Defines subcollection rules for event RSVPs');
  assert(rulesContent.includes('match /events/{eventId}'), 'Defines rules for /events/{eventId}');
  assert(rulesContent.includes('match /lost_found/{itemId}'), 'Defines rules for /lost_found/{itemId}');
  assert(rulesContent.includes('request.resource.data.postedBy == request.auth.uid'), 'Enforces author ID match on lost & found creation');
}

// 2. Check storage.rules
console.log('\n2. Validating Firebase Storage Security Rules (storage.rules):');
const storageRulesPath = path.join(rootDir, 'storage.rules');
assert(fs.existsSync(storageRulesPath), 'storage.rules exists');
if (fs.existsSync(storageRulesPath)) {
  const rulesContent = fs.readFileSync(storageRulesPath, 'utf8');
  assert(rulesContent.includes("rules_version = '2'"), 'Uses storage rules version 2');
  assert(rulesContent.includes('match /users/{userId}/{fileName}'), 'Defines user avatar upload path');
  assert(rulesContent.includes('request.resource.size < 5 * 1024 * 1024'), 'Enforces 5MB avatar size limit');
  assert(rulesContent.includes("contentType.matches('image/.*')"), 'Enforces image MIME type check');
  assert(rulesContent.includes('match /lost_found/{fileName}'), 'Defines lost & found photo upload path');
  assert(rulesContent.includes('request.resource.size < 10 * 1024 * 1024'), 'Enforces 10MB item photo size limit');
}

// 3. Check firebase.json and environment templates
console.log('\n3. Validating Firebase Configuration & Environment Templates:');
const firebaseJsonPath = path.join(rootDir, 'firebase.json');
assert(fs.existsSync(firebaseJsonPath), 'firebase.json exists');
if (fs.existsSync(firebaseJsonPath)) {
  const jsonContent = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
  assert(jsonContent.firestore?.rules === 'firestore.rules', 'firebase.json maps firestore.rules');
  assert(jsonContent.storage?.rules === 'storage.rules', 'firebase.json maps storage.rules');
  assert(jsonContent.emulators?.auth?.port === 9099, 'firebase.json defines Auth emulator port');
  assert(jsonContent.emulators?.firestore?.port === 8080, 'firebase.json defines Firestore emulator port');
  assert(jsonContent.emulators?.storage?.port === 9199, 'firebase.json defines Storage emulator port');
}

const envExamplePath = path.join(rootDir, '.env.example');
assert(fs.existsSync(envExamplePath), '.env.example exists');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  assert(envContent.includes('VITE_FIREBASE_API_KEY'), 'Includes VITE_FIREBASE_API_KEY');
  assert(envContent.includes('VITE_FIREBASE_PROJECT_ID'), 'Includes VITE_FIREBASE_PROJECT_ID');
  assert(envContent.includes('VITE_FIREBASE_AUTH_DOMAIN'), 'Includes VITE_FIREBASE_AUTH_DOMAIN');
  assert(envContent.includes('VITE_FIREBASE_STORAGE_BUCKET'), 'Includes VITE_FIREBASE_STORAGE_BUCKET');
  assert(envContent.includes('VITE_FIREBASE_APP_ID'), 'Includes VITE_FIREBASE_APP_ID');
}

const gitignorePath = path.join(rootDir, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  assert(gitignoreContent.includes('.env'), '.gitignore excludes .env files');
}

// 4. Validate Firebase Services Source Files
console.log('\n4. Validating Firebase Services Module Structure:');
const services = [
  'src/firebase/config.js',
  'src/firebase/authService.js',
  'src/firebase/firestoreService.js',
  'src/firebase/storageService.js',
  'src/firebase/index.js',
];

for (const svc of services) {
  const fullPath = path.join(rootDir, svc);
  assert(fs.existsSync(fullPath), `${svc} exists`);
}

console.log(`\nVerification Summary: ${passedTests} / ${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('✓ ALL FIREBASE INTEGRATION VERIFICATIONS PASSED!\n');
  process.exit(0);
} else {
  console.error('✗ Some checks failed.\n');
  process.exit(1);
}
