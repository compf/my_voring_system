 openssl genrsa -out pki/my_ca-crt.pem.key 4096
 openssl req -new -key pki/my_ca-crt.pem.key -x509 -out pki/my_ca-crt.pem -days 3650

 
openssl req -new -nodes -newkey rsa:4096 -keyout src/key_provider/pki/key_provider.key.pem -out src/key_provider/pki/key_provider.key.csr.pem

openssl x509 -req -in src/key_provider/pki/key_provider.key.csr.pem -CA pki/my_ca-crt.pem -CAkey pki/my_ca-crt.pem.key -CAcreateserial -out src/key_provider/pki/key_provider.crt.pem -days 3650 -sha256 



openssl req -new -nodes -newkey rsa:4096 -keyout src/ballot_provider/pki/ballot_provider.key.pem -out src/ballot_provider/pki/ballot_provider.key.csr.pem

openssl x509 -req -in src/ballot_provider/pki/ballot_provider.key.csr.pem -CA pki/my_ca-crt.pem -CAkey pki/my_ca-crt.pem.key -CAcreateserial -out src/ballot_provider/pki/ballot_provider.cert.pem -days 3650 -sha256 