###
### Daniel Eck
###
#
CLEAN_DIR='clean'
IMPORT_FILE='import.json'
MOCKS_CACHE='http://ushofml302436.kih.kmart.com:8080/job/tryOn-api-validator/lastBuild/artifact/mocks/*zip*/mocks.zip'
#
# Download the latest mocks
wget "$MOCKS_CACHE" && unzip mocks.zip && rm mocks.zip
#
# Run the Node stuff
echo "Munging..."
node script.js
#
# Truncate
> "$IMPORT_FILE"
#
# Prepare the input file
for fn in "$CLEAN_DIR"/*.json; do
  cat "${fn}"
  echo
done >> "$IMPORT_FILE"
#
# Out with the old
echo "Dropping collection..."
mongo stocky --eval "db.stocky.products.drop()"
#
# In with the new
echo "Importing from cached responses..."
mongoimport --db stocky --collection stocky.products --file "$IMPORT_FILE"
#
# A little housekeeping
echo "Removing artifacts..."
rm "$IMPORT_FILE"
rm -rf "$CLEAN_DIR" mocks
#
echo "Finished!"
