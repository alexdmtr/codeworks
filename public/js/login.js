$(document).ready(function() {
  $("#error").hide()
})

function login() {
  let username = $("#username").val()
  let password = $("#password").val()

  $.ajax({
    method: 'POST',
    url: '/api/auth',
    data: { username, password },
    success: function() {
      window.location.replace("/")
    },
    error: function(error) {
      $("#error").show()
    }
  })
}