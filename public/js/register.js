$(document).ready(function() {
  $("#error").hide()
})

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validate({username, email, password, password2}) {
  if (password != password2)
    return "Passwords do not match"
  if (!validateEmail(email))
    return "Not a valid email address"
  if (username.length < 4) return "Username must be at least 4 characaters long"  
  if (password.length < 4) return "Password must be at least 4 characters long"  
}
function signup() {
  let username = $("#username").val()
  let email = $("#email").val()
  let password = $("#password").val()
  let password2 = $("#password2").val()

  let err = validate({username, email, password, password2});
  if (err) {
    $("#error").text(err);
    $("#error").show()
  }
  else
  $.ajax({
    method: 'POST',
    url: '/api/users',
    data: { username, password, email},
    success: function() {
      window.location.replace("/")
    },
    error: function(error) {
      $("#error").text("User already exists")
      $("#error").show()
    }
  })
}