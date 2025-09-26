# Text-to-Speech Setup Guide

## Overview
This project includes a text-to-speech feature using Azure Cognitive Services Speech SDK. The feature allows assistant text to be converted to speech with different voices based on the assistant's persona and gender.

## Setup Instructions

### 1. Azure Cognitive Services Setup
1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new "Cognitive Services" resource
3. Choose "Speech" as the service type
4. Select your preferred region (e.g., "East US", "West US 2")
5. Choose the "Free (F0)" pricing tier for development
6. After creation, go to "Keys and Endpoint" to get your credentials

### 2. Environment Variables
Add these to your `.env` file:

```env
# Azure Text-to-Speech
AZURE_SPEECH_KEY="your_azure_speech_key_here"
AZURE_SPEECH_REGION="your_azure_region_here"  # e.g., "eastus", "westus2"
```

### 3. Features

#### Voice Mapping
The system uses Azure's premium Neural voices for natural-sounding speech:

- **Kind**: Warm and friendly (Aria/Guy) - slightly slower, higher pitch
- **Direct**: Confident and clear (Jenny/Brian) - slightly faster, professional tone
- **Calm**: Soothing and gentle (Aria/Davis) - slower pace, lower pitch, soft volume
- **Stern**: Authoritative and serious (Jenny/Brian) - normal pace, lower pitch

#### Gender Support
- **Feminine**: Uses female neural voices (Aria, Jenny)
- **Masculine**: Uses male neural voices (Guy, Brian, Davis)
- **Default**: Falls back to feminine voices

#### Natural Speech Features
- **Enhanced SSML**: Uses prosody, pitch, and volume adjustments
- **Natural Pauses**: Automatic breaks at punctuation for realistic rhythm
- **High Quality Audio**: 24kHz/48kbps MP3 for crisp sound
- **Style Degrees**: Fine-tuned emotional expression levels

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
Converts text to speech using Azure TTS.

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

## Voice Quality Improvements

### What Changed
The TTS system now uses several techniques to make voices sound more natural:

1. **Premium Neural Voices**: Azure's most advanced voice models
2. **Enhanced SSML**: Fine-tuned prosody, pitch, and volume controls
3. **Natural Pauses**: Automatic breaks at punctuation marks
4. **Higher Audio Quality**: 24kHz/48kbps instead of 16kHz/32kbps
5. **Persona-Specific Tuning**: Each personality has optimized speech parameters

### Voice Characteristics
- **Aria**: Warm, friendly, and approachable (best for kind/calm personas)
- **Jenny**: Confident, clear, and professional (best for direct/stern personas)
- **Guy**: Approachable and conversational (good for kind personas)
- **Brian**: Professional and authoritative (good for direct/stern personas)
- **Davis**: Soothing and calm (perfect for calm personas)

## Free Tier Limits
- 5 million characters per month
- 20 concurrent requests
- Perfect for development and small applications
- **Note**: Neural voices are available in the free tier!

## Troubleshooting

### Common Issues
1. **"Azure Speech service not configured"**: Check your environment variables
2. **"Failed to generate speech"**: Verify your Azure credentials and region
3. **Audio not playing**: Check browser console for errors
4. **500 Internal Server Error**: Usually indicates Azure credential issues or SSML format problems

### Testing
You can test the TTS functionality by:
1. Going to the home page
2. Looking for the play button next to the assistant's speech bubble
3. Clicking the play button to hear the generated speech

### Debug Information
The TTS API includes detailed logging. Check your server console for:
- Environment variable status
- Azure API response details
- Error messages with specific failure reasons
