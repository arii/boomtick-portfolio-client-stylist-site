/**
 * Google Apps Script for Dynamic Form Lead Capture
 * Hair by April — Vintage & Curly Hair Specialist
 *
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Replace all code with this script.
 * 4. To TEST locally in the Apps Script editor:
 *    - Select "testDoPost" from the function dropdown at the top.
 *    - Click "▷ Run". Check the Execution Log (View > Execution log) to verify row insertion.
 * 5. To DEPLOY as Web App:
 *    - Click "Deploy" > "New deployment".
 *    - Select type: "Web app".
 *    - Description: "Dynamic Inquiry Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *    - Click "Deploy".
 *    - Copy the "Deployment ID" (e.g. AKfycbx123...).
 * 6. In your project environment (.env or Cloudflare Pages):
 *    - Set DEPLOYMENT_ID="your_deployment_id_here"
 */

/**
 * Main Webhook POST Handler
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Prevent concurrent write conflicts (wait up to 30 seconds)
  lock.tryLock(30000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Invalid request: No postData payload received.");
    }

    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    var headers = [];

    // Initialize default headers if sheet is brand new / blank
    if (lastRow === 0 || lastColumn === 0) {
      headers = ["Timestamp", "Recipient"];
      sheet.appendRow(headers);
      sheet
        .getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#f3f4f6");
      lastRow = 1;
      lastColumn = headers.length;
    } else {
      headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    }

    var fields = data.fields || [];
    var fieldMap = {};

    // Map field label -> value
    fields.forEach(function (f) {
      if (f.label) {
        fieldMap[f.label.trim()] = f.value;
      }
    });

    // Auto-create new column headers for any new fields added in TinaCMS
    fields.forEach(function (f) {
      var label = f.label.trim();
      if (headers.indexOf(label) === -1) {
        headers.push(label);
        sheet
          .getRange(1, headers.length)
          .setValue(label)
          .setFontWeight("bold")
          .setBackground("#f3f4f6");
      }
    });

    // Build the row matching dynamic header positions
    var row = [];
    headers.forEach(function (header) {
      var h = header.trim();
      if (h === "Timestamp" || h === "Submitted At" || h === "Date") {
        row.push(data.submittedAt ? new Date(data.submittedAt) : new Date());
      } else if (h === "Recipient") {
        row.push(data.recipient || "");
      } else if (fieldMap.hasOwnProperty(h)) {
        row.push(fieldMap[h]);
      } else {
        row.push("");
      }
    });

    // Append new inquiry lead row
    sheet.appendRow(row);
    Logger.log(
      "✅ Row inserted successfully for: " + (fieldMap["Your Name"] || "Lead")
    );

    // Send email notification to stylist
    if (data.recipient) {
      try {
        var emailBody = "✂️ New Hair by April Inquiry:\n\n";
        emailBody +=
          "Submitted At: " +
          (data.submittedAt || new Date().toISOString()) +
          "\n\n";
        fields.forEach(function (f) {
          emailBody += f.label + ":\n" + (f.value || "N/A") + "\n\n";
        });

        MailApp.sendEmail({
          to: data.recipient,
          subject:
            "✂️ New Styling Inquiry: " +
            (fieldMap["Your Name"] || fieldMap["Name"] || "New Client"),
          body: emailBody,
        });
        Logger.log("📧 Notification email sent to: " + data.recipient);
      } catch (mailErr) {
        Logger.log("⚠️ Email notification error: " + mailErr.toString());
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Lead recorded successfully",
        timestamp: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("❌ doPost Error: " + err.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: err.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Health check GET Handler
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "active",
      endpoint: "Hair by April - Dynamic Google Sheets Webhook",
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 🧪 Local Test Function (Run within Apps Script Editor)
 *
 * How to run:
 * 1. In the Apps Script toolbar at the top, select "testDoPost" in the dropdown.
 * 2. Click the "▷ Run" button.
 * 3. Open the "Execution log" at the bottom or check your Google Sheet to see the test row!
 */
function testDoPost() {
  Logger.log("🚀 Starting local testDoPost execution...");

  var testPayload = {
    recipient: Session.getActiveUser().getEmail() || "hello@hairbyapril.com",
    submittedAt: new Date().toISOString(),
    fields: [
      { label: "Your Name", value: "Test Client (Ariel)" },
      { label: "Email Address", value: "test.client@example.com" },
      { label: "Phone Number", value: "(415) 555-0192" },
      { label: "Event / Inquiry Type", value: "Wedding / Bridal Party" },
      { label: "Estimated Party Size", value: "5-8 People" },
      {
        label: "Target Date & Location (City or Venue)",
        value: "October 14, 2026 • San Francisco",
      },
      {
        label: "Styling Notes / Desired Aesthetics",
        value: "Vintage 1940s victory rolls and natural curl styling test",
      },
    ],
  };

  var mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload),
    },
  };

  var response = doPost(mockEvent);
  var responseText = response.getContent();
  Logger.log("📬 Result Output: " + responseText);

  var parsed = JSON.parse(responseText);
  if (parsed.status === "success") {
    Logger.log("🎉 TEST PASSED: Dynamic lead row added to Google Sheet!");
  } else {
    Logger.log("❌ TEST FAILED: " + parsed.message);
  }

  return responseText;
}
