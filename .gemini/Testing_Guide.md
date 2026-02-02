# 🧪 Testing Guide: Interview Location in PDF

## Quick Test Steps

### Step 1: Open Candidates Page
1. Navigate to: `http://localhost:5173/recruitment/candidates`
2. You should see your list of candidates

### Step 2: Select Sasikumar (or any candidate)
1. Find "Sasikumar" in the candidates list
2. Click the **eye icon** (👁️) to view details
3. Click **"Generate Call Letter"** button

### Step 3: Fill Interview Details
In the modal that appears:

1. **Select Template**: Choose "Interview Call" (or similar)
2. **Role/Position**: Full Stack Developer (auto-filled)
3. **Interview Date**: 2026-01-22 (or any date)
4. **Time**: 11:45 (or any time)
5. **Round Name**: Technical Round 1
6. **Mode**: Select **"Offline"** ⭐ IMPORTANT
7. **Location/Address**: Enter "Infofocus, Chennai, India" (or your actual office address)

### Step 4: Generate PDF
1. Click **"Generate & Send"** button
2. Wait for success message
3. Check your email (mmikasa758@gmail.com)
4. Download and open the PDF attachment

### Step 5: Verify PDF Content
The PDF should show a table like this:

```
Interview Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Interview Date:    21/01/2026
Interview Time:    11:45
Round:             Technical Round 1
Interview Mode:    Offline
Venue:             Infofocus, Chennai, India  ✅ THIS SHOULD BE VISIBLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## What to Check

### ✅ Success Criteria
- [ ] Location field appears in the form when "Offline" is selected
- [ ] PDF is generated without errors
- [ ] Email is sent successfully
- [ ] PDF contains the "Venue:" row in the interview details table
- [ ] The venue shows the exact address you entered
- [ ] Company logo appears at the top
- [ ] HR signature appears at the bottom

### ❌ If Location is Missing
If the venue doesn't appear in the PDF:

1. **Check the template in database**:
   ```bash
   cd backend
   node update-interview-template.js
   ```

2. **Verify the template content**:
   - Go to Recruitment → Settings → Letter Templates
   - Find "Interview Call" template
   - Click Edit
   - Check if `{{interview_location}}` variable exists
   - Check if `{{#if isOffline}}` conditional exists

3. **Check browser console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any errors when generating the letter

## Test Scenarios

### Scenario 1: Offline Interview ✅
- Mode: Offline
- Expected: Shows "Venue:" with location
- Should NOT show: Meeting link

### Scenario 2: Online Interview ✅
- Mode: Online
- Expected: Shows "Meeting Link:" with clickable link
- Should NOT show: Venue

### Scenario 3: Telephone Interview ✅
- Mode: Telephone
- Expected: Shows only basic details (no venue, no link)

## Sample Data for Testing

### Test Case 1: Offline Interview
```
Candidate: Sasikumar
Role: Full Stack Developer
Date: 2026-01-22
Time: 11:45
Round: Technical Round 1
Mode: Offline
Location: Infofocus, 123 Tech Park, Chennai - 600001, India
```

### Test Case 2: Online Interview
```
Candidate: Sasikumar
Role: Full Stack Developer
Date: 2026-01-22
Time: 11:45
Round: Technical Round 1
Mode: Online
Link: https://meet.google.com/abc-defg-hij
```

## Expected Email

**Subject**: Start Your Journey with [Company Name]: Offer Letter Enclosed

**Body**: Professional email with PDF attachment

**Attachment**: `[Company]_Call_Letter_Sasikumar.pdf`

## Troubleshooting

### Issue: "Template not found"
**Solution**: Create a template from Recruitment Settings first

### Issue: "Location field not showing"
**Solution**: Make sure you selected "Offline" mode

### Issue: "PDF shows empty location"
**Solution**: 
1. Check if you filled the location field
2. Verify the template has `{{interview_location}}`
3. Re-run the update script

### Issue: "Email not received"
**Solution**: 
1. Check spam folder
2. Verify SMTP settings in .env
3. Check backend console for email errors

## Next: Test with Interview Scheduler

After verifying the PDF works:

1. Go to **Interview Scheduler** page
2. Find the scheduled interview for Sasikumar
3. Click **"Next Round / Offer"** button
4. Generate a "Next Round" letter
5. Verify it also shows the location correctly

## Success! 🎉

If you see the location in the PDF, the fix is working perfectly!

You can now:
- ✅ Generate interview call letters with location
- ✅ Send them to candidates via email
- ✅ Have professional PDFs with complete interview details
- ✅ Support both Online and Offline interview modes
