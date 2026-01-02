# Image Loading Issues - Diagnosis and Fix

## Issues Found

### 1. ✅ FIXED: Missing Placeholder Image
**Problem**: The app was trying to load `/placeholder.png` which didn't exist, causing hundreds of 404 errors.

**Solution**: Created and added `placeholder.png` to the `public/` directory.

---

### 2. ⚠️ ACTION REQUIRED: Invalid Telegram File IDs

**Problem**: Many images in your database have invalid Telegram file IDs. This causes:
- CDN routes returning 404 errors
- `ETELEGRAM: 400 Bad Request: wrong file_id or the file is temporarily unavailable` errors
- Images failing to load

**Possible Causes**:
- Old test data with incorrect file IDs
- Files deleted from Telegram channels
- Database migration issues
- Using wrong bot to retrieve files uploaded by a different bot

**Current Status**: 
The error logs show file IDs like `695794c02c08bf70e3e7923f` are returning `wrong file_id` errors from Telegram's API.

---

## Solutions

### Option 1: Identify and Clean Up Invalid Images (Recommended)

I've created a cleanup script to help you:

```bash
# 1. First, do a dry run to see which images are invalid
node scripts/cleanup-invalid-images.js --dry-run

# 2. Review the list, then delete invalid images
node scripts/cleanup-invalid-images.js --delete
```

The script will:
- Check each image's Telegram file ID against all configured bots
- Identify which images are invalid
- Optionally delete them from the database

### Option 2: Manual Investigation

If you want to investigate specific images:

1. Check the MongoDB database for images with invalid file IDs
2. Cross-reference with Telegram bot channels to see if files exist
3. Manually delete problematic entries

---

## How to Prevent This in the Future

### 1. Always Track Which Bot Uploaded the File

The current system already does this via the `uploadedByBot` field. Make sure all new uploads include this field.

### 2. Don't Delete Files from Telegram Channels

Once an image is uploaded to a Telegram channel, don't delete it manually. Use the app's delete functionality which removes both the database record and Telegram file.

### 3. Regular Cleanup

Run the cleanup script periodically to identify orphaned or invalid references.

---

## Current System Behavior

When an image fails to load:
1. CDN tries to get the file from Telegram (using the stored bot name if available)
2. If that fails, it tries all configured bots (fallback)
3. If no bot can find the file, CDN returns 404
4. Frontend catches the error and shows `/placeholder.png`

This is working as designed, but you have invalid data that needs cleanup.

---

## Next Steps

1. ✅ Placeholder image has been added - no more 404 spam
2. ⏳ Run the cleanup script to identify invalid images:
   ```bash
   node scripts/cleanup-invalid-images.js --dry-run
   ```
3. ⏳ Review the output and decide whether to delete them
4. ⏳ Monitor logs after cleanup to ensure errors are resolved

---

## Need Help?

If you see specific file IDs that should be valid but are failing, check:
- Are the Telegram bot tokens correctly configured in `.env`?
- Do the channels still exist and have the files?
- Did the file IDs get corrupted during any migration?

The cleanup script will help identify the scope of the issue.
