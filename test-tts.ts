// Quick test of all TTS providers
import 'dotenv/config';
import { speak } from '@arach/speakeasy';

const tests = [
    { name: 'System Voice', provider: 'system', key: null },
    { name: 'ElevenLabs', provider: 'elevenlabs', key: process.env.ELEVENLABS_API_KEY },
    { name: 'OpenAI', provider: 'openai', key: process.env.OPENAI_API_KEY },
    { name: 'Groq', provider: 'groq', key: process.env.GROQ_API_KEY },
    { name: 'Gemini', provider: 'gemini', key: process.env.GEMINI_API_KEY },
];

async function testProvider(test) {
    if (!test.key) {
        console.log(`⏭️ ${test.name}: No API key`);
        return;
    }
    try {
        await speak('Hello! Testing ' + test.name, { provider: test.provider });
        console.log(`✅ ${test.name}: Working!`);
    } catch (e) {
        console.log(`❌ ${test.name}: ${e.message}`);
    }
}

console.log('🧪 Testing TTS Providers\n');
for (const test of tests) {
    await testProvider(test);
}
console.log('\nDone!');
