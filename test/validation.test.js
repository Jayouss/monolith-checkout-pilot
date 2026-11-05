const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePhone, PHONE_RULES, E164_MAX_DIGITS } = require('../validation.js');

function expectValid(value, country) {
  const result = validatePhone(value, country);
  assert.equal(result.valid, true, `expected ${JSON.stringify(value)} (${country}) to be valid, got: ${result.message}`);
  return result;
}

function expectInvalid(value, country, reason) {
  const result = validatePhone(value, country);
  assert.equal(result.valid, false, `expected ${JSON.stringify(value)} (${country}) to be invalid`);
  assert.ok(result.message.length > 0, 'invalid numbers must carry a message');
  if (reason) assert.equal(result.reason, reason);
  return result;
}

test('accepts valid national formats for every supported country', () => {
  const cases = [
    ['US', '5550101234'],
    ['US', '(555) 010-1234'],
    ['US', '555-010-1234'],
    ['US', '555.010.1234'],
    ['US', '  555 010 1234  '],
    ['US', '555\u00a0010\u00a01234'],
    ['CA', '5550101234'],
    ['GB', '7700900123'],
    ['GB', '07700 900123'],
    ['GB', '020 7946 0958'],
    ['AU', '412345678'],
    ['AU', '0412 345 678'],
    ['ID', '8123456789'],
    ['ID', '0812 3456 7890'],
    ['SG', '8123 4567'],
    ['MY', '012-345 6789'],
    ['NZ', '021 123 4567'],
    ['NZ', '03 123 4567'],
    ['NZ', '021 1234 5678'],
    ['NZ', '0204 123 4567'],
    ['NZ', '0800 123 4567'],
    ['GB', '016977 2345'],
    ['MY', '088 123 456']
  ];
  for (const [country, value] of cases) expectValid(value, country);
});

test('returns the significant digits, dropping the trunk prefix', () => {
  assert.equal(expectValid('07700 900123', 'GB').digits, '7700900123');
  assert.equal(expectValid('0412 345 678', 'AU').digits, '412345678');
  assert.equal(expectValid('021 123 4567', 'NZ').digits, '211234567');
});

test('accepts every mobile length the New Zealand plan allows', () => {
  // NAD Rules v7.0 s3.2.2 and s3.2.3: non-geographic (cellular) numbers are
  // 02N + 6 to 8 digits, so 10 or 11 digits dialled and 9 or 10 significant.
  expectValid('021 123 456', 'NZ');
  expectValid('021 123 4567', 'NZ');
  expectValid('021 1234 5678', 'NZ');
  expectValid('0204 123 456', 'NZ');
  expectValid('0204 123 4567', 'NZ');
  expectInvalid('021 1234 56789', 'NZ', 'length');
});

test('country codes are matched case-insensitively', () => {
  expectValid('5550101234', 'us');
  expectValid('5550101234', 'Us');
});

test('rejects empty input with a dedicated message', () => {
  assert.equal(expectInvalid('', 'US', 'empty').message, 'Enter your phone number.');
  assert.equal(expectInvalid('   ', 'US', 'empty').message, 'Enter your phone number.');
  assert.equal(expectInvalid(null, 'US', 'empty').message, 'Enter your phone number.');
  assert.equal(expectInvalid(undefined, 'US', 'empty').message, 'Enter your phone number.');
});

test('rejects numbers that are too short for the selected country', () => {
  expectInvalid('555-0123', 'US', 'length');
  expectInvalid('555 0101', 'US', 'length');
  expectInvalid('555010123', 'US', 'length');
  expectInvalid('77009001', 'GB', 'length');
  expectInvalid('41234567', 'AU', 'length');
  expectInvalid('041234567', 'AU', 'length');
  expectInvalid('8123456', 'SG', 'length');
  expectInvalid('123456789', 'SG', 'length');
  expectInvalid('0812345', 'MY', 'length');
  expectInvalid('123456', 'NZ', 'length');
});

test('rejects numbers that are too long for the selected country', () => {
  expectInvalid('55501012345', 'US', 'length');
  expectInvalid('5550101234567', 'CA', 'length');
  expectInvalid('447700900123', 'GB', 'length');
  expectInvalid('4123456789', 'AU', 'length');
  expectInvalid('8123456789012', 'ID', 'length');
  expectInvalid('812345678', 'SG', 'length');
  expectInvalid('012345678901', 'MY', 'length');
  expectInvalid('021123456789', 'NZ', 'length');
});

test('rejects a number that already contains the country code', () => {
  expectInvalid('1 555 010 1234', 'US', 'length');
  expectInvalid('15550101234', 'US', 'length');
  expectInvalid('44 7700 900123', 'GB', 'length');
  expectInvalid('61 412 345 678', 'AU', 'length');
});

test('rejects an explicit + dial code or unsupported characters', () => {
  expectInvalid('+1 555 010 1234', 'US', 'characters');
  expectInvalid('+44 7700 900123', 'GB', 'characters');
  expectInvalid('call me', 'US', 'characters');
  expectInvalid('555-CALL', 'US', 'characters');
  expectInvalid('555 010 1234 ext 5', 'US', 'characters');
  expectInvalid('\u0665\u0665\u0665\u0660\u0661\u0660\u0661\u0662\u0663\u0664', 'US', 'characters');
  expectInvalid('5550101234\uD83D\uDE00', 'US', 'characters');
});

test('rejects input that has no usable digits', () => {
  expectInvalid('()', 'US', 'length');
  expectInvalid('------', 'US', 'length');
  expectInvalid('(   )', 'US', 'length');
  expectInvalid('0', 'GB', 'length');
});

test('rejects an unknown or missing country code instead of throwing', () => {
  expectInvalid('5550101234', 'ZZ', 'country');
  expectInvalid('5550101234', '', 'country');
  expectInvalid('5550101234', undefined, 'country');
});

test('length messages name the selected country', () => {
  assert.match(validatePhone('555-0123', 'US').message, /US/);
  assert.match(validatePhone('77009001', 'GB').message, /UK/);
  assert.match(validatePhone('8123456', 'SG').message, /SG/);
});

test('newlines and tabs act as separators, like spaces', () => {
  expectValid('555\n010\t1234', 'US');
});

test('length, not number type, decides whether a number is accepted', () => {
  // A digit count cannot tell a personal number from a service number, so the
  // window accepts whatever fits it. These passing service numbers are a known
  // limitation, documented in the README, not intended support for the ranges.
  expectValid('0800 123 4567', 'NZ');
  expectValid('0900 123 456', 'NZ');
  expectValid('1-300-88-1234', 'MY');
  // These service and short-format numbers fall outside the window and so are
  // rejected on length alone, not because the check recognises their type.
  expectInvalid('13 12 34', 'AU', 'length');
  expectInvalid('1300 123 456', 'AU', 'length');
  expectInvalid('1800 123 456', 'AU', 'length');
  expectInvalid('0800 1111', 'GB', 'length');
  expectInvalid('310 1234', 'US', 'length');
});

test('every rule stays within the E.164 fifteen digit limit', () => {
  for (const [code, rule] of Object.entries(PHONE_RULES)) {
    assert.ok(rule.min <= rule.max, `${code}: min must not exceed max`);
    assert.ok(rule.max + rule.dial.length <= E164_MAX_DIGITS, `${code}: national digits plus dial code must fit E.164`);
    assert.ok(rule.max + rule.dial.length >= rule.min, `${code}: inconsistent rule`);
  }
});
