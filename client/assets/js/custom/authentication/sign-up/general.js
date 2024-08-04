// Import Firebase auth
import { auth } from '../../td_firebase_init.js';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Class definition
var KTSignupGeneral = function () {
    // Elements
    var form;
    var submitButton;
    var googleButton;
    var validator;
    var passwordMeter;

    // Handle form
    var handleForm = function () {
        // Form validation rules
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'first-name': {
                        validators: {
                            notEmpty: {
                                message: 'First Name is required'
                            }
                        }
                    },
                    'last-name': {
                        validators: {
                            notEmpty: {
                                message: 'Last Name is required'
                            }
                        }
                    },
                    'email': {
                        validators: {
                            notEmpty: {
                                message: 'Email address is required'
                            },
                            emailAddress: {
                                message: 'The value is not a valid email address'
                            }
                        }
                    },
                    'password': {
                        validators: {
                            notEmpty: {
                                message: 'The password is required'
                            },
                            callback: {
                                message: 'Please enter valid password',
                                callback: function (input) {
                                    if (input.value.length > 0) {
                                        return validatePassword();
                                    }
                                }
                            }
                        }
                    },
                    'confirm-password': {
                        validators: {
                            notEmpty: {
                                message: 'The password confirmation is required'
                            },
                            identical: {
                                compare: function () {
                                    return form.querySelector('[name="password"]').value;
                                },
                                message: 'The password and its confirm are not the same'
                            }
                        }
                    },
                    'toc': {
                        validators: {
                            notEmpty: {
                                message: 'You must accept the terms and conditions'
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );

        // Handle form submit
        submitButton.addEventListener('click', function (e) {
            e.preventDefault();

            validator.validate().then(function (status) {
                if (status == 'Valid') {
                    // Show loading indication
                    submitButton.setAttribute('data-kt-indicator', 'on');

                    // Disable button to avoid multiple clicks
                    submitButton.disabled = true;

                    var email = form.querySelector('[name="email"]').value;
                    var password = form.querySelector('[name="password"]').value;

                    createUserWithEmailAndPassword(auth, email, password)
                        .then((userCredential) => {
                            // Signed in 
                            const user = userCredential.user;
                            console.log('User created:', user);

                            // Store user data and show success message
                            storeUserData(user).then(() => {
                                Swal.fire({
                                    text: `You have successfully signed up! Welcome ${user.displayName || user.email}`,
                                    icon: "success",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: {
                                        confirmButton: "btn btn-primary"
                                    }
                                }).then(function (result) {
                                    if (result.isConfirmed) {
                                        form.reset();  // reset form
                                        passwordMeter.reset();  // reset password meter
                                        var redirectUrl = form.getAttribute('data-kt-redirect-url');
                                        if (redirectUrl) {
                                            location.href = redirectUrl;
                                        }
                                    }
                                });
                            });
                        })
                        .catch((error) => {
                            console.error('Error creating user:', error);
                            let errorMessage = error.message;
                            if (error.code === 'auth/email-already-in-use') {
                                errorMessage = 'Email is already in use. Please try another one.';
                            }
                            // Show error message
                            Swal.fire({
                                text: errorMessage,
                                icon: "error",
                                buttonsStyling: false,
                                confirmButtonText: "Ok, got it!",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            });

                            // Hide loading indication
                            submitButton.removeAttribute('data-kt-indicator');

                            // Enable button
                            submitButton.disabled = false;
                        });
                } else {
                    Swal.fire({
                        text: "Sorry, looks like there are some errors detected, please try again.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                }
            });
        });

        // Handle Google Sign-In
        // Initialize Google Auth Provider
        const provider = new GoogleAuthProvider();
        
        googleButton.addEventListener('click', function (e) {
            e.preventDefault();
            signInWithPopup(auth, provider)
                .then((result) => {
                    // This gives you a Google Access Token. You can use it to access Google APIs.
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential.accessToken;

                    // The signed-in user info.
                    const user = result.user;
                    console.log('Google User:', user);

                    // Store user data and show success message
                    storeUserData(user).then(() => {
                        Swal.fire({
                            text: `You have successfully signed in with Google! Welcome ${user.displayName || user.email}`,
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        }).then(function (result) {
                            if (result.isConfirmed) {
                                var redirectUrl = form.getAttribute('data-kt-redirect-url');
                                if (redirectUrl) {
                                    location.href = redirectUrl;
                                }
                            }
                        });
                    });
                })
                .catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // The email of the user's account used.
                    const email = error.customData.email;
                    // The AuthCredential type that was used.
                    const credential = GoogleAuthProvider.credentialFromError(error);

                    console.error('Error during Google sign-in:', errorCode, errorMessage);
                    // Show error message
                    Swal.fire({
                        text: errorMessage,
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                });
        });
    };

    // Store user data function
    const storeUserData = async (user) => {
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('http://127.0.0.1:8080/storeUserInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + idToken
                },
                body: JSON.stringify({
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL
                })
            });
            if (!response.ok) {
                throw new Error('Failed to store user data');
            }

            // Update the DOM with user information
            document.getElementById('userName').textContent = user.displayName;
            document.getElementById('userEmail').textContent = user.email;

        } catch (error) {
            console.error('Error storing user data:', error);
        }
    };

    // Password input validation
    var validatePassword = function () {
        return (passwordMeter.getScore() > 50);
    };

    // Public functions
    return {
        // Initialization
        init: function () {
            form = document.querySelector('#kt_sign_up_form');
            submitButton = document.querySelector('#kt_sign_up_submit');
            googleButton = document.querySelector('#kt_sign_up_google');
            passwordMeter = KTPasswordMeter.getInstance(form.querySelector('[data-kt-password-meter="true"]'));

            handleForm();
        }
    };
}();

export default KTSignupGeneral;

// On document ready
document.addEventListener('DOMContentLoaded', function () {
    KTSignupGeneral.init();
});
