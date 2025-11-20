# Text-to-Speech Setup Guide

## Overview
This project includes a text-to-speech feature using TypeCast.ai API. The feature allows assistant text to be converted to speech with different voices based on the assistant's persona and gender.

## Setup Instructions

### 1. TypeCast.ai Setup
1. Go to [TypeCast.ai](https://typecast.ai)
2. Sign up for an account or log in
3. Navigate to your Dashboard/API settings
4. Generate an API key for your account
5. Browse available voices/actors in your account and note their actor IDs

### 2. Environment Variables
Add these to your `.env` file:

```env
# TypeCast.ai Text-to-Speech
TYPECAST_API_KEY="your_typecast_api_key_here"
TYPECAST_API_URL="https://api.typecast.ai"  # Optional, defaults to this value
TYPECAST_MODEL="ssfm-v21"  # Optional, TTS model to use (default: 'ssfm-v21')

# Optional: Custom voice mappings (replace with actual actor IDs from your TypeCast.ai account)
TYPECAST_VOICE_KIND_FEMININE="actor-id-for-kind-feminine"
TYPECAST_VOICE_KIND_MASCULINE="actor-id-for-kind-masculine"
TYPECAST_VOICE_DIRECT_FEMININE="actor-id-for-direct-feminine"
TYPECAST_VOICE_DIRECT_MASCULINE="actor-id-for-direct-masculine"
TYPECAST_VOICE_CALM_FEMININE="actor-id-for-calm-feminine"
TYPECAST_VOICE_CALM_MASCULINE="actor-id-for-calm-masculine"
TYPECAST_VOICE_STERN_FEMININE="actor-id-for-stern-feminine"
TYPECAST_VOICE_STERN_MASCULINE="actor-id-for-stern-masculine"
TYPECAST_VOICE_DEFAULT_FEMININE="actor-id-for-default-feminine"
TYPECAST_VOICE_DEFAULT_MASCULINE="actor-id-for-default-masculine"
```

### 3. Features

#### Voice Mapping
The system uses TypeCast.ai voices (actors) for natural-sounding speech. You need to configure actor IDs that match your persona and gender preferences:

- **Kind**: Warm and friendly voices - suitable for approachable, helpful assistants
- **Direct**: Confident and clear voices - suitable for professional, straightforward communication
- **Calm**: Soothing and gentle voices - suitable for relaxed, peaceful interactions
- **Stern**: Authoritative and serious voices - suitable for firm, no-nonsense communication

#### Gender Support
- **Feminine**: Uses female voices from your TypeCast.ai account
- **Masculine**: Uses male voices from your TypeCast.ai account
- **Default**: Falls back to feminine voices

#### Natural Speech Features
- **High Quality Audio**: Uses TypeCast.ai's HD audio mode (`xapi_hd: true`)
- **Emotion Control**: Supports emotion/style prompts based on persona
- **Multiple Languages**: Supports various languages through TypeCast.ai's language options
- **Custom Voice Mapping**: Configure specific actor IDs for each persona/gender combination

#### Audio Player Component
- Reusable `AudioPlayer` component
- Play/Stop functionality with loading states
- Error handling for failed requests
- Multiple sizes (sm, md, lg)

## Usage

### Basic Usage
```tsx
import { AudioPlayer } from '@/components/ui/audio-player';

<AudioPlayer 
  text="Hello, I'm your assistant!"
  persona="kind"
  gender="feminine"
  size="md"
/>
```

### Integration
The audio player is already integrated into the `AssistantHero` component and will appear next to assistant speech bubbles on the home page.

## API Endpoint

### POST /api/tts
Converts text to speech using TypeCast.ai API.

**Request Body:**
```json
{
  "text": "Text to convert to speech",
  "persona": "kind|direct|calm|stern",
  "gender": "feminine|masculine|androgynous" // optional
}
```

**Response:**
```json
{
  "audio": "base64_encoded_audio_data",
  "format": "audio/mpeg"
}
```

**Note:** The API automatically maps persona and gender to the appropriate TypeCast.ai actor ID based on your environment variable configuration.

## Voice Configuration

### Setting Up Actor IDs
1. Log into your TypeCast.ai account
2. Browse available voices/actors
3. Select voices that match your desired personas:
   - For **kind** persona: Choose warm, friendly voices
   - For **direct** persona: Choose confident, professional voices
   - For **calm** persona: Choose soothing, gentle voices
   - For **stern** persona: Choose authoritative, serious voices
4. Copy the actor IDs for each voice
5. Add them to your `.env` file using the environment variable names listed above

### Voice Selection Tips
- Test different voices to find the best match for each persona
- Consider voice characteristics: tone, pace, and emotional range
- TypeCast.ai offers a wide variety of voices with different accents and styles
- You can use the same actor ID for multiple personas if desired

## Pricing and Limits
- Check [TypeCast.ai pricing](https://typecast.ai/pricing) for current plans and limits
- API usage is typically billed per character or per request
- Some plans include free tier options for development

## Troubleshooting

### Common Issues
1. **"TypeCast.ai API key not configured"**: 
   - Check that `TYPECAST_API_KEY` is set in your `.env` file
   - Verify the API key is valid and active in your TypeCast.ai account

2. **"TypeCast.ai API error"**: 
   - Verify your API key has the correct permissions
   - Check that the actor IDs in your environment variables are valid
   - Ensure your TypeCast.ai account has sufficient credits/quota

3. **Invalid actor ID errors**: 
   - Verify all actor IDs in your environment variables are correct
   - Check that the actor IDs exist in your TypeCast.ai account
   - Update the actor IDs if you've changed voices in your account

4. **Audio not playing**: 
   - Check browser console for errors
   - Verify the API response contains valid audio data
   - Check network tab to see if the API request succeeded

5. **500 Internal Server Error**: 
   - Check server logs for detailed error messages
   - Verify API endpoint URL is correct (default: `https://api.typecast.ai`)
   - Ensure your TypeCast.ai account is active and not suspended

### Testing
You can test the TTS functionality by:
1. Going to the home page
2. Looking for the play button next to the assistant's speech bubble
3. Clicking the play button to hear the generated speech

### Debug Information
The TTS API includes detailed logging. Check your server console for:
- Environment variable status (API key presence, API URL)
- TypeCast.ai API request details (actor ID, text length, persona, gender)
- API response status and error messages
- Detailed error information if requests fail

### Getting Actor IDs
To find actor IDs in TypeCast.ai:
1. Log into your TypeCast.ai dashboard
2. Navigate to the voices/actors section
3. Select a voice to view its details
4. The actor ID is typically shown in the voice details or API documentation
5. Copy the actor ID and use it in your environment variables
