import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function () {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        const signOutButton = document.getElementById('signOutButton');
        if (signOutButton) {
          signOutButton.addEventListener('click', function (event) {
            event.preventDefault(); 
            const auth = getAuth();
            signOut(auth).then(() => {
              // Show success message
              Swal.fire({
                text: `Signed Out!`,
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Ok, got it!",
                customClass: {
                  confirmButton: "btn btn-primary"
                }
              }).then(() => {
              // Redirect or reload after showing the message
              window.location.href = '/content_cockpit.html'; // Change this to your desired URL
            });
            }).catch((error) => {
              console.error('Error signing out:', error);
              let errorMessage = error.message;
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
          // Disconnect the observer once the button is found and event listener is added
          observer.disconnect();
        }
      }
    });
  });

  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });
});