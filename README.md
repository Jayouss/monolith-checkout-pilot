# MONOLITH checkout preview

A fictional fashion checkout built with HTML, CSS, and JavaScript. The project includes a contact form, address fields, delivery options, and a sample order status page.

## Run locally

Open `index.html` in a browser, or serve the folder with Python:

```sh
python -m http.server 5190
```

Then open `http://localhost:5190`.

## What works

The form checks required contact and address fields before opening the sample order page. US ZIP codes receive a format check. The phone selector supports eight country codes and checks the number's basic length and characters. Flag images load from FlagCDN and require an internet connection.

Selecting a delivery method updates the example shipping cost and total. The order page shows the selected method and a sample delivery timeline.

## Limits

This is a portfolio prototype. It does not process payments, create orders, validate coupons, store customer data, or connect to a shipping provider. Prices and delivery statuses are illustrative. All validation runs in the browser and is not suitable for production transactions.
