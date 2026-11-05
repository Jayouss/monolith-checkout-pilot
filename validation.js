(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.checkoutValidation = api;
})(typeof window !== 'undefined' ? window : null, function () {
  // National significant digits per country: the digits after the international
  // dial code and after the domestic trunk prefix. Each window is the union of
  // what the numbering plan allows for a number somebody could give as a contact
  // number. A digit count cannot tell number types apart, so service and business
  // ranges pass or fail purely by length (see the README for which ones do).
  //   NZ 8-10: NAD Rules v7.0 s3.2.2 and s3.2.3 - non-geographic (cellular)
  //            numbers are 02N + 6 to 8 digits, i.e. 10 or 11 digits dialled and
  //            so 9 or 10 significant digits; eight digit "Local Numbers" and
  //            longer pre-existing mobiles keep the floor at 8.
  //   GB 9-10: Ofcom National Telephone Numbering Plan - local numbers run from
  //            four to eight digits, so the total is ten or, rarely, nine
  //            (a five digit area code such as 016977 takes four digit numbers).
  //   MY 8-10: Malaysian plan - 0x xxx xxxx, 08x xxx xxx, 01x xxx xxxx and
  //            011 xxxx xxxx.
  //   ID 9-12: Indonesian plan - landline and 08xx mobile.
  //   US and CA are always 10, AU 9, SG 8.
  // `trunk` is the domestic leading digit (for example the 0 in UK
  // "07700 900123") that is dropped before dialling internationally.
  const PHONE_RULES = {
    US: { label: 'US', dial: '1', min: 10, max: 10 },
    GB: { label: 'UK', dial: '44', min: 9, max: 10, trunk: '0' },
    CA: { label: 'CA', dial: '1', min: 10, max: 10 },
    AU: { label: 'AU', dial: '61', min: 9, max: 9, trunk: '0' },
    ID: { label: 'ID', dial: '62', min: 9, max: 12, trunk: '0' },
    SG: { label: 'SG', dial: '65', min: 8, max: 8 },
    MY: { label: 'MY', dial: '60', min: 8, max: 10, trunk: '0' },
    NZ: { label: 'NZ', dial: '64', min: 8, max: 10, trunk: '0' }
  };

  const E164_MAX_DIGITS = 15;
  const FORMATTED_PHONE = /^[\d(). -]+$/;

  function phoneRule(countryCode) {
    return PHONE_RULES[String(countryCode || '').toUpperCase()] || null;
  }

  function validatePhone(rawValue, countryCode) {
    const value = String(rawValue == null ? '' : rawValue).trim();
    if (!value) {
      return { valid: false, reason: 'empty', digits: '', message: 'Enter your phone number.' };
    }

    const rule = phoneRule(countryCode);
    if (!rule) {
      return { valid: false, reason: 'country', digits: '', message: 'Enter a valid phone number without the country code.' };
    }

    // Normalise any whitespace (spaces, tabs, pasted non-breaking spaces) to single
    // spaces so that only digits and the usual phone symbols remain meaningful.
    const normalised = value.replace(/\s/g, ' ');
    if (!FORMATTED_PHONE.test(normalised)) {
      return { valid: false, reason: 'characters', digits: '', message: 'Enter a valid phone number without the country code.' };
    }

    let digits = normalised.replace(/\D/g, '');
    // In these countries every domestic number starts with the trunk digit, so a
    // leading 0 is formatting rather than a significant digit. Strip it before
    // checking length so "07700 900123" and "7700900123" are treated alike.
    if (rule.trunk && digits[0] === rule.trunk) {
      digits = digits.slice(1);
    }

    const lengthMessage = `Enter a valid ${rule.label} phone number without the country code.`;
    if (digits.length < rule.min || digits.length > rule.max) {
      return { valid: false, reason: 'length', digits, message: lengthMessage };
    }

    return { valid: true, reason: null, digits, message: '' };
  }

  return { PHONE_RULES, E164_MAX_DIGITS, validatePhone };
});
