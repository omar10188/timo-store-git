const http = require("http");

const req1 = http.request("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log("NoSQL Test Response:", data));
});
req1.write(JSON.stringify({ email: { "$gt": "" }, password: "password123" }));
req1.end();

const req2 = http.request("http://localhost:5000/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log("Validation Test Response:", data));
});
req2.write(JSON.stringify({ name: "John Doe", email: "johndoe@test.com", password: "weak" }));
req2.end();

const req3 = http.request("http://localhost:5000/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log("XSS Test Response:", data));
});
req3.write(JSON.stringify({ name: "<script>alert(1)</script>", email: "testxss@test.com", password: "Password123!" }));
req3.end();
