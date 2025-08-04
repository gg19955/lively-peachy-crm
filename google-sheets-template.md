# Google Sheets Setup Template

## 1. Create New Google Sheets Document

Create a new Google Sheets document with exactly these tabs and headers:

### Contacts Sheet:
- Sheet name: `Contacts`
- Headers in Row 1: `Name | Email | Phone | Type | Status | Address | Notes`

### Leads Sheet:
- Sheet name: `Leads`  
- Headers in Row 1: `Property Address | Contact Name | Contact Email | Contact Phone | Stage | Priority | Estimated Value | Notes`

## 2. Get Spreadsheet ID

From your Google Sheets URL:
`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

Copy the `SPREADSHEET_ID_HERE` part.

## 3. Share with Service Account

1. Click "Share" button in Google Sheets
2. Add your service account email (from your credentials) 
3. Give it "Editor" permissions
4. Make sure "Notify people" is unchecked
5. Click "Send"

## 4. Test Connection

Use the spreadsheet ID in the app to test the connection.

## Common Issues:
- Service account email not added as editor
- Wrong spreadsheet ID copied
- Google Sheets API not enabled in Google Cloud Console
- Incorrect credentials format