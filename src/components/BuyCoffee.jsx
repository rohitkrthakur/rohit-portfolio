export default function BuyCoffee() {
  const handlePay = async () => {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100 }),
    });
    const order = await res.json();

    const options = {
      key: 'rzp_test_TJz2QUkFFKDCQr',
      amount: order.amount,
      currency: 'INR',
      name: 'Buy me a coffee',
      description: 'Support my work',
      order_id: order.id,
      handler: (response) => {
        alert('Payment successful! ID: ' + response.razorpay_payment_id);
      },
    };

    new window.Razorpay(options).open();
  };

  return (
    <button
      onClick={handlePay}
      className="bg-[#5227FF] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
    >
      ☕ Buy me a coffee
    </button>
  );
}