sh test-working-interceptor.sh 
🖋️ INTERCEPTOR TEST - SH COMPATIBLE VERSION
===========================================
-e 
1️⃣ Testing Negative Price (should block):
[PEN-GUARD] Checking request
[BLOCKED] Negative price detected!
{"error": "Negative prices not allowed!", "blocked": true}
-e 
2️⃣ Testing SQL Injection (should block):
[PEN-GUARD] Checking request
[BLOCKED] SQL injection detected!
{"error": "SQL injection blocked!", "blocked": true}
-e 
3️⃣ Testing Valid Request (should pass):
[PEN-GUARD] Checking request
[PEN-GUARD] Request approved
{"method":"get_products","params":{"category":"luxury"}}
-e 
4️⃣ Testing Data Masking:
[DATA-PROTECTOR] Processing response
{"credit_card":"****-****-****-****","email":"***@***.com"}
-e 
✅ Test complete!
