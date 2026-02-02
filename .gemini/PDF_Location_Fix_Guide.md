# PDF Location Fix Guide

## Issue Summary
The interview call letter PDF is not displaying the **interview location** when the interview mode is set to "Offline".

## Root Cause
The letter template in the database needs to include the `{{interview_location}}` variable to display the location in the PDF. The backend is correctly passing the data, but the template content doesn't reference it.

## Available Variables in PDF Templates

The following variables are available for use in letter templates:

### Common Variables:
- `{{candidate_name}}` - Candidate's full name
- `{{candidate_email}}` - Candidate's email
- `{{job_role}}` - Position/Role
- `{{company_name}}` - Company name from branding
- `{{current_date}}` - Current date
- `{{hr_name}}` - HR Manager name

### Interview-Specific Variables:
- `{{interview_date}}` - Interview date (formatted)
- `{{interview_time}}` - Interview time
- `{{interview_mode}}` - Mode: Online/Offline/Telephone
- `{{interview_location}}` - Physical location (for Offline interviews)
- `{{interview_link}}` - Meeting link (for Online interviews)
- `{{round_name}}` - Interview round name (e.g., "Technical Round 1")

### Offer-Specific Variables:
- `{{ctc}}` - Annual CTC/Salary
- `{{joining_date}}` - Joining date
- `{{expiry_date}}` - Offer expiry date

### Conditional Helpers:
- `{{#if isOffline}}...{{/if}}` - Show content only for Offline interviews
- `{{#if isOnline}}...{{/if}}` - Show content only for Online interviews

## Solution: Update Interview Call Letter Template

### Recommended Template Content

```html
<p>Date: {{current_date}}</p>
<p>Ref: {{reference_no}}</p>

<p>Dear <strong>{{candidate_name}}</strong>,</p>

<p>We are pleased to inform you that you have been shortlisted for the <strong>{{round_name}}</strong> interview for the position of <strong>{{job_role}}</strong> at <strong>{{company_name}}</strong>.</p>

<h3 style="color: #1e293b; margin-top: 25px;">Interview Details:</h3>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569; width: 180px;">Interview Date:</td>
        <td style="padding: 12px 0; color: #0f172a;">{{interview_date}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569;">Interview Time:</td>
        <td style="padding: 12px 0; color: #0f172a;">{{interview_time}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569;">Interview Mode:</td>
        <td style="padding: 12px 0; color: #0f172a;">{{interview_mode}}</td>
    </tr>
    {{#if isOffline}}
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569;">Venue:</td>
        <td style="padding: 12px 0; color: #0f172a;">{{interview_location}}</td>
    </tr>
    {{/if}}
    {{#if isOnline}}
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569;">Meeting Link:</td>
        <td style="padding: 12px 0; color: #2563eb;">
            <a href="{{interview_link}}" style="color: #2563eb; text-decoration: none;">{{interview_link}}</a>
        </td>
    </tr>
    {{/if}}
</table>

<p style="margin-top: 20px;">Please ensure you are available at the scheduled time. If you have any questions or need to reschedule, please contact our HR team.</p>

<p style="margin-top: 20px;">We wish you all the best for your interview.</p>

<p style="margin-top: 30px;">Best regards,<br>
<strong>{{hr_name}}</strong><br>
HR Department<br>
{{company_name}}</p>
```

## How to Update the Template

### Option 1: Via Frontend (Recruitment Settings)

1. Navigate to **Recruitment → Settings**
2. Go to the **Letter Templates** section
3. Find the "Interview Call Letter" template
4. Click **Edit**
5. Replace the `bodyContent` with the template above
6. Click **Save**

### Option 2: Via Database (MongoDB)

If you have direct database access:

```javascript
db.lettertemplates.updateOne(
  { type: "Interview Call" },
  {
    $set: {
      bodyContent: `<p>Date: {{current_date}}</p>
<p>Dear <strong>{{candidate_name}}</strong>,</p>
<p>We are pleased to inform you that you have been shortlisted for the <strong>{{round_name}}</strong> interview for the position of <strong>{{job_role}}</strong> at <strong>{{company_name}}</strong>.</p>
<h3 style="color: #1e293b; margin-top: 25px;">Interview Details:</h3>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569; width: 180px;">Interview Date:</td>
        <td style="padding: 12px 0; color: #0f172a;">{{interview_date}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569;">Interview Time:</td>
        <td style="padding: 12px 0; color: #0f172a;">{{interview_time}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569;">Interview Mode:</td>
        <td style="padding: 12px 0; color: #0f172a;">{{interview_mode}}</td>
    </tr>
    {{#if isOffline}}
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569;">Venue:</td>
        <td style="padding: 12px 0; color: #0f172a;">{{interview_location}}</td>
    </tr>
    {{/if}}
    {{#if isOnline}}
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #475569;">Meeting Link:</td>
        <td style="padding: 12px 0; color: #2563eb;">
            <a href="{{interview_link}}" style="color: #2563eb; text-decoration: none;">{{interview_link}}</a>
        </td>
    </tr>
    {{/if}}
</table>
<p style="margin-top: 20px;">Please ensure you are available at the scheduled time. If you have any questions or need to reschedule, please contact our HR team.</p>
<p style="margin-top: 20px;">We wish you all the best for your interview.</p>`
    }
  }
);
```

## Testing Steps

After updating the template:

1. Go to **Candidates** page
2. Select a candidate
3. Click **Generate Call Letter**
4. Select the "Interview Call" template
5. Fill in the interview details:
   - Set Mode to **Offline**
   - Enter a location (e.g., "Infofocus, City, Country")
6. Click **Generate & Send**
7. Check the generated PDF - it should now show the location

## Verification Checklist

- [ ] Template updated with `{{interview_location}}` variable
- [ ] Conditional `{{#if isOffline}}` block added
- [ ] PDF generated successfully
- [ ] Location appears in PDF when mode is "Offline"
- [ ] Meeting link appears in PDF when mode is "Online"
- [ ] Email sent successfully with PDF attachment

## Additional Notes

- The backend is already correctly passing all the data
- The frontend form is correctly capturing the location
- Only the template content needed to be updated
- The Handlebars conditional helpers (`{{#if}}`) are already registered in the PDF service
