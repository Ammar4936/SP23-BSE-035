var validations = {
    email: function(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email';
    },
    city: function(value) {
        return value !== '' || 'Please select a city';
    },
    firstName: function(value) {
        return value !== '' || 'First name is required';
    },
    lastName: function(value) {
        return value !== '' || 'Last name is required';
    },
    address: function(value) {
        return value !== '' || 'Address is required';
    },
    cityInput: function(value) {
        return value !== '' || 'City is required';
    },
    phone: function(value) {
        return /^\d{10,14}$/.test(value) || 'Invalid phone (10-14 digits)';
    }
};

function validateForm(event) {
    event.preventDefault();  // Prevent default form submission

    var isValid = true;

    // Validate each field
    for (var field in validations) {
        var input = document.getElementById(field);
        var result = validations[field](input.value);

        if (result !== true) {
            isValid = false;
            input.classList.add('is-invalid');
            document.getElementById(field + 'Error').textContent = result;
        } else {
            input.classList.remove('is-invalid');
            document.getElementById(field + 'Error').textContent = '';
        }
    }

    // If the form is valid, show alert and then reload the page after the alert
    if (isValid) {
        alert('Form submitted successfully!');  // Show the alert
        location.reload();  // Reload the page after the user clicks "OK"
    }
}

// Attach the submit event listener to the form
document.getElementById('contactForm').addEventListener('submit', validateForm);
