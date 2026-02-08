// src/index.ts
// Tawkie's Voice AI Project — Main Entry Point

import { SpeakEasy, speak, CONFIG_FILE } from '@arach/speakeasy';
import * as fs from 'fs';
import * as path from 'path';

interface VoiceConfig {
    sampleRate: number;
    channels: number;
    provider: string;
}

interface EnvConfig {
    elevenlabsApiKey?: string;
    elevenlabsVoiceId?: string;
    openaiApiKey?: string;
    groqApiKey?: string;
    geminiApiKey?: string;
    systemVoice?: string;
    defaultProvider: string;
}

class VoiceAgent {
    private config: VoiceConfig;
    private envConfig: EnvConfig;
    private tts: typeof speak;
    
    constructor(config: VoiceConfig) {
        this.config = config;
        this.envConfig = this.loadEnv();
        this.tts = speak;
    }
    
    private loadEnv(): EnvConfig {
        // Load from .env file
        const envPath = path.join(process.cwd(), '.env');
        const env: Record<string, string> = {};
        
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            for (const line of content.split('\n')) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const [key, ...valueParts] = trimmed.split('=');
                    if (key && valueParts.length > 0) {
                        env[key.trim()] = valueParts.join('=').trim();
                    }
                }
            }
        }
        
        return {
            elevenlabsApiKey: env.ELEVENLABS_API_KEY,
            elevenlabsVoiceId: env.ELEVENLABS_VOICE_ID,
            openaiApiKey: env.OPENAI_API_KEY,
            groqApiKey: env.GROQ_API_KEY,
            geminiApiKey: env.GEMINI_API_KEY,
            systemVoice: env.SYSTEM_VOICE || 'Victoria',
            defaultProvider: env.DEFAULT_TTS_PROVIDER || 'system'
        };
    }
    
    greet(): string {
        return "Hello, world! 🦞 Tawkie says: Voice AI ready!";
    }
    
    info(): string {
        return `Config: ${this.config.sampleRate}Hz, ${this.config.channels} channel(s), Provider: ${this.config.provider}`;
    }
    
    async say(text: string, provider?: 'system' | 'openai' | 'elevenlabs' | 'groq' | 'gemini'): Promise<void> {
        const selectedProvider = provider || (this.envConfig.defaultProvider as any);
        await this.tts(text, { provider: selectedProvider });
    }
    
    async systemSay(text: string): Promise<void> {
        await this.say(text, 'system');
    }
    
    async openaiSay(text: string): Promise<void> {
        await this.say(text, 'openai');
    }
    
    async elevenlabsSay(text: string): Promise<void> {
        await this.say(text, 'elevenlabs');
    }
    
    async groqSay(text: string): Promise<void> {
        await this.say(text, 'groq');
    }
    
    async geminiSay(text: string): Promise<void> {
        await this.say(text, 'gemini');
    }
}

// Initialize with voice AI config
const agent = new VoiceAgent({
    sampleRate: 16000,      // 16kHz — ideal for Whisper
    channels: 1,           // Mono
    provider: "unified"    // Using @arach/speakeasy!
});

console.log("🤖 Tawkie's Voice AI Project");
console.log("============================\n");

console.log(agent.greet());
console.log(agent.info());
console.log("\nMethods:");
console.log("  await agent.say('text')           // Uses default provider");
console.log("  await agent.systemSay('text')      // Free macOS voice");
console.log("  await agent.openaiSay('text')      // OpenAI TTS");
console.log("  await agent.elevenlabsSay('text')  // ElevenLabs TTS");
console.log("  await agent.groqSay('text')        // Groq TTS");
console.log("  await agent.geminiSay('text')      // Gemini TTS");

export { VoiceAgent, VoiceConfig, EnvConfig };
