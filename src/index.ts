// src/index.ts
// Tawkie's Voice AI Project — Main Entry Point

import { SpeakEasy, speak, CONFIG_FILE } from '@arach/speakeasy';

interface VoiceConfig {
    sampleRate: number;
    channels: number;
    provider: string;
}

class VoiceAgent {
    private config: VoiceConfig;
    private tts: typeof speak;
    
    constructor(config: VoiceConfig) {
        this.config = config;
        this.tts = speak; // Using @arach/speakeasy!
    }
    
    greet(): string {
        return "Hello, world! 🦞 Tawkie says: Voice AI ready!";
    }
    
    info(): string {
        return `Config: ${this.config.sampleRate}Hz, ${this.config.channels} channel(s), Provider: ${this.config.provider}`;
    }
    
    async say(text: string): Promise<void> {
        await this.tts(text);
    }
}

// Initialize with voice AI config
const agent = new VoiceAgent({
    sampleRate: 16000,      // 16kHz — ideal for Whisper
    channels: 1,            // Mono
    provider: "arach"       // Using @arach/speakeasy!
});

console.log("🤖 Tawkie's Voice AI Project");
console.log("============================\n");

console.log(agent.greet());
console.log(agent.info());
console.log("\nTry: await agent.say('Hello from Tawkie!')");

export { VoiceAgent, VoiceConfig };
