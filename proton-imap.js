#!/usr/bin/env node

/**
 * Proton Mail Bridge IMAP Client
 * 
 * Usage:
 *   1. First, configure Proton Mail Bridge manually:
 *      - Open Proton Mail Bridge app
 *      - Login with: tawkie@proton.me / vywvah-5hykki-fyzbyW
 *      - Enable IMAP/SMTP
 *      - Note: Bridge runs on localhost:1143
 *   
 *   2. Then run this script:
 *      node proton-imap.js --search "Verify your email"
 *      node proton-imap.js --latest
 *      node proton-imap.js --body 1  # Get full body of message 1
 */

import Imap from 'imap';
import { simpleParser } from 'mailparser';
import fs from 'fs';

const CONFIG = {
  user: process.env.PROTON_USER || 'tawkie@proton.me',
  password: process.env.PROTON_PASS || 'vywvah-5hykki-fyzbyW',
  host: '127.0.0.1',
  port: 1143,
  tls: false
};

class ProtonMailClient {
  constructor() {
    this.imap = new Imap(CONFIG);
    this.connected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Connecting to Proton Mail Bridge...');
      
      this.imap.once('ready', () => {
        this.connected = true;
        console.log('✅ Connected!');
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error('❌ IMAP Error:', err.message);
        reject(err);
      });

      this.imap.connect();
    });
  }

  async openInbox() {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`📬 Inbox: ${box.messages.total} messages`);
        resolve(box);
      });
    });
  }

  async searchEmails(query = ['ALL']) {
    return new Promise((resolve, reject) => {
      this.imap.search(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`🔍 Found ${results.length} matching emails`);
        resolve(results);
      });
    });
  }

  async getEmail(seqNum) {
    return new Promise((resolve, reject) => {
      const fetch = this.imap.fetch(seqNum, {
        bodies: '',
        struct: true
      });

      fetch.on('message', async (msg) => {
        const email = {
          seqNum: seqNum,
          headers: {},
          body: '',
          text: '',
          html: '',
          links: []
        };

        msg.on('body', async (stream) => {
          const parsed = await simpleParser(stream);
          email.text = parsed.text;
          email.html = parsed.html;
          email.subject = parsed.subject;
          email.from = parsed.from.text;
          email.date = parsed.date;
          
          // Extract all links from HTML
          const linkRegex = /href=["']([^"']+)["']/g;
          let match;
          while ((match = linkRegex.exec(parsed.html)) !== null) {
            email.links.push(match[1]);
          }
        });

        msg.on('end', () => resolve(email));
      });

      fetch.on('error', reject);
    });
  }

  async findVerificationLink(query = 'ElevenLabs') {
    const results = await this.searchEmails(['SUBJECT', query]);
    
    if (!results.length) {
      throw new Error(`No emails found with subject containing "${query}"`);
    }

    // Get the latest matching email
    const latestSeq = results[results.length - 1];
    console.log(`📧 Fetching email #${latestSeq}...`);
    
    const email = await this.getEmail(latestSeq);
    
    console.log(`\n📋 Subject: ${email.subject}`);
    console.log(`👤 From: ${email.from}`);
    console.log(`📅 Date: ${email.date}`);
    
    // Find verification link
    const verifyLinks = email.links.filter(link => 
      link.includes('verify') || 
      link.includes('confirm') ||
      link.includes('elevenlabs')
    );

    if (verifyLinks.length) {
      console.log('\n🔗 Verification links found:');
      verifyLinks.forEach((link, i) => {
        console.log(`  ${i + 1}. ${link}`);
      });
      return verifyLinks[0];
    }

    // Return all links if no verification link found
    if (email.links.length) {
      console.log('\n🔗 All links in email:');
      email.links.forEach((link, i) => {
        console.log(`  ${i + 1}. ${link}`);
      });
    }

    return null;
  }

  disconnect() {
    if (this.connected) {
      this.imap.end();
      console.log('👋 Disconnected');
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const client = new ProtonMailClient();

  try {
    await client.connect();
    await client.openInbox();

    if (args.includes('--search')) {
      const query = args[args.indexOf('--search') + 1] || 'Verify';
      await client.findVerificationLink(query);
    } else if (args.includes('--latest')) {
      const email = await client.getEmail(1);
      console.log('Latest email:', JSON.stringify(email, null, 2));
    } else if (args.includes('--body')) {
      const seqNum = parseInt(args[args.indexOf('--body') + 1]) || 1;
      const email = await client.getEmail(seqNum);
      console.log(`\n📧 Email #${seqNum}:`);
      console.log(`Subject: ${email.subject}`);
      console.log(`From: ${email.from}`);
      console.log(`\n📝 Text content:\n${email.text.substring(0, 500)}...`);
      
      if (email.links.length) {
        console.log(`\n🔗 Links found: ${email.links.length}`);
      }
    } else {
      // Default: search for ElevenLabs verification
      try {
        const link = await client.findVerificationLink('ElevenLabs');
        if (link) {
          console.log(`\n✅ Verification link: ${link}`);
        }
      } catch (e) {
        console.log('No ElevenLabs email found yet');
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    client.disconnect();
  }
}

main();
