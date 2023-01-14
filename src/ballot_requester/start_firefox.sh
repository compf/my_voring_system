curl -X POST https://ballotprovider.compf.me:3001/getBallot -H 'Content-Type: application/json'  -d '{"time":0,"uuid":"9ce861dc-31d2-4376-9088-c5786f38aa96"}' --tlsv1.2 -k |cat > temp.html

firefox temp.html