"use strict";

// Import Firebase auth
import { auth } from '../firebase_init.js';
import { insertUserData } from '../insert_user_to_db.js';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";  

// Class definition
var KTSignupGeneral = function () {
    // Elements
    var form;
    var submitButton;
    var validator;
    var passwordMeter;

    // Handle form
    var handleForm = function (e) {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
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
                            regexp: {
                                regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'The value is not a valid email address',
                            },
                            notEmpty: {
                                message: 'Email address is required'
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
                    trigger: new FormValidation.plugins.Trigger({
                        event: {
                            password: false
                        }
                    }),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',  // comment to enable invalid state icons
                        eleValidClass: '' // comment to enable valid state icons
                    })
                }
            }
        );

        // Handle form submit
        submitButton.addEventListener('click', function (e) {
            e.preventDefault();

            validator.revalidateField('password');

            validator.validate().then(function (status) {
                if (status == 'Valid') {
                    // Show loading indication
                    submitButton.setAttribute('data-kt-indicator', 'on');

                    // Disable button to avoid multiple click
                    submitButton.disabled = true;

                    var email = form.querySelector('[name="email"]').value;
                    var password = form.querySelector('[name="password"]').value;

                    // Use Firebase to create a new user
                        createUserWithEmailAndPassword(auth, email, password)
                        .then(async (userCredential) => { // Make the function async
                            // Signed in 
                            var user = userCredential.user;

                            // Insert user data into Spanner
                            try {
                                await insertUserData(user); // Use await inside the async function
                                // Redirect to user account page
                                window.location.href = '/'; // Change this to your account page URL
                            } catch (error) {
                                console.error('Error inserting user data into Spanner:', error);
                                // Show error message
                                Swal.fire({
                                    text: "Error saving user data. Please try again.",
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: {
                                        confirmButton: "btn btn-primary"
                                    }
                                });
                            }
                        })
                        .catch((error) => {
                            console.error('Error creating user:', error);
                            // Show error message
                            Swal.fire({
                                text: "Error creating user. Please try again.",
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

                            // Show success message
                            Swal.fire({
                                text: "You have successfully signed up!",
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
                        })
                        .catch((error) => {
                            var errorCode = error.code;
                            var errorMessage = error.message;

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
                    // Show error popup. For more info check the plugin's official documentation: https://sweetalert2.github.io/
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

        // // Handle Google Sign-In
        // googleButton.addEventListener('click', function (e) {
        //     e.preventDefault();

        //     var provider = new GoogleAuthProvider();
        //     signInWithPopup(auth, provider)
        //         .then((result) => {
        //             // This gives you a Google Access Token. You can use it to access the Google API.
        //             var credential = GoogleAuthProvider.credentialFromResult(result);
        //             var token = credential.accessToken;
        //             // The signed-in user info.
        //             var user = result.user;

        //             // Show success message
        //             Swal.fire({
        //                 text: "You have successfully signed in with Google!",
        //                 icon: "success",
        //                 buttonsStyling: false,
        //                 confirmButtonText: "Ok, got it!",
        //                 customClass: {
        //                     confirmButton: "btn btn-primary"
        //                 }
        //             }).then(function (result) {
        //                 if (result.isConfirmed) {
        //                     var redirectUrl = form.getAttribute('data-kt-redirect-url');
        //                     if (redirectUrl) {
        //                         location.href = redirectUrl;
        //                     }
        //                 }
        //             });
        //         })
        //         .catch((error) => {
        //             var errorCode = error.code;
        //             var errorMessage = error.message;

        //             // Show error message
        //             Swal.fire({
        //                 text: errorMessage,
        //                 icon: "error",
        //                 buttonsStyling: false,
        //                 confirmButtonText: "Ok, got it!",
        //                 customClass: {
        //                     confirmButton: "btn btn-primary"
        //                 }
        //             });
        //         });
        // });

        // Handle password input
        form.querySelector('input[name="password"]').addEventListener('input', function () {
            if (this.value.length > 0) {
                validator.updateFieldStatus('password', 'NotValidated');
            }
        });
    }

    // Password input validation
    var validatePassword = function () {
        return (passwordMeter.getScore() > 50);
    }

    var isValidUrl = function(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Public functions
    return {
        // Initialization
        init: function () {
            // Elements
            form = document.querySelector('#kt_sign_up_form');
            submitButton = document.querySelector('#kt_sign_up_submit');
            //googleButton = document.querySelector('#kt_sign_up_google');
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
