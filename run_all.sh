 npm run ballot_authorization_receiver --single&
 sleep 5
 timeout 5 npm run vote_authorization_provider

sleep 5

npm run ballot_provider --single&
sleep 5
 npm run ballot_requester
sleep 5
killall node