var fs = require('fs')
  , path = require('path')
  , mocks_dir = path.resolve(__dirname, 'mocks')
  , mocks_files = fs.readdirSync(mocks_dir)
  , CLEAN_DIR = path.resolve(__dirname, 'clean')
  , mock
  ;

// Create output dir
if (!fs.existsSync(CLEAN_DIR)) {
  fs.mkdirSync(CLEAN_DIR);
}

// Loop over cached responses
mocks_files.some(function validatePayload (file) {

  // Only parse the json files!
  if (!/^\d{12}\.json/.test(file)) {
    return;   // Break out!
  }

  mock = JSON.parse(fs.readFileSync(path.resolve(mocks_dir, file), 'utf8'));

  // Skip invalid responses
  if (!mock.upcDetails.statusData || mock.upcDetails.statusData.ResponseCode !== '0') {
    console.info('  BAD RESPONSE in ' + file + '. Skipping!');
    return;
  }

  // Initialize
  var o = mock.upcDetails
    , doc = {}
    ;

  // Import Simple Attributes
  doc.brand = o.brandName;
  doc.title = o.variants[0].fullName;
  doc.shortDescription = o.shortDesc;
  doc.longDescription = o.longDesc;

  // Images (products loop)
  doc.images = [];
  o.products.forEach(function (product) {
    product.imgUrls.forEach(function (img) {
      if (-1 == doc.images.indexOf(img)) {
        doc.images.push(img);
      }
    });
  });

  // Fitments and Variants (variants loop)
  doc.fitments = [];
  doc.variants = [];
  o.variants.forEach(function (vrnt) {
    // Fitments
    if (-1 == doc.fitments.indexOf(vrnt.fitName)) {
      doc.fitments.push(vrnt.fitName);
    }
    // Variants
    if (-1 == doc.variants.indexOf(vrnt.upc)) {
      doc.variants.push({upc: vrnt.upc});
    }
  });

  // Write the document to disk
  fs.writeFile(CLEAN_DIR + '/' + file, JSON.stringify(doc), {encoding: 'utf8'}, function (err) {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log('  Saved ' + file + ' to disk!');
  });

});

// @todo Concat the documents into a flat file for mongoimport
