mkdir -p build/ballot_collector/pki
mkdir -p build/ballot_provider/pki
mkdir -p build/key_provider/pki
mkdir -p build/ballot_provider/ballot_templates

cp -r src/key_provider/pki/* build/key_provider/pki 
cp -r src/ballot_provider/pki/* build/ballot_provider/pki
cp -r src/ballot_provider/ballot_templates/* build/ballot_provider/ballot_templates
cp -r src/ballot_collector/pki/* build/ballot_collector/pki
