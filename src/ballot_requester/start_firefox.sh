#!/bin/bash
uuid=$(<lastUUID)
#echo $uuid
json={'"'time'"':0,'"'uuid'"':'"'$uuid'"'}
echo $json 
#echo $re \n
curl -X POST https://ballotprovider.compf.me:3001/getBallot -H 'Content-Type: application/json'  -d $json --tlsv1.2 -k |cat > temp.html

firefox temp.html