# Transcript Formatting Fix

## Issues Fixed

1. **Random text appearing in transcripts** - The LLM was adding meta-commentary like "Here is the formatted transcript:", "Upon closer inspection", "Let's reevaluate", etc.
2. **Incorrect speaker attribution** - Sometimes speakers were being flipped or misidentified
3. **Extra explanatory text** - The LLM was providing reasoning and multiple versions instead of just the final formatted conversation
4. **Transcript stuck in loading state** - The page wasn't automatically refreshing to show the completed transcript, requiring manual page reload

## Changes Made

### 1. Edge Function (`transcribe-recording`)

**File**: Supabase Edge Function `transcribe-recording`

#### Improvements:

- **Enhanced Prompt**: Updated the prompt to explicitly instruct the LLM to output ONLY the formatted conversation without any introductions, explanations, or additional text
- **Cleanup Function**: Added `cleanupFormattedTranscript()` function that:
  - Removes common LLM-added header/footer phrases
  - Filters out separator lines (e.g., `***`, `---`)
  - Only includes lines with proper speaker labels (Name: text format)
  - Skips meta-commentary and explanatory text

#### Specific Filters Added:

```typescript
// Skip these patterns:
- "here is the formatted transcript"
- "formatted transcript:"
- "here is the conversation"
- "output:"
- Lines starting with "note:" or "please note"
- Separator lines like "***" or "---"
```

#### Better Speaker Identification:

The prompt now explicitly states:

- Therapist typically: asks questions, guides conversation, provides insights, sets agenda
- Client typically: shares experiences, responds to questions, discusses personal matters
- Each line must start with the speaker's name followed by a colon
- Preserve the exact words spoken

### 2. Frontend Component (`conversation-transcript.tsx`)

**File**: `/components/sessions/conversation-transcript.tsx`

#### Improvements:

- **Enhanced Filtering**: Added comprehensive filtering to catch LLM-added text patterns:
  - "upon closer inspection"
  - "let's reevaluate"
  - "a more plausible"
  - "a more accurate"
  - "here is the final version"
  - "final version:"
  - "corrected version:"
  - "(This is unlikely"
- **Better Line Processing**:

  - Only processes lines that have proper speaker labels
  - Skips lines that look like meta-commentary
  - More careful about appending continuation lines

- **Stricter Parsing**:
  - Only includes lines matching the pattern: `Name: text`
  - Skips any line that doesn't look like actual conversation

## Expected Result

Now the transcript should display **only the conversation** like this:

```
divyendra1818: Yeah, hello, how are you?
divyendra: I'm good,
divyendra1818: tell me about your day, how's it been?
divyendra: It was a good day, I celebrated Diwali, it's a very big festival in India.
divyendra1818: yeah yeah I know I know so what will be a good time to meet tomorrow
divyendra: we can meet around 2 p.m.
divyendra1818: okay so let's end the call
divyendra: I will be available at 2 tomorrow okay bye
```

**Without any:**

- Header text like "Here is the formatted transcript:"
- Meta-commentary like "Upon closer inspection..."
- Multiple versions or reasoning
- Random explanatory text

## Testing

To test the fix:

1. **Create a new session** with a video call
2. **Record the conversation**
3. **Wait for transcription** to complete
4. **Check the transcript** in the session details page

The transcript should now show only the conversation with proper speaker attribution.

## Fallback Behavior

If the LLM formatting fails for any reason:

- The edge function will fall back to the raw Whisper transcription
- The frontend will still attempt to parse and clean up the text
- The session will not fail - it will always show something

## Speaker Attribution Logic

Speakers are identified as:

- **Therapist**: Username contains numbers (e.g., `divyendra1818`) or email symbols
- **Client**: Username without numbers (e.g., `divyendra`)

This heuristic works well because:

- Therapist accounts are typically email-based
- Client names are usually simple full names
- The LLM provides additional context-based attribution

## Future Improvements

If you still see issues:

1. **Check the raw transcript**: You can manually edit transcripts using the Edit button
2. **Provide feedback**: The more examples of incorrect attributions, the better we can tune the prompt
3. **Consider speaker diarization**: Whisper v3 doesn't support native speaker diarization, but we could explore alternatives like pyannote.audio

### 3. Session Detail Page Auto-Refresh (`app/(dashboard)/dashboard/sessions/[id]/page.tsx`)

**File**: `/app/(dashboard)/dashboard/sessions/[id]/page.tsx`

#### Problem:

After ending a call, the transcript would stay in "loading" state indefinitely until the user manually refreshed the page.

#### Solution:

Added automatic polling that checks for updates every 3 seconds when:

1. **Transcript is processing** - Automatically checks when transcript_status is "processing"
2. **Summary is processing** - Automatically checks when summary_status is "processing"
3. **Recording is being uploaded** - If session is completed but no recording exists yet (recording might still be uploading from Daily.co)

#### How it works:

```typescript
useEffect(() => {
  const hasProcessingTranscript = session?.recordings?.some(
    (r) => r.transcript_status === "processing"
  );
  const hasProcessingSummary = session?.recordings?.some(
    (r) => r.summary_status === "processing"
  );
  const isCompletedWithoutRecording =
    (session?.status === "completed" || session?.status === "cancelled") &&
    (!session?.recordings || session.recordings.length === 0);

  if (
    hasProcessingTranscript ||
    hasProcessingSummary ||
    isCompletedWithoutRecording
  ) {
    const interval = setInterval(() => {
      refetch(); // Refetch session data
    }, 3000); // Every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount or when conditions change
  }
}, [session?.recordings, session?.status, refetch]);
```

#### Benefits:

- ✅ No manual page refresh needed
- ✅ Transcript appears automatically when ready
- ✅ Summary appears automatically when ready
- ✅ Efficient - polling stops automatically when processing is complete
- ✅ Handles all edge cases (no recording yet, processing, etc.)

## Deployment

✅ Edge function deployed (version 4)  
✅ Frontend component updated  
✅ Auto-refresh polling added
✅ No breaking changes - existing transcripts will be re-parsed with the new logic

The fix is now live and will apply to all new transcriptions automatically!
