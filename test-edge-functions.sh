#!/bin/bash

# Test script for Edge Functions
# Run this after adding GROQ_API_KEY to Supabase

SUPABASE_URL="https://ofzicxdmlezuwipdjzfn.supabase.co"
ANON_KEY="YOUR_ANON_KEY_HERE"  # Replace with your actual anon key

echo "🧪 Testing Edge Functions..."
echo ""

# Test 1: Check if transcribe-recording function is accessible
echo "1️⃣ Testing transcribe-recording endpoint..."
curl -X POST "${SUPABASE_URL}/functions/v1/transcribe-recording" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"recordingId": "test"}' \
  --silent --show-error --fail-with-body

echo ""
echo ""

# Test 2: Check if generate-summary function is accessible
echo "2️⃣ Testing generate-summary endpoint..."
curl -X POST "${SUPABASE_URL}/functions/v1/generate-summary" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"recordingId": "test"}' \
  --silent --show-error --fail-with-body

echo ""
echo ""
echo "✅ Tests complete! Check the responses above."

