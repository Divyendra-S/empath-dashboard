/**
 * Transcription Validator Utility
 * Detects and filters hallucinated content from Whisper transcriptions
 */

// Common hallucination phrases that Whisper generates
const HALLUCINATION_PATTERNS = [
  /thank you so much for coming/i,
  /i hope you(?:(?:'ll| will)? have a (?:very )?good|r?) (?:rest of your )?day/i,
  /see you (?:all )?(?:on|in) the next (?:one|day|time)/i,
  /please (?:like|subscribe|comment)/i,
  /don't forget to (?:like|subscribe|hit the bell)/i,
  /if you enjoyed this (?:video|content)/i,
  /(?:this|that) (?:is|was) (?:a|the) (?:really|very)? ?(?:long|short) list/i,
  /here'?s a really long list/i,
  /thank you\.? thank you/i,
  /(?:divyendra|yooki)/i, // Names that shouldn't appear repeatedly
];

// Generic filler patterns that might indicate hallucination
const FILLER_PATTERNS = [
  /^(?:uh|um|hmm|ah)+[,\.\s]*$/i,
  /^\s*\.\.\.\s*$/,
  /^(?:you know|like|basically|actually)+[,\.\s]*$/i,
];

export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-1, where 1 is highest confidence it's real
  issues: string[];
  cleanedTranscript?: string;
}

/**
 * Validates a transcript for hallucination indicators
 */
export function validateTranscript(
  transcript: string,
  durationSeconds?: number
): ValidationResult {
  const issues: string[] = [];
  let confidence = 1.0;

  if (!transcript || transcript.trim().length === 0) {
    return {
      isValid: true,
      confidence: 1.0,
      issues: [],
      cleanedTranscript: "",
    };
  }

  // Check for hallucination patterns
  let hallucinationCount = 0;
  for (const pattern of HALLUCINATION_PATTERNS) {
    if (pattern.test(transcript)) {
      hallucinationCount++;
      issues.push(`Detected hallucination pattern: ${pattern.source}`);
    }
  }

  if (hallucinationCount > 0) {
    confidence -= hallucinationCount * 0.3;
    issues.push(`Found ${hallucinationCount} hallucination pattern(s)`);
  }

  // Calculate words per minute if duration provided
  if (durationSeconds && durationSeconds > 0) {
    const wordCount = transcript.split(/\s+/).length;
    const wordsPerMinute = (wordCount / durationSeconds) * 60;

    // Normal speech is 120-180 WPM, flag if > 250 WPM
    if (wordsPerMinute > 250) {
      confidence -= 0.2;
      issues.push(
        `Unusually high speech rate: ${Math.round(
          wordsPerMinute
        )} WPM (expected 120-180)`
      );
    }

    // Flag very short audio with long transcript
    if (durationSeconds < 10 && wordCount > 50) {
      confidence -= 0.3;
      issues.push(
        `Short audio (${durationSeconds}s) with long transcript (${wordCount} words)`
      );
    }
  }

  // Check for repetitive patterns
  const lines = transcript.split(/[.!?]\s+/);
  const uniqueLines = new Set(lines.map((l) => l.trim().toLowerCase()));
  const repetitionRatio = uniqueLines.size / lines.length;

  if (lines.length > 3 && repetitionRatio < 0.5) {
    confidence -= 0.2;
    issues.push(
      `High repetition detected: ${Math.round(repetitionRatio * 100)}% unique`
    );
  }

  // Determine if transcript is valid
  const isValid = confidence > 0.5 && hallucinationCount < 2;

  // Create cleaned transcript by removing hallucinated sections
  let cleanedTranscript = transcript;
  if (!isValid || hallucinationCount > 0) {
    for (const pattern of HALLUCINATION_PATTERNS) {
      cleanedTranscript = cleanedTranscript.replace(pattern, "");
    }
    // Clean up extra whitespace
    cleanedTranscript = cleanedTranscript.replace(/\s+/g, " ").trim();
  }

  return {
    isValid,
    confidence: Math.max(0, Math.min(1, confidence)),
    issues,
    cleanedTranscript: isValid ? transcript : cleanedTranscript,
  };
}

/**
 * Checks if a transcript is likely completely hallucinated
 */
export function isLikelyHallucination(transcript: string): boolean {
  if (!transcript || transcript.trim().length === 0) {
    return false;
  }

  const validation = validateTranscript(transcript);
  return !validation.isValid && validation.confidence < 0.3;
}
