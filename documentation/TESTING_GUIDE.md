# Testing Guide: OpenAI API Key Validation Fix

## Overview
This guide helps you test the OpenAI API key validation improvements to ensure the fix is working correctly.

## Test Scenarios

### ✅ Test 1: Valid API Key

**Setup**:
1. Start the server: `npm start` (from root)
2. Start the client: `npm start` (from client folder)
3. Navigate to a match page
4. Enter a **valid OpenAI API key** in the "OpenAI API Key (Optional)" field

**Expected Behavior**:
- ✅ Input field shows green checkmark: "✅ Key Valid"
- ✅ "OpenAI-POC (Dynamic Generation)" option becomes available
- ✅ Select OpenAI mode from "AI Mode" dropdown
- ✅ Click "▶️ Simulate Live" button
- ✅ Each ball displays dynamically generated commentary
- ✅ Server logs show:
  ```
  🔐 Validating OpenAI API key with test request...
  ✅ OpenAI API key validated successfully
  [Processing 12 balls...]
  ```

**Pass Criteria**:
- All 12 balls get commentary
- No 401/429 errors
- Server makes exactly 13 API calls (1 validation + 12 balls)

---

### ❌ Test 2: Invalid API Key Format

**Setup**:
1. In the "OpenAI API Key" field, enter: `invalid-key-123`
2. Tab out or wait for validation

**Expected Behavior**:
- ❌ Input field shows red error: "Invalid OpenAI key format. Key should start with 'sk-' and be at least 40 characters."
- ❌ "OpenAI-POC" option is NOT available in AI Mode dropdown
- ❌ User cannot select OpenAI mode
- ✅ "No AI (Local Lookup)" is selected by default

**Pass Criteria**:
- Frontend validation catches the error before backend call
- No API calls made to server
- User gets clear feedback about what's wrong with the key

---

### ❌ Test 3: Invalid API Key (Correct Format, Wrong Secret)

**Setup**:
1. Enter a key with correct format but invalid secret: `sk-proj-wrongkeywrongkeywrongkeywrongkey`
2. Wait for validation

**Expected Behavior**:
- ❌ Backend validation fails
- ❌ Input field shows red error: "Invalid OpenAI API key. Please check your key and try again."
- ❌ "OpenAI-POC" option becomes disabled
- ✅ Server makes **only 1 API call** (validation test)
- ✅ Server logs show:
  ```
  🔐 Validating OpenAI API key with test request...
  ❌ OpenAI API key validation failed: Incorrect API key provided...
  ```

**Pass Criteria**:
- Only 1 API call is made (validation)
- No attempt to process 12 balls with invalid key
- Server stops immediately when validation fails
- User gets clear error message

---

### 💰 Test 4: Quota Exceeded (Billing Issue)

**Setup**:
1. Use a valid OpenAI API key that has quota exceeded (e.g., free trial used up)
2. Enter the key in the field
3. Wait for validation

**Expected Behavior**:
- ❌ Input field shows red error: "Invalid OpenAI API key. Please check your key and try again." (or specific quota message)
- ❌ "OpenAI-POC" option becomes disabled
- ✅ Server makes **only 1 API call** (validation test)
- ✅ Server logs show:
  ```
  🔐 Validating OpenAI API key with test request...
  ❌ OpenAI API key validation failed: You exceeded your current quota...
  ```

**Pass Criteria**:
- Only 1 API call is made (NOT 12)
- Error is caught immediately
- User doesn't waste quota on 12 failed ball requests
- Clear guidance: "Please check your plan and billing details"

---

### ✅ Test 5: Valid Key but Switch Modes

**Setup**:
1. Enter a **valid OpenAI API key**
2. Wait for validation (should show ✅ Key Valid)
3. Select "OpenAI-POC (Dynamic Generation)" from AI Mode
4. Click "▶️ Simulate Live" and let it process a few balls
5. Click "⏸️ Pause" to stop simulation
6. Switch back to "No AI (Local Lookup)" from AI Mode dropdown

