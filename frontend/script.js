<!DOCTYPE html>
<html>
<head>
  <title>Meu Sistema</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

</body>
</html>

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  alert("Registrado!");
});

