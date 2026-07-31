/* GNG Corporation - Contact Form JavaScript (js/contact.js) */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

/**
 * Handles validation, pre-selection of dropdown fields via URL parameters,
 * and handles mock form submission.
 */
function initContactForm() {
  const form = document.getElementById('gng-contact-form');
  const serviceSelect = document.getElementById('service');
  
  if (!form) return;

  // 1. Service dropdown is built & prefilled from URL param by js/services.js

  // 2. Clear error state on input change
  const formControls = form.querySelectorAll('.form-control');
  formControls.forEach(control => {
    control.addEventListener('input', () => {
      clearError(control);
    });
    control.addEventListener('change', () => {
      clearError(control);
    });
  });

  // 3. Form Submit Handling
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Reset general status messages
    hideStatusMessages();

    // Perform validation
    const isValid = validateForm(form);
    
    if (isValid) {
      submitFormMock(form);
    }
  });
}

/**
 * Validates each form input and displays errors if necessary
 */
function validateForm(form) {
  let isValid = true;
  
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const jobTitleInput = document.getElementById('job-title');
  const companyNameInput = document.getElementById('company-name');
  const phoneInput = document.getElementById('phone');
  const businessTypeInput = document.getElementById('business-type');
  const serviceSelect = document.getElementById('service');
  const messageText = document.getElementById('message');

  // Name validation
  if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
    showError(nameInput, 'Please enter your name (minimum 2 characters)');
    isValid = false;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
    showError(emailInput, 'Please enter a valid email address');
    isValid = false;
  }

  // Job Title validation
  if (jobTitleInput && !jobTitleInput.value.trim()) {
    showError(jobTitleInput, 'Please enter your role or job title');
    isValid = false;
  }

  // Company Name validation
  if (companyNameInput && !companyNameInput.value.trim()) {
    showError(companyNameInput, 'Please enter your company name');
    isValid = false;
  }

  // Phone Number validation (basic: 7-20 digits/chars, allowing +, spaces, dashes, dots, parens)
  const phoneRegex = /^[+]?[0-9\s\-().]{7,20}$/;
  if (phoneInput && (!phoneInput.value.trim() || !phoneRegex.test(phoneInput.value.trim()))) {
    showError(phoneInput, 'Please enter a valid phone number (e.g. +1 555 000 0000)');
    isValid = false;
  }

  // Business Type validation
  if (!businessTypeInput.value.trim()) {
    showError(businessTypeInput, 'Please enter your industry or business type');
    isValid = false;
  }

  // Service select validation
  if (!serviceSelect.value) {
    showError(serviceSelect, 'Please select a service tier or agent model');
    isValid = false;
  }

  // Message validation
  if (!messageText.value.trim() || messageText.value.trim().length < 10) {
    showError(messageText, 'Please write a brief summary of your needs (minimum 10 characters)');
    isValid = false;
  }

  // Focus the first invalid element
  if (!isValid) {
    const firstError = form.querySelector('.error-state');
    if (firstError) firstError.focus();
  }

  return isValid;
}

/**
 * Applies error styling to an input field and shows the error text
 */
function showError(inputElement, errorMessage) {
  inputElement.classList.add('error-state');
  
  // Find error message sibling or create one
  let errorSibling = inputElement.nextElementSibling;
  if (errorSibling && errorSibling.classList.contains('form-error-msg')) {
    errorSibling.textContent = errorMessage;
    errorSibling.style.display = 'block';
  }
}

/**
 * Clears error styling from an input field
 */
function clearError(inputElement) {
  inputElement.classList.remove('error-state');
  let errorSibling = inputElement.nextElementSibling;
  if (errorSibling && errorSibling.classList.contains('form-error-msg')) {
    errorSibling.style.display = 'none';
  }
}

/**
 * Hides global status alert banners
 */
function hideStatusMessages() {
  const successBanner = document.getElementById('form-success-banner');
  const errorBanner = document.getElementById('form-error-banner');
  
  if (successBanner) successBanner.style.display = 'none';
  if (errorBanner) errorBanner.style.display = 'none';
}

/**
 * Simulates a server submission process
 */
function submitFormMock(form) {
  const submitBtn = form.querySelector('.btn-submit');
  const successBanner = document.getElementById('form-success-banner');
  const errorBanner = document.getElementById('form-error-banner');
  const successToast = document.getElementById('success-toast');

  // Disable form controls during submission
  const inputs = form.querySelectorAll('input, select, textarea, button');
  inputs.forEach(input => input.disabled = true);
  
  // Trigger button loading spinner
  submitBtn.classList.add('loading');

  // Supabase Project Credentials
  const supabaseUrl = 'https://xneeljogbzldbdzdccdt.supabase.co';
  const supabaseKey = 'sb_publishable_T-kioo9_PrSyWANCJD0vHQ_wBSYo_z8';

  // Gather form values
  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    job_title: document.getElementById('job-title').value.trim(),
    company_name: document.getElementById('company-name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    business_type: document.getElementById('business-type').value.trim(),
    service: document.getElementById('service').value,
    message: document.getElementById('message').value.trim()
  };

  // Perform live API request to Supabase 'bookings' table
  fetch(`${supabaseUrl}/rest/v1/bookings`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  })
  .then(async (response) => {
    // Reset loader states
    submitBtn.classList.remove('loading');
    inputs.forEach(input => input.disabled = false);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Status code ${response.status}`);
    }

    // Success Actions
    if (successBanner) {
      successBanner.style.display = 'block';
    }
    
    // Trigger Success Slide-in Toast Overlay
    if (successToast) {
      successToast.classList.add('show');
      
      // Hide toast after 4 seconds
      setTimeout(() => {
        successToast.classList.remove('show');
      }, 4000);
    }
    
    // Reset form fields
    form.reset();
  })
  .catch((error) => {
    // Reset loader states
    submitBtn.classList.remove('loading');
    inputs.forEach(input => input.disabled = false);

    // Show error banner to user
    if (errorBanner) {
      console.error('Supabase DB Insert Error:', error);
      errorBanner.textContent = `Submission failed. Please verify your Supabase database schema or contact support. Details: ${error.message}`;
      errorBanner.style.display = 'block';
    }
  });
}

