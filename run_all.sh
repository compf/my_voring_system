 echo "AUTHORIZATION_RECEIVER"
 npm run ballot_authorization_receiver --single&
 sleep 5
  echo "AUTHORIZATION_PROVIDER"
 timeout 5 npm run vote_authorization_provider

sleep 5
 echo "BALLOT_PROVIDER"
npm run ballot_provider --single&
sleep 5
 echo "BALLOT_REQUESTER"
 npm run ballot_requester
sleep 5
killall node