# Logo Installation Instructions

## Step 1: Save the Logo File

1. Save the Max Facility logo image you provided as: `max-facility-logo.png`
2. Place it in the following directory:
   ```
   /public/images/max-facility-logo.png
   ```

## Step 2: Verify File Location

Your project structure should look like this:

```
Rink-Reports-Simplified/
├── public/
│   └── images/
│       └── max-facility-logo.png  ← Your logo file here
├── src/
├── package.json
└── ...
```

## What's Been Updated

The following components have been updated to use the logo:

### 1. Login Page (AuthLayout.tsx)
- Displays the full Max Facility logo (ice rink graphic)
- Shows "RINK REPORTS" text below in matching style
  - "RINK" in navy blue box (#2c4a73)
  - "REPORTS" in green box (#5cb85c)
  - Same bold, uppercase styling as "MAX FACILITY"

### 2. Header Navigation (MainLayout.tsx)
- Compact "MAX FACILITY" branding in header
- Matches logo color scheme
- Clickable link to dashboard

## Preview

**Login Page:**
```
┌────────────────────────────┐
│   [Max Facility Logo]      │
│   with ice rink graphic    │
│                            │
│  ┌─────┬──────────┐       │
│  │RINK │ REPORTS  │       │
│  └─────┴──────────┘       │
│                            │
│   [Login Form]             │
└────────────────────────────┘
```

**Header:**
```
┌──────────────────────────────────────┐
│ [MAX][FACILITY]  Home  Ice Depth ... │
└──────────────────────────────────────┘
```

## Color Reference

- Navy Blue: `#2c4a73` (matches "MAX" from logo)
- Green: `#5cb85c` (matches "FACILITY" from logo)
- White text on colored backgrounds
- Font: Black weight, uppercase, tight tracking

## Next Steps

1. Save your logo file to `/public/images/max-facility-logo.png`
2. Restart the dev server if it's running:
   ```bash
   npm run dev
   ```
3. Navigate to the login page to see the full logo
4. The header will show the compact branding on all authenticated pages

## Troubleshooting

**Logo not showing?**
- Verify file path: `/public/images/max-facility-logo.png`
- Check file name matches exactly (case-sensitive)
- Restart dev server
- Clear browser cache

**Text styling looks different?**
- Colors are matched to logo: #2c4a73 (blue) and #5cb85c (green)
- Font weight is `font-black` (900)
- Text is uppercase and tightly spaced
- Adjust px-4 py-2 values to match logo proportions if needed
