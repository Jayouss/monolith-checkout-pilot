if (new URLSearchParams(window.location.search).get('delivery') === 'express') {
  document.querySelector('#delivery-name').textContent = 'Express delivery';
  document.querySelector('#delivery-eta').textContent = '1–2 business days';
  document.querySelector('#order-shipping').textContent = '$10.00';
  document.querySelector('#order-total').textContent = '$62.00';
}
