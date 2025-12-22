import { readFile } from "node:fs/promises";

async function upload() {
  const filePath = "./ingest_test.csv";

  let fileContent;
  try {
    fileContent = await readFile(filePath);
  } catch {
    console.error("File not found:", filePath);
    process.exit(1);
  }

  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    console.error("Missing ADMIN_TOKEN env var.");
    process.exit(1);
  }

  const blob = new Blob([fileContent], { type: "text/csv" });
  const formData = new FormData();
  formData.append("file", blob, "ingest_test.csv");

  console.log("Uploading with token...");
  try {
    const res = await fetch("http://localhost:3000/api/publish-csv", {
      method: "POST",
      body: formData,
      headers: {
        "x-admin-token": token,
      },
    });

    if (!res.ok) {
      console.error("Status:", res.status, res.statusText);
      console.error("Body:", await res.text());
      process.exit(1);
    }

    console.log("Success:", await res.json());
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

upload();

