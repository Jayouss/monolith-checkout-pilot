# MONOLITH checkout preview

A fictional fashion checkout built with HTML, CSS, and JavaScript. The project includes a contact form, address fields, delivery options, and a sample order status page.

## Run locally

Open `index.html` in a browser, or serve the folder with Python:

```sh
python -m http.server 5190
```

Then open `http://localhost:5190`.

## Tests

The phone validation rules live in `validation.js` and are covered by the Node
built-in test runner (Node 18 or newer, no dependencies):

```sh
npm test
```

### Scope of the phone check

The check is a **basic format and length test only**. It verifies the characters
and the digit count for the selected country, using the length windows from that
country's numbering plan (New Zealand: NAD Rules v7.0; United Kingdom: Ofcom;
others: the national plans and the libphonenumber metadata). It does **not**
confirm that a number exists, is allocated to anyone, or belongs to the person
ordering, and it does not know individual prefixes or carrier ranges. A number
can pass and still be wrong.

**The number type is not checked.** A digit count cannot tell a mobile from a
landline, a service number or a business number, so the check accepts whatever
fits the country's length window and rejects whatever does not:

- Accepted, although not a personal number: New Zealand `0800 123 4567` and
  `0900 123 456`, Malaysian `1-300-88-1234`.
- Rejected, because their length falls outside the window: Australian
  `13 12 34`, `1300 123 456` and `1800 123 456`, United Kingdom seven digit
  services such as `0800 1111`, and United States seven digit numbers such as
  `310 1234`.

Rejecting service ranges deliberately would need per-prefix rules, which this
check does not have. Extensions and international dial codes are not accepted,
and a number that passes is not proof of a valid or reachable line.

## What works

The form checks required contact and address fields before opening the sample order page. US ZIP codes receive a format check. The phone selector supports eight country codes; each number is checked against that country's own digit count (UK, AU, ID, MY and NZ may be entered with or without the leading 0, but not with the international dial code). Flag images load from FlagCDN and require an internet connection.

Selecting a delivery method updates the example shipping cost and total. The order page shows the selected method and a sample delivery timeline.

## Limits

This is a portfolio prototype. It does not process payments, create orders, validate coupons, store customer data, or connect to a shipping provider. Prices and delivery statuses are illustrative. All validation runs in the browser and is not suitable for production transactions.
