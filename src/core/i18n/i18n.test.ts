import { isRTLLanguageText, textAlignFor } from './index';

describe('isRTLLanguageText', () => {
  it('detects Arabic script', () => {
    expect(isRTLLanguageText('ليان')).toBe(true);
  });

  it('treats Latin text as left-to-right', () => {
    expect(isRTLLanguageText('Maya K.')).toBe(false);
  });

  it('detects mixed content that contains any RTL run', () => {
    expect(isRTLLanguageText('hello نورة')).toBe(true);
  });

  it('treats digits and punctuation as neutral', () => {
    expect(isRTLLanguageText('12345 — ok')).toBe(false);
  });
});

describe('textAlignFor', () => {
  it('right-aligns Arabic', () => {
    expect(textAlignFor('هنا للدردشة')).toBe('right');
  });

  it('left-aligns Latin', () => {
    expect(textAlignFor('Coffee and playlists')).toBe('left');
  });
});
