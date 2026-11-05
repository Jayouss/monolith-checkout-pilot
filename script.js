const checkout = document.querySelector('#checkout');
const submitButton = checkout.querySelector('.submit');
const initialButtonContent = submitButton.innerHTML;
const summary = document.querySelector('#error-summary');
const { validatePhone } = window.checkoutValidation;
const fields = [
  ['email', 'Email address', input => !input.value.trim() ? 'Enter your email address.' : input.validity.typeMismatch ? 'Enter a valid email address.' : ''],
  ['full-name', 'Full name', input => input.value.trim().length < 2 ? 'Enter your full name (at least 2 characters).' : ''],
  ['phone', 'Phone number', input => validatePhone(input.value, checkout.elements.phoneCountry.value).message],
  ['region', 'State / province / region', input => input.value.trim() ? '' : 'Enter your state or region.'],
  ['city', 'City', input => input.value.trim() ? '' : 'Enter your city.'],
  ['postal', 'ZIP / postal code', input => { const value = input.value.trim(); return !value ? 'Enter your ZIP or postal code.' : checkout.elements.country.value === 'US' && !/^\d{5}(-\d{4})?$/.test(value) ? 'Enter a valid US ZIP code, such as 10001.' : ''; }],
  ['address', 'Street address', input => input.value.trim() ? '' : 'Enter your street address.']
];
function validateField([id, label, check]) {
  const input = document.getElementById(id);
  const message = check(input);
  document.getElementById(`${id}-error`).textContent = message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  return message ? { id, label, message } : null;
}
function validateCheckout(focusSummary = true) {
  const errors = fields.map(validateField).filter(Boolean);
  const list = summary.querySelector('ul');
  list.replaceChildren();
  for (const error of errors) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${error.id}`;
    link.textContent = `${error.label}: ${error.message}`;
    item.append(link); list.append(item);
  }
  summary.hidden = errors.length === 0;
  if (errors.length && focusSummary) summary.focus();
  return errors.length === 0;
}
for (const field of fields) {
  const input = document.getElementById(field[0]);
  input.addEventListener('input', () => { if (!summary.hidden) validateCheckout(false); });
}
const phonePicker = document.querySelector('.phone-picker');
const phoneCountry = document.querySelector('#phone-country');
const phoneInput = document.querySelector('#phone');
const phoneField = fields.find(([id]) => id === 'phone');
// Before the first submit the summary stays hidden, so a country change must touch
// the phone field alone: the other untouched fields must not gain errors yet.
function updatePhoneError() {
  if (phoneInput.value.trim()) validateField(phoneField);
  else { document.getElementById('phone-error').textContent = ''; phoneInput.removeAttribute('aria-invalid'); }
}
phoneInput.addEventListener('input', () => { if (summary.hidden && document.getElementById('phone-error').textContent) updatePhoneError(); });
phonePicker.querySelectorAll('[data-country]').forEach((button) => button.addEventListener('click', () => {
  phoneCountry.value = button.dataset.country;
  phoneCountry.dispatchEvent(new Event('change'));
  document.querySelector('#phone-code-label').textContent = phoneCountry.selectedOptions[0].textContent;
  phonePicker.open = false;
  phoneInput.focus();
  phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
}));
document.addEventListener('click', (event) => { if (!phonePicker.contains(event.target)) phonePicker.open = false; });
phonePicker.addEventListener('keydown', (event) => { if (event.key === 'Escape' && phonePicker.open) { phonePicker.open = false; phonePicker.querySelector('summary').focus(); } });
document.querySelector('#phone-country').addEventListener('change', (event) => { document.querySelector('#phone-flag').src = `https://flagcdn.com/w40/${event.target.value.toLowerCase()}.png`; if (!summary.hidden) validateCheckout(false); else updatePhoneError(); });
checkout.elements.country.addEventListener('change', () => { const postal = document.getElementById('postal'); if (!summary.hidden) validateCheckout(false); });
checkout.addEventListener('submit', (event) => {
  event.preventDefault();
  if (submitButton.disabled || !validateCheckout()) return;
  const express = document.querySelectorAll('[name=shipping]')[1].checked;
  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  submitButton.innerHTML = 'Preparing order <span class="loading-spinner" aria-hidden="true"></span>';
  document.querySelector('#result').textContent = 'Preparing your order…';
  window.setTimeout(() => { window.location.href = express ? 'order.html?delivery=express' : 'order.html?delivery=standard'; }, 900);
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
    submitButton.innerHTML = initialButtonContent;
    document.querySelector('#result').textContent = '';
  }
});
document.querySelector('#apply').addEventListener('click', () => { document.querySelector('#coupon-message').textContent = 'Discount codes are not connected in this preview.'; });
document.querySelectorAll('[name=shipping]').forEach((radio, index) => radio.addEventListener('change', () => { document.querySelector('#shipping-price').textContent = index ? '$10.00' : '$5.00'; document.querySelector('#total').textContent = index ? '$62.00' : '$57.00'; }));
