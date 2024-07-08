const firebaseConfig = {
  apiKey: "AIzaSyA4G4e6kBbF9yz20qgljzGaxR_bL-qumb0",
  authDomain: "coffee-shop-433c9.firebaseapp.com",
  databaseURL: "https://coffee-shop-433c9-default-rtdb.firebaseio.com",
  projectId: "coffee-shop-433c9",
  storageBucket: "coffee-shop-433c9.appspot.com",
  messagingSenderId: "19791431358",
  appId: "1:19791431358:web:0dffa5058f2d6cc76bc0ef",
  measurementId: "G-W9CX9YEKCY"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics(app);
const database = firebase.database(app);
const storage = firebase.storage(app);

$(document).ready(function () {
  function generateRandomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomCode = "";
    for (let i = 0; i < 6; i++) {
      randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomCode;
  }

  function saveSubscriptionToFirebase(email, couponCode) {
    const subscriptionRef = database.ref('subscriptions').push();
    subscriptionRef.set({
      email: email,
      couponCode: couponCode
    });
  }

  function saveBookingToFirebase(email, name, date, time, numberOfPersons) {
    const bookingRef = database.ref('bookings').push();
    bookingRef.set({
      email: email,
      name: name,
      date: date,
      time: time,
      numberOfPersons: numberOfPersons
    });
  }

  function uploadImageToFirebase(file, callback) {
    const storageRef = storage.ref('images/' + file.name);
    storageRef.put(file).then((snapshot) => {
      snapshot.ref.getDownloadURL().then((downloadURL) => {
        callback(downloadURL);
      });
    });
  }

  function saveBlogToFirebase(title, author, content, imageUrl) {
    const blogRef = database.ref('blogs').push();
    blogRef.set({
      title: title,
      author: author,
      content: content,
      imageUrl: imageUrl
    });
  }

  function saveTestimonialToFirebase(name, content, imageUrl) {
    const testimonialRef = database.ref('testimonials').push();
    testimonialRef.set({
      name: name,
      content: content,
      imageUrl: imageUrl
    });
  }

  $("#button-addon2").click(function () {
    var emailInput = $('#subscribeForm input[type="email"]').val();
    if (emailInput) {
      const randomCode = generateRandomCode();
      saveSubscriptionToFirebase(emailInput, randomCode);
      $("#subscribeDialog .modal-body").html(`
        <p>Thank you for subscribing! You are eligible for a 15% discount coupon.</p>
        <p>You have entered the following email: ${emailInput}</p>
        <p>COUPON: ${randomCode}</p>
        <p>Please screenshot this information and show it at reception to get the DISCOUNT.</p>
      `);
      $("#subscribeDialog").modal("show");
      $('#subscribeForm input[type="email"]').val("");
    } else {
      alert("Please enter your email.");
    }
  });

  $("#bookingForm").on("submit", function (e) {
    e.preventDefault();
    bookTable();
  });

  function bookTable() {
    const email = $("#email").val();
    const name = $("#name").val();
    const date = $("#date").val();
    const time = $("#time").val();
    const numberOfPersons = $("#number_of_persons").val();

    if (!email || !name || !date || !time || !numberOfPersons) {
      alert("Please fill in all fields to book a table.");
      return;
    }

    saveBookingToFirebase(email, name, date, time, numberOfPersons);

    $("#bookingConfirmation .modal-body").html(`
      <p>Thank you for booking a table with us. Your booking details are shown below. If you want to cancel your booking or make some changes, contact us via mail.</p>
      <p>Email: ${email}</p>
      <p>Name: ${name}</p>
      <p>Date: ${date}</p>
      <p>Time: ${time}</p>
      <p>Number of Persons: ${numberOfPersons}</p>
      <p>Please screenshot this information for your records.</p>
    `);
    $("#bookingConfirmation").modal("show");

    resetBookingForm();
  }

  function resetBookingForm() {
    $("#bookingForm")[0].reset();
  }

  $("#blog-radio").on("change", function () {
    $("#blog-form").show();
    $("#testimonials-form").hide();
  });

  $("#testimonials-radio").on("change", function () {
    $("#blog-form").hide();
    $("#testimonials-form").show();
  });

  $("#blog-form").on("submit", function (e) {
    e.preventDefault();
    var blogTitle = $("#blog-title").val();
    var blogAuthor = $("#blog-author").val();
    var blogContent = $("#blog-content").val();
    var blogImage = $("#blog-image")[0].files[0];

    if (blogTitle && blogAuthor && blogContent && blogImage) {
      uploadImageToFirebase(blogImage, function (imageUrl) {
        saveBlogToFirebase(blogTitle, blogAuthor, blogContent, imageUrl);

        $("#thank-you-dialog .modal-body").html(`
          <p>Thank you for your precious time to write your precious words! We will review the data you entered, and if nothing harms our policy, we will add it to our website within 24 hours.</p>
          <p>If you want to delete your response, please contact us via email.</p>
          <p>You have submitted the following blog:</p>
          <p>Title: ${blogTitle}</p>
          <p>Author: ${blogAuthor}</p>
          <p>Content: ${blogContent}</p>
          <p>Image: ${blogImage.name}</p>
          <p>Please screenshot this information for your records.</p>
        `);
        $("#thank-you-dialog").modal("show");
        $("#blog-form")[0].reset();
        $("#blog-form").hide();
      });
    } else {
      alert("Please fill in all fields and upload an image.");
    }
  });

  $("#testimonials-form").on("submit", function (e) {
    e.preventDefault();
    var testimonialName = $("#testimonial-name").val();
    var testimonialContent = $("#testimonial-content").val();
    var testimonialImage = $("#testimonial-image")[0].files[0];

    if (testimonialName && testimonialContent && testimonialImage) {
      uploadImageToFirebase(testimonialImage, function (imageUrl) {
        saveTestimonialToFirebase(testimonialName, testimonialContent, imageUrl);

        $("#thank-you-dialog .modal-body").html(`
          <p>Thank you for your precious time to write your precious words! We will review the data you entered, and if nothing harms our policy, we will add it to our website within 24 hours.</p>
          <p>If you want to delete your response, please contact us via email.</p>
          <p>You have submitted the following testimonial:</p>
          <p>Name: ${testimonialName}</p>
          <p>Content: ${testimonialContent}</p>
          <p>Image: ${testimonialImage.name}</p>
          <p>Please screenshot this information for your records.</p>
        `);
        $("#thank-you-dialog").modal("show");
        $("#testimonials-form")[0].reset();
        $("#testimonials-form").hide();
      });
    } else {
      alert("Please fill in all fields and upload an image.");
    }
  });

  $("#book-now-button").click(function () {
    bookTable();
  });
});
document.addEventListener("DOMContentLoaded", function() {

  document.getElementById("sidebarToggle").addEventListener("click", function() {
    document.getElementById("mySidebar").classList.toggle("active");
  });

  
  document.querySelector(".closebtn").addEventListener("click", function() {
    document.getElementById("mySidebar").classList.remove("active");
  });

  document.getElementById("mySidebar").classList.remove("active");
});