**Expected Behavior**:
- ✅ AI Mode switches without errors
- ✅ Server makes fresh request for local commentary
- ✅ Commentary changes from dynamic to local lookup
- ✅ No OpenAI API calls when in local mode
- ✅ User can switch modes multiple times

**Pass Criteria**:
- Mode switching works smoothly
- No mixed or corrupted commentary
- Proper fallback between modes

---

### ❌ Test 6: No Key Provided (Default to Local)

**Setup**:
1. Don't enter any OpenAI API key (leave field empty)
2. Check AI Mode dropdown options

**Expected Behavior**:
- ✅ "No AI (Local Lookup)" is available and selected
- ❌ "OpenAI-POC (Dynamic Generation)" is available BUT disabled
- ✅ Clicking "▶️ Simulate Live" uses local commentary
- ✅ No API calls to OpenAI
- ✅ Fallback works gracefully

**Pass Criteria**:
- Default to local mode works
- No errors when key is empty
- Commentary is loaded from local lookups

---

## Server-Side Validation Checklist

### HTTP Status Codes
- [ ] Valid key: Returns **200 OK** with balls + commentary
- [ ] Invalid key format (from frontend): Validation fails before backend call
- [ ] Invalid key (correct format, wrong secret): Returns **401 Unauthorized**
- [ ] Quota exceeded: Returns **429 Too Many Requests**
- [ ] No key + server not configured: Returns **503 Service Unavailable**

### API Call Count
- [ ] Valid key: Exactly **13 API calls** (1 validation + 12 balls)
- [ ] Invalid key: Exactly **1 API call** (validation only, stops on error)
- [ ] Quota exceeded: Exactly **1 API call** (validation only, stops on error)
- [ ] Local mode: **0 API calls** (no OpenAI calls)

### Server Logs
- [ ] Shows validation attempt: `🔐 Validating OpenAI API key with test request...`
- [ ] Shows success: `✅ OpenAI API key validated successfully`
- [ ] Shows failure: `❌ OpenAI API key validation failed: [error message]`
- [ ] No repeated error messages (only 1 validation error, not 12)

---

## Frontend Validation Checklist

### Input Field Behavior
- [ ] Password field hides key characters
- [ ] Real-time format validation on input
- [ ] Shows spinner while validating with backend
- [ ] Shows ✅ green checkmark when valid
- [ ] Shows ❌ red error message when invalid
- [ ] Shows helpful text: "Enter your OpenAI API key to enable dynamic commentary generation..."

### Mode Selection
- [ ] OpenAI option disabled when key is invalid or empty
- [ ] Local mode available as fallback
- [ ] Can switch modes without losing data
- [ ] Proper state management (openaiKeyValid, openaiValidating, openaiError)

---

## Performance Metrics

### Expected Times
| Scenario | Expected Time | Max Acceptable |
|----------|---------------|-----------------|
| Valid key validation | <1 second | 2 seconds |
| Invalid key validation | <1 second | 2 seconds |
| Process 12 balls (valid key) | 2-5 seconds | 10 seconds |
| Switch from OpenAI to Local | <1 second | 2 seconds |

### API Call Costs
| Scenario | API Calls | Estimated Cost |
|----------|-----------|-----------------|
| Valid key (1 match) | 13 calls | ~$0.002-0.003 |
| Invalid key (1 match) | 1 call | ~$0.0001-0.0002 |
| Local only (1 match) | 0 calls | FREE |

---

## Edge Cases to Test

### 1. Rapid Key Changes
- Enter a key, change it quickly, change it again
- Expected: Should cancel previous validations and validate the new key

### 2. Very Long Keys
- Enter a key that's extremely long (200+ chars)
- Expected: Should handle gracefully (ignore extra length)

### 3. Special Characters
- Enter keys with special characters: `sk-proj-test!@#$%^&*()`
- Expected: Should be passed to backend as-is (format validation happens there)

