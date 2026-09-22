const formatCurrency = (amount, currency = 'INR') => {
  const num = Number(amount) || 0;
  if (currency === 'INR') {
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toISOString().split('T')[0];
};

module.exports = { formatCurrency, formatDate };
