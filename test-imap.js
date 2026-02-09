import Imap from 'imap';

const imap = new Imap({
  user: 'tawkie@proton.me',
  password: 'vywvah-5hykki-fyzbyW',
  host: '127.0.0.1',
  port: 1143,
  tls: false
});

console.log('Attempting to connect to Proton Mail Bridge...');

imap.on('ready', () => {
  console.log('✅ Connected!');
  imap.openBox('INBOX', false, (err, box) => {
    if (err) {
      console.error('Error opening inbox:', err);
      imap.end();
      return;
    }
    console.log('✅ Inbox opened!');
    console.log('Messages:', box.messages.total);
    
    // Search for ElevenLabs email
    imap.search(['SUBJECT', 'Verify your email for ElevenLabs'], (err, results) => {
      if (err || !results.length) {
        console.log('No ElevenLabs email found');
        imap.end();
        return;
      }
      console.log('✅ Found ElevenLabs email:', results.length);
      imap.end();
    });
  });
});

imap.on('error', (err) => {
  console.error('❌ Error:', err.message);
});

imap.connect();
