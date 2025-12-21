const fs = require('fs');

async function upload() {
  const filePath = './ingest_test.csv';
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath);
  const blob = new Blob([fileContent], { type: 'text/csv' });

  const formData = new FormData();
  formData.append('file', blob, 'ingest_test.csv');

  // Token provided by user
  const token = 'Cooper_Card_2025Bank2026_Calceleve';

  console.log('Uploading with token...');
  try {
    const res = await fetch('http://localhost:3000/api/publish-csv', {
      method: 'POST',
      body: formData,
      headers: {
        'x-admin-token': token
      }
    });

    if (!res.ok) {
       console.error('Status:', res.status, res.statusText);
       const txt = await res.text();
       console.error('Body:', txt);
       process.exit(1);
    }

    const json = await res.json();
    console.log('Success:', json);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

upload();
