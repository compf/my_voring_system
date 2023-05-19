 npm run ballot_authorization_receiver&
 timeout 5 npm run vote_authorization_provider

sleep 5

npm run ballot_provider&

 npm run ballot_requester