// Test ElevenLabs TTS
import { speak } from '@arach/speakeasy';

async function testElevenLabs() {
    console.log('🎙️ Testing ElevenLabs TTS...');
    console.log('API Key loaded:', process.env.ELEVENLABS_API_KEY ? 'Yes' : 'No');
    
    try {
        await speak('Hello! This is a test from ElevenLabs TTS.', { 
            provider: 'elevenlabs',
            apiKey: process.env.ELEVENLABS_API_KEY
        });
        console.log('✅ ElevenLabs TTS works!');
    } catch (err) {
        console.error('❌ ElevenLabs TTS failed:', err.message);
    }
}

testElevenLabs();
