mkdir -p pki
mkdir -p src/ballot_collector/pki
mkdir -p src/ballot_provider/pki
mkdir -p src/vote_authorization_provider/pki
 openssl genrsa -out pki/my_ca-crt.pem.key 4096
 openssl req -new -key pki/my_ca-crt.pem.key -x509 -out pki/my_ca-crt.pem -days 3650 -subj "/CN=ca.compf.me"

 
openssl req -new -nodes -newkey rsa:4096 -keyout src/vote_authorization_provider/pki/vote_authorization_provider.key.pem -out src/vote_authorization_provider/pki/vote_authorization_provider.key.csr.pem -subj "/CN=keyprovider.compf.me"

openssl x509 -req -in src/vote_authorization_provider/pki/vote_authorization_provider.key.csr.pem -CA pki/my_ca-crt.pem -CAkey pki/my_ca-crt.pem.key -CAcreateserial -out src/vote_authorization_provider/pki/vote_authorization_provider.crt.pem -days 3650 -sha256 



openssl req -new -nodes -newkey rsa:4096 -keyout src/ballot_provider/pki/ballot_provider.key.pem -out src/ballot_provider/pki/ballot_provider.key.csr.pem -subj "/CN=ballotprovider.compf.me"

openssl x509 -req -in src/ballot_provider/pki/ballot_provider.key.csr.pem -CA pki/my_ca-crt.pem -CAkey pki/my_ca-crt.pem.key -CAcreateserial -out src/ballot_provider/pki/ballot_provider.cert.pem -days 3650 -sha256 


openssl req -new -nodes -newkey rsa:4096 -keyout src/ballot_collector/pki/ballot_collector.key.pem -out src/ballot_collector/pki/ballot_collector.key.csr.pem -subj "/CN=ballotcollector.compf.me"

openssl x509 -req -in src/ballot_collector/pki/ballot_collector.key.csr.pem -CA pki/my_ca-crt.pem -CAkey pki/my_ca-crt.pem.key -CAcreateserial -out src/ballot_collector/pki/ballot_collector.cert.pem -days 3650 -sha256 