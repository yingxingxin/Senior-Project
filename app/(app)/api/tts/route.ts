import { NextRequest, NextResponse } from 'next/server';

// TypeCast.ai TTS Configuration
const TYPECAST_API_KEY = process.env.TYPECAST_API_KEY;
const TYPECAST_API_URL = process.env.TYPECAST_API_URL || 'https://api.typecast.ai';

if (!TYPECAST_API_KEY) {
  console.warn('TypeCast.ai API key not configured. TTS will not work.');
}

// Voice mapping based on persona and gender - using TypeCast.ai actor IDs
// Note: These are placeholder actor IDs. Replace with actual TypeCast.ai actor IDs from your account
const getActorId = (persona: string, gender?: string): string => {
  // Handle androgynous gender - can use a specific voice or fallback to feminine
  if (gender === 'androgynous') {
    const androgynousVoice = process.env[`TYPECAST_VOICE_${persona.toUpperCase()}_ANDROGYNOUS`] 
      || process.env.TYPECAST_VOICE_DEFAULT_ANDROGYNOUS
      || process.env[`TYPECAST_VOICE_${persona.toUpperCase()}_FEMININE`]
      || process.env.TYPECAST_VOICE_DEFAULT_FEMININE;
    if (androgynousVoice) return androgynousVoice;
  }
  
  // Default to feminine voices, but can be customized based on assistant gender
  const isFeminine = gender === 'feminine' || !gender;
  
  // Map persona and gender to TypeCast.ai actor IDs
  // You'll need to replace these with actual actor IDs from your TypeCast.ai account
  switch (persona) {
    case 'kind':
      // Warm and friendly voices
      return isFeminine 
        ? process.env.TYPECAST_VOICE_KIND_FEMININE || 'default-feminine-kind'
        : process.env.TYPECAST_VOICE_KIND_MASCULINE || 'default-masculine-kind';
    case 'direct':
      // Confident and clear voices
      return isFeminine 
        ? process.env.TYPECAST_VOICE_DIRECT_FEMININE || 'default-feminine-direct'
        : process.env.TYPECAST_VOICE_DIRECT_MASCULINE || 'default-masculine-direct';
    case 'calm':
      // Soothing and gentle voices
      return isFeminine 
        ? process.env.TYPECAST_VOICE_CALM_FEMININE || 'default-feminine-calm'
        : process.env.TYPECAST_VOICE_CALM_MASCULINE || 'default-masculine-calm';
    case 'stern':
      // Authoritative and serious voices
      return isFeminine 
        ? process.env.TYPECAST_VOICE_STERN_FEMININE || 'default-feminine-stern'
        : process.env.TYPECAST_VOICE_STERN_MASCULINE || 'default-masculine-stern';
    default:
      return isFeminine 
        ? process.env.TYPECAST_VOICE_DEFAULT_FEMININE || 'default-feminine'
        : process.env.TYPECAST_VOICE_DEFAULT_MASCULINE || 'default-masculine';
  }
};

// Map persona to TypeCast.ai emotion/style prompts
const getEmotionPrompt = (persona: string): string => {
  switch (persona) {
    case 'kind':
      return 'friendly, warm, approachable';
    case 'direct':
      return 'confident, clear, professional';
    case 'calm':
      return 'calm, soothing, gentle';
    case 'stern':
      return 'serious, authoritative, firm';
    default:
      return 'neutral, friendly';
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('TTS Request received. Environment check:', {
      hasKey: !!TYPECAST_API_KEY,
      keyLength: TYPECAST_API_KEY?.length || 0,
      apiUrl: TYPECAST_API_URL
    });

    if (!TYPECAST_API_KEY) {
      return NextResponse.json(
        { error: 'TypeCast.ai API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, persona, gender } = body;

    if (!text || !persona) {
      return NextResponse.json(
        { error: 'Text and persona are required' },
        { status: 400 }
      );
    }

    // Get actor ID and emotion prompt based on persona and gender
    const actorId = getActorId(persona, gender);
    const emotionPrompt = getEmotionPrompt(persona);

    // Prepare TypeCast.ai API request
    // Note: TypeCast.ai API requires 'model' field and uses 'voice_id' parameter
    const model = process.env.TYPECAST_MODEL || 'ssfm-v21'; // Default model, can be overridden via env var
    const typecastRequest = {
      text: text,
      model: model, // Required field - TTS model to use
      voice_id: actorId, // TypeCast.ai uses 'voice_id' parameter
      lang: 'en-us',
      // Optional parameters for audio quality
      // xapi_hd: true, // High quality audio (if supported)
      // xapi_audio_format: 'mp3', // Audio format (if supported)
    };

    console.log('Calling TypeCast.ai API:', {
      actorId,
      model, // Log the model being used
      textLength: text.length,
      persona,
      gender
    });

    // Call TypeCast.ai API
    // Note: TypeCast.ai uses /v1/text-to-speech endpoint and X-API-KEY header
    const apiUrl = `${TYPECAST_API_URL}/v1/text-to-speech`;
    console.log('TypeCast.ai API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': TYPECAST_API_KEY, // TypeCast.ai uses X-API-KEY header, not Bearer token
      },
      body: JSON.stringify(typecastRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `TypeCast.ai API error: ${response.statusText}`;
      
      // Provide more specific error messages
      if (response.status === 404) {
        errorMessage = `TypeCast.ai endpoint not found. This could mean:
- The API endpoint URL is incorrect
- The voice_id (${actorId}) doesn't exist in your account
- Your API key may not be activated yet (try waiting a few minutes)
- Check that you're using the correct API version`;
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = `TypeCast.ai authentication failed. Check that:
- Your API key is correct
- Your API key is activated (may take a few minutes after creation)
- Your API key has the necessary permissions`;
      } else if (response.status === 422) {
        errorMessage = `TypeCast.ai validation error. Check that:
- All required fields are present (text, model, voice_id, lang)
- The model value is correct (default: 'ssfm-v21', can be set via TYPECAST_MODEL env var)
- The voice_id exists in your account
- Request parameters are in the correct format`;
      }
      
      console.error('TypeCast.ai API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        actorId,
        persona,
        gender,
        apiUrl
      });
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorText,
          status: response.status
        },
        { status: response.status || 500 }
      );
    }

    // Get audio data from response
    const audioBlob = await response.blob();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    const base64Audio = audioBuffer.toString('base64');

    // Determine audio format (TypeCast.ai typically returns MP3)
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    
    return NextResponse.json({
      audio: base64Audio,
      format: contentType
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
