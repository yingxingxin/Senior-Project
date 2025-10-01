import { NextRequest, NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// Azure TTS Configuration
const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
  console.warn('Azure Speech credentials not configured. TTS will not work.');
}

// Voice mapping based on persona and gender - using premium neural voices
const getVoiceName = (persona: string, gender?: string): string => {
  // Default to feminine voices, but can be customized based on assistant gender
  const isFeminine = gender === 'feminine' || !gender;
  
  switch (persona) {
    case 'kind':
      // Aria is warm and friendly, Guy is approachable
      return isFeminine ? 'en-US-AriaNeural' : 'en-US-GuyNeural';
    case 'direct':
      // Jenny is confident and clear, Brian is professional
      return isFeminine ? 'en-US-JennyNeural' : 'en-US-BrianNeural';
    case 'calm':
      // Aria is naturally calming, Davis has a soothing tone
      return isFeminine ? 'en-US-AriaNeural' : 'en-US-DavisNeural';
    case 'stern':
      // Jenny can be authoritative, Brian is serious
      return isFeminine ? 'en-US-JennyNeural' : 'en-US-BrianNeural';
    default:
      return isFeminine ? 'en-US-AriaNeural' : 'en-US-GuyNeural';
  }
};

// Enhanced SSML generation for more natural speech
const generateEnhancedSSML = (text: string, persona: string, gender?: string): string => {
  const voiceName = getVoiceName(persona, gender);
  
  // Enhanced parameters for more natural speech
  let style = 'friendly';
  let rate = '1.0';
  let pitch = '0%';
  let volume = 'medium';
  let styledegree = '0.8';
  
  switch (persona) {
    case 'kind':
      style = 'friendly';
      rate = '0.95';
      pitch = '+5%';
      volume = 'medium';
      styledegree = '0.7';
      break;
    case 'direct':
      style = 'cheerful';
      rate = '1.05';
      pitch = '0%';
      volume = 'medium';
      styledegree = '0.6';
      break;
    case 'calm':
      style = 'calm';
      rate = '0.85';
      pitch = '-5%';
      volume = 'soft';
      styledegree = '0.9';
      break;
    case 'stern':
      style = 'serious';
      rate = '1.0';
      pitch = '-10%';
      volume = 'medium';
      styledegree = '0.8';
      break;
  }

  // Add natural pauses and emphasis
  const enhancedText = text
    .replace(/\./g, '. <break time="200ms"/>')
    .replace(/,/g, ', <break time="100ms"/>')
    .replace(/!/g, '! <break time="300ms"/>')
    .replace(/\?/g, '? <break time="300ms"/>');

  return `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
      <voice name="${voiceName}">
        <mstts:express-as style="${style}" styledegree="${styledegree}">
          <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
            ${enhancedText}
          </prosody>
        </mstts:express-as>
      </voice>
    </speak>
  `.trim();
};

export async function POST(request: NextRequest) {
  try {
    console.log('TTS Request received. Environment check:', {
      hasKey: !!AZURE_SPEECH_KEY,
      hasRegion: !!AZURE_SPEECH_REGION,
      keyLength: AZURE_SPEECH_KEY?.length || 0,
      region: AZURE_SPEECH_REGION
    });

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      return NextResponse.json(
        { error: 'Azure Speech service not configured' },
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

    // Configure Azure Speech
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

    // Create synthesizer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

    // Generate enhanced SSML for more natural speech
    const ssml = generateEnhancedSSML(text, persona, gender);

    // Convert text to speech using SSML
    const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          synthesizer.close();
          resolve(result);
        },
        (error) => {
          synthesizer.close();
          reject(error);
        }
      );
    });

    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
      // Convert audio data to base64
      const audioBuffer = Buffer.from(result.audioData);
      const base64Audio = audioBuffer.toString('base64');
      
      return NextResponse.json({
        audio: base64Audio,
        format: 'audio/mpeg'
      });
    } else {
      console.error('Speech synthesis failed:', {
        reason: result.reason,
        errorDetails: result.errorDetails,
        text: text,
        persona: persona,
        voiceName: getVoiceName(persona, gender)
      });
      return NextResponse.json(
        { error: `Speech synthesis failed: ${result.errorDetails}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
