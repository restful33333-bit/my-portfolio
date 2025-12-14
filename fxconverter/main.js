const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const swapBtn = document.getElementById('swap-btn');
const result = document.getElementById('result');

amountInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9.]/g, '');
});

convertBtn.addEventListener('click', convertCurrency);
swapBtn.addEventListener('click', swapCurrencies);

function swapCurrencies() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

    const amount = parseFloat(amountInput.value);
    if (amount && amount > 0) {
        convertCurrency();
    }
}

async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (!amount || amount <= 0) {
        result.textContent = '유효한 금액을 입력하세요';
        return;
    }

    try {
        result.textContent = '변환 중...';

        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await response.json();

        const rate = data.rates[to];
        const convertedAmount = (amount * rate).toFixed(2);

        result.textContent = `${amount} ${from} = ${convertedAmount} ${to}`;
    } catch (error) {
        result.textContent = '변환 실패';
    }
}
