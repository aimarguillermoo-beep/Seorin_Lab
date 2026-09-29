const fs = require('fs');
let lines = fs.readFileSync('app/page.tsx', 'utf-8').split('\n');
lines[155] = Buffer.from('ICBjb25zdCBvcmRlckxpbmsgPSB3aGF0c2FwcExpbmsoWyJIb2xhIFNlb3JpbiBMYWIuIFF1aWVncm8gaGFjZXIgZXN0ZSBwZWRpZG86IiwgIiIsIC4uLmNhcnRFbnRyaWVzLm1hcCgoe3Byb2R1Y3QsIHF1YW50aXR5fSkgPT4gYFx1MjAyMiAke3F1YW50aXR5fSB4ICR7cHJvZHVjdC5uYW1lfSR7cHJvZHVjdC5wcmVvcmRlciA/ICIgKFBSRVZFTlRBKSIgOiAiIn0gXHUyMDE0ICR7Zm9ybWF0UHJpY2UocHJvZHVjdC5wcmljZSl9IGMvdWApLCAiIiwgYFRvdGFsIGJhc2U6ICR7Zm9ybWF0UHJpY2UoY2FydFRvdGFsKX1gLCAiwr9NZSBjb25maXJtw6FzIHN0b2NrLCBwYWdvIHkgZW52w61vPyJdLmpvaW4oIlxuIikpOw==', 'base64').toString('utf-8');
fs.writeFileSync('app/page.tsx', lines.join('\n'));