### 4. Network Latency
- Simulate slow network (DevTools → Network → Throttle)
- Expected: Spinner should show while validating

### 5. Backend Down
- Stop the server, try to validate a key
- Expected: Clear error message "Failed to validate... Is the backend running?"

### 6. Concurrent Requests
- Rapidly click different match pages
- Expected: No race conditions, each page validates independently

---

## Browser Console Checks

Open DevTools (F12) → Console tab to verify:

### Should NOT see errors:
```javascript
❌ Uncaught TypeError: validateOpenAIKey is not defined
❌ Cannot read property 'openaiKey' of undefined
❌ Axios error: 500 Internal Server Error
```

### Should see info logs:
```javascript
✅ API call: GET /api/validate-openai-key
✅ API call: GET /api/matches/:id/balls?aiMode=openai
✅ Validation response: {valid: true}
```

---

## Network Tab Analysis

### Valid Key Scenario
```
Request 1: GET /api/validate-openai-key
  Headers: x-openai-api-key: sk-proj-...
  Response: 200 OK {valid: true}
  Time: ~800ms

Request 2: GET /api/matches/1/balls?language=en&aiMode=openai
  Headers: x-openai-api-key: sk-proj-...
  Response: 200 OK [12 balls with commentary]
  Time: ~3000ms (includes OpenAI API calls)
```

### Invalid Key Scenario
```
Request 1: GET /api/validate-openai-key
  Headers: x-openai-api-key: sk-proj-invalid
  Response: 401 Unauthorized {valid: false, error: "..."}
  Time: ~800ms

Request 2: NOT MADE (validation failed, user can't select OpenAI mode)
```

---

## Troubleshooting

### Issue: "Always falls back to local commentary"
**Check**:
- Is the OpenAI API key correct?
- Does the account have available quota?
- Is the account billing active?
- Check browser console for validation errors

### Issue: "Server logs show 12 error messages"
**Check**:
- Validation is NOT happening upfront (bug in backend)
- Verify the updated `generateCommentaryForBallsWithOpenAI()` function is in place
- Check if changes were saved and server restarted

### Issue: "Validation takes too long (>5 seconds)"
**Check**:
- Network latency to OpenAI API
- Server CPU load
- Browser throttling (if testing with throttling)

### Issue: "Key shows as invalid but I know it's valid"
**Check**:
- Is the key in sessionStorage? (Browser → DevTools → Application → Session Storage)
- Is the format check too strict? (Must start with `sk-` and be 40+ chars)
- Try clearing browser cache/storage and re-entering the key

---

## Final Verification Checklist

Before marking the fix as complete:

- [ ] All 6 test scenarios pass
- [ ] HTTP status codes are correct (200, 401, 429, 503)
- [ ] API call counts match expectations
- [ ] Server logs show validation messages
- [ ] No console errors in browser
- [ ] Network tab shows correct requests
- [ ] Performance metrics are acceptable
- [ ] Edge cases handled gracefully
- [ ] Frontend validation feedback is clear
- [ ] Mode switching works smoothly

---

## Test Report Template

```
Date: ___________
Tester: ___________
OpenAI Key Used: (REDACTED / Test Key / Valid Key)

Test Results:
- Test 1 (Valid Key): ✅ PASS / ❌ FAIL
- Test 2 (Invalid Format): ✅ PASS / ❌ FAIL
- Test 3 (Invalid Secret): ✅ PASS / ❌ FAIL
- Test 4 (Quota Exceeded): ✅ PASS / ❌ FAIL
- Test 5 (Mode Switching): ✅ PASS / ❌ FAIL
- Test 6 (No Key): ✅ PASS / ❌ FAIL

Issues Found: (If any)
- Issue 1: _______________
- Issue 2: _______________

Notes:
_______________________________________________
_______________________________________________
```

---

This testing guide ensures the OpenAI API key validation fix is working correctly across all scenarios!
