document.addEventListener('DOMContentLoaded', () => {
    const requestOtpButton = document.getElementById('request-otp');
    const verifyOtpButton = document.getElementById('verify-otp');
    const otpSection = document.getElementById('otp-section');
    const businessForm = document.getElementById('business-form');
    const businessCategorySelect = document.getElementById('business-category');
    const otherCategorySection = document.getElementById('other-category-section');

    businessCategorySelect.addEventListener('change', () => {
        if (businessCategorySelect.value === 'other') {
            otherCategorySection.style.display = 'block';
        } else {
            otherCategorySection.style.display = 'none';
        }
    });

    requestOtpButton.addEventListener('click', async () => {
        const formData = new FormData(businessForm);
        const data = Object.fromEntries(formData.entries());
        const { email, mobile } = data;

        if (!email && !mobile) {
            alert('Please enter either an email or mobile number.');
            return;
        }

        // Call backend to request OTP
        const response = await fetch('/api/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, mobile }),
        });
        const result = await response.json();

        if (result.success) {
            otpSection.style.display = 'block';
        } else {
            alert(result.message);
        }
    });

    verifyOtpButton.addEventListener('click', async () => {
        const otp = document.getElementById('otp').value;
        const formData = new FormData(businessForm);
        const data = Object.fromEntries(formData.entries());
        const { email, mobile } = data;

        // Call backend to verify OTP
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp, email, mobile }),
        });
        const result = await response.json();

        if (result.success) {
            alert('Registration successful!');
            // Redirect to profile or other page
        } else {
            alert(result.message);
        }
    });
});
