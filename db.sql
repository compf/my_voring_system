CREATE TABLE BallotAuthorization(

    id TEXT,
    provider_id TEXT,
    time NUMBER,
    election TEXT,
    salt TEXT
);
CREATE TABLE BallotsIssued(

    id TEXT,
    time NUMBER
);
