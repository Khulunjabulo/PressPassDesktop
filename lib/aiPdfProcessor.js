// lib/aiPdfProcessor.js — FIXED: better extraction of writers, image credits, multi-article split
import { extractTextFromPDF } from './pdfExtractor';

class AIPdfProcessor {
  constructor() {
    this.apiEndpoint = '/api/ai-analyze';
  }

  // ─── Main Entry Point ────────────────────────────────────────────────────────
  async processPDF(file, options = {}) {
    try {
      console.log('🤖 Starting AI PDF processing...');

      const fullText = await extractTextFromPDF(file);

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('No text could be extracted from PDF');
      }

      console.log('📄 Extracted text length:', fullText.length);
      console.log('📄 First 500 chars:\n', fullText.substring(0, 500));

      const images = await this.extractImagesFromPDF(file);
      console.log('📷 Extracted images:', images.length);

      let stories = [];
      try {
        stories = await this.aiDetectStories(fullText);
        console.log('🤖 AI detected stories:', stories.length);
      } catch (aiError) {
        console.warn('⚠️ AI detection failed, using fallback:', aiError.message);
        stories = this.smartFallbackDetection(fullText);
      }

      const storiesWithImages = await this.matchImagesToStories(stories, images, fullText);

      console.log('✅ PDF processing complete:', storiesWithImages.length, 'stories');

      return {
        success: true,
        storiesCount: storiesWithImages.length,
        stories: storiesWithImages,
        rawText: fullText,
        totalImages: images.length,
      };
    } catch (error) {
      console.error('❌ PDF processing error:', error);
      return {
        success: false,
        error: error.message,
        stories: [],
        storiesCount: 0,
      };
    }
  }

  // ─── Claude AI Story Detection ───────────────────────────────────────────────
  async aiDetectStories(fullText) {
    console.log('🤖 Sending text to Claude for story detection...');

    // Keep up to 14000 chars — structure is now preserved so less is lost
    const textToAnalyze =
      fullText.length > 14000
        ? fullText.substring(0, 14000) + '\n\n[... text truncated ...]'
        : fullText;

    const prompt = `You are an expert newspaper editor. I will give you raw extracted text from a newspaper PDF. The text has been extracted with line-break structure preserved. Each line in the text corresponds roughly to a line in the original newspaper.

Your task: identify and separate ALL individual news articles/stories.

IMPORTANT RULES:
1. Headlines are usually in ALL CAPS or Title Case and appear alone on a line (or a short line).
2. Writer/byline names appear directly below the headline, often ALL CAPS (e.g. "ROMITA HANUMAN-PILLAY", "SANE SHANDU", "GUGU MDLALOSE"). Sometimes prefixed with "BY" or "By".
3. Image/photo credits appear as lines like "Picture: THULI DLAMINI" or "Photo: SANELI MTHALANE" — extract the photographer name only (e.g. "THULI DLAMINI").
4. Each article starts with a headline and ends where the next headline begins.
5. Ignore: page numbers, section headers ("NEWS", "SPORT", "VACANCIES", "TENDERS"), navigation, ads, job listings, table of contents lines, and publication info.
6. Only include articles with at least 80 words of body content.
7. For category, choose from: news, politics, business, sports, education, health, environment, entertainment, lifestyle, community, technology.
8. Preserve the EXACT writer name as it appears (e.g. "ROMITA HANUMAN-PILLAY AND SOHANA SINGH" → use as-is).
9. If two writers are listed, include both (e.g. "NONDUDUZO NGCONGO AND KWANDA ZONDI").
10. The imageCredit field should contain ONLY the photographer name, not "Picture:" prefix.

Return ONLY a valid JSON array. No markdown, no explanation, no code fences. Raw JSON only.

Format:
[
  {
    "headline": "Full article headline here",
    "byline": "Writer name(s) exactly as printed",
    "imageCredit": "Photographer name only, e.g. THULI DLAMINI",
    "location": "City or area if mentioned at article start, else empty string",
    "category": "news",
    "content": "Full article body text, cleaned and complete"
  }
]

Newspaper text:

${textToAnalyze}`;

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        maxTokens: 8000,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`API error ${response.status}: ${errData.error || 'Unknown error'}`);
    }

    const data = await response.json();

    // Extract text from Claude response
    const rawContent =
      data?.content?.[0]?.text ||
      (Array.isArray(data?.content)
        ? data.content.filter((c) => c.type === 'text').map((c) => c.text).join('')
        : '') ||
      data?.content ||
      '';

    if (!rawContent) {
      throw new Error('Empty response from AI');
    }

    console.log('🤖 Raw AI response (first 300 chars):', rawContent.substring(0, 300));

    // Strip any accidental markdown fences
    const cleaned = rawContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    let stories;
    try {
      stories = JSON.parse(cleaned);
    } catch (parseError) {
      // Try to pull out just the array
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        stories = JSON.parse(arrayMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON: ' + parseError.message);
      }
    }

    if (!Array.isArray(stories)) {
      throw new Error('AI response is not an array');
    }

    const validStories = stories
      .filter((s) => s && s.headline && s.content && s.content.trim().length > 80)
      .map((s, idx) => ({
        headline: (s.headline || '').trim(),
        byline: (s.byline || '').trim(),
        imageCredit: (s.imageCredit || '').replace(/^(picture|photo|pic|image|foto):\s*/i, '').trim(),
        location: (s.location || '').trim(),
        category: (s.category || 'news').toLowerCase(),
        content: (s.content || '').trim(),
        position: idx === 0 ? 'beginning' : 'middle',
        images: [],
      }));

    console.log('✅ AI extracted', validStories.length, 'valid stories');
    validStories.forEach((s, i) =>
      console.log(
        `  ${i + 1}. "${s.headline}" — by: ${s.byline || 'Unknown'} | photo: ${s.imageCredit || 'none'}`
      )
    );

    return validStories;
  }

  // ─── Fallback: Pattern-Based Detection ──────────────────────────────────────
  smartFallbackDetection(fullText) {
    console.log('🧠 Using smart pattern detection (fallback)');

    const lines = fullText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const articleBoundaries = [];

    // Detect headline candidates: ALL CAPS lines 15–150 chars, not page markers or section names
    const skipWords = [
      'PAGE', 'CONTINUED', 'NEWS', 'SPORT', 'JOBS', 'TENDERS',
      'CLASSIFIEDS', 'VACANCIES', 'LETTERS', 'EDITORIAL', 'PICTURE',
      'PHOTO', 'METRO', 'EZASEGAGASINI', '---',
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.length > 15 &&
        line.length < 160 &&
        line === line.toUpperCase() &&
        /^[A-Z]/.test(line) &&
        !/^\d+$/.test(line) &&
        !skipWords.some((w) => line.startsWith(w))
      ) {
        articleBoundaries.push({ index: i, headline: this.toTitleCase(line) });
      }
    }

    if (articleBoundaries.length <= 1) {
      return [
        {
          headline: this.toTitleCase(lines[0]) || 'Untitled Article',
          byline: this.extractByline(lines.slice(1, 6)),
          imageCredit: this.extractImageCredit(fullText),
          location: '',
          content: fullText,
          position: 'beginning',
          category: this.guessCategory(fullText),
          images: [],
        },
      ];
    }

    const stories = [];

    for (let i = 0; i < articleBoundaries.length; i++) {
      const start = articleBoundaries[i].index;
      const end =
        i < articleBoundaries.length - 1
          ? articleBoundaries[i + 1].index
          : lines.length;

      const articleLines = lines.slice(start + 1, end);

      const byline = this.extractByline(articleLines.slice(0, 6));
      const imageCredit = this.extractImageCredit(articleLines.join('\n'));
      const location = this.extractLocation(articleLines[0] || '');

      // Remove byline and caption lines from content
      const contentLines = articleLines.filter((line) => {
        const u = line.toUpperCase();
        return (
          !line.startsWith('Picture:') &&
          !line.startsWith('Photo:') &&
          !line.startsWith('Image:') &&
          !/^BY\s+[A-Z]/.test(u) &&
          !/^[A-Z]{2,}\s+AND\s+[A-Z]{2,}$/.test(u)
        );
      });

      const content = contentLines.join('\n\n').trim();

      if (content.length > 150) {
        stories.push({
          headline: articleBoundaries[i].headline,
          byline,
          imageCredit,
          location,
          content,
          position:
            i === 0
              ? 'beginning'
              : i === articleBoundaries.length - 1
              ? 'end'
              : 'middle',
          category: this.guessCategory(content),
          images: [],
        });
      }
    }

    return stories;
  }

  // ─── Helper: Extract Byline ──────────────────────────────────────────────────
  extractByline(lines) {
    for (const line of lines) {
      const trimmed = line.trim();

      // "By John Smith" or "BY JOHN SMITH"
      if (/^by\s+.+/i.test(trimmed)) {
        return trimmed.replace(/^by\s+/i, '').trim();
      }

      // ALL CAPS double-name: "ROMITA HANUMAN-PILLAY" or "ROMITA HANUMAN-PILLAY AND SOHANA SINGH"
      if (
        /^[A-Z][A-Z\s\-]+$/.test(trimmed) &&
        trimmed.length > 4 &&
        trimmed.length < 80 &&
        trimmed.split(' ').length >= 2
      ) {
        return this.toTitleCase(trimmed);
      }

      // "Written by ..."
      if (/^written by\s+.+/i.test(trimmed)) {
        return trimmed.replace(/^written by\s+/i, '').trim();
      }
    }
    return '';
  }

  // ─── Helper: Extract Image Credit ───────────────────────────────────────────
  extractImageCredit(text) {
    // Match "Picture: NAME" / "Photo: NAME" / "Pic: NAME"
    const match = text.match(/(?:Picture|Photo|Pic|Image|Foto):\s*([^\n\r.,]+)/i);
    if (!match) return '';
    // Remove trailing clutter
    return match[1].trim().replace(/\s+Picture.*$/i, '').replace(/\s+Photo.*$/i, '');
  }

  // ─── Helper: Extract Location ────────────────────────────────────────────────
  extractLocation(firstLine) {
    const match = firstLine.match(/^([A-Z][A-Za-z\s]+?)[,\s]*[-–—]/);
    return match ? match[1].trim() : '';
  }

  // ─── Helper: Title Case ──────────────────────────────────────────────────────
  toTitleCase(str) {
    const lowers = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'in', 'of', 'up', 'as', 'is'];
    return str
      .toLowerCase()
      .split(' ')
      .map((word, idx) =>
        idx === 0 || !lowers.includes(word)
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word
      )
      .join(' ');
  }

  // ─── Helper: Guess Category ──────────────────────────────────────────────────
  guessCategory(text) {
    const lowerText = text.toLowerCase();
    const categories = {
      sports: ['game', 'match', 'team', 'player', 'score', 'championship', 'league', 'coach', 'football', 'soccer', 'rugby', 'cricket'],
      politics: ['election', 'government', 'president', 'minister', 'parliament', 'vote', 'policy', 'mayor', 'council', 'municipality'],
      business: ['market', 'economy', 'company', 'profit', 'investment', 'business', 'smme', 'entrepreneur'],
      technology: ['tech', 'software', 'app', 'digital', 'solar', 'energy', 'electricity'],
      health: ['health', 'medical', 'doctor', 'hospital', 'disease', 'patient', 'fire', 'emergency'],
      entertainment: ['movie', 'film', 'music', 'celebrity', 'actor', 'concert', 'fashion', 'award'],
      education: ['school', 'university', 'student', 'teacher', 'education', 'learner'],
      community: ['community', 'resident', 'ward', 'neighbourhood', 'local'],
    };

    let bestCategory = 'news';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const score = keywords.reduce(
        (acc, kw) => acc + (lowerText.match(new RegExp(kw, 'g')) || []).length,
        0
      );
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

 // ─── Image Extraction from PDF ───────────────────────────────────────────────
async extractImagesFromPDF(file) {
  try {
    if (typeof window === 'undefined' || !window.pdfjsLib) {
      console.warn('⚠️ PDF.js not loaded, skipping image extraction');
      return [];
    }

    const pdfjsLib = window.pdfjsLib;

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const images = [];
    const maxPages = Math.min(pdf.numPages, 10);

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        if (base64Image.length < 5000) continue; // skip blank pages

        // ✅ Upload to Cloudinary immediately — don't store base64
        const cloudinaryUrl = await this.uploadImageToCloudinary(base64Image, pageNum);

        if (cloudinaryUrl) {
          images.push({
            id: `img_page_${pageNum}`,
            url: cloudinaryUrl,   // ✅ HTTPS URL only
            page: pageNum,
            width: viewport.width,
            height: viewport.height,
          });
        }

      } catch (pageError) {
        console.warn(`Could not render page ${pageNum}:`, pageError);
      }
    }

    console.log('📷 Extracted & uploaded', images.length, 'page images');
    return images;

  } catch (error) {
    console.error('Error extracting images:', error);
    return [];
  }
}

// ─── Upload a base64 image to Cloudinary ─────────────────────────────────────
async uploadImageToCloudinary(base64DataUrl, pageNum) {
  try {
    // Convert base64 data URL to a Blob
    const res      = await fetch(base64DataUrl);
    const blob     = await res.blob();
    const formData = new FormData();
    formData.append('imageFile', blob, `pdf_page_${pageNum}.jpg`);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.warn(`⚠️ Failed to upload page ${pageNum} image:`, result.error);
      return null;
    }

    console.log(`✅ Page ${pageNum} image uploaded:`, result.url);
    return result.url;

  } catch (error) {
    console.warn(`⚠️ Cloudinary upload error for page ${pageNum}:`, error.message);
    return null;
  }
}

// ─── Match Images to Stories ─────────────────────────────────────────────────
async matchImagesToStories(stories, images, fullText) {
  if (images.length === 0 || stories.length === 0) {
    return stories.map(story => ({ ...story, images: [] }));
  }

  return stories.map((story, idx) => {
    const imgIdx = idx % images.length;
    return { ...story, images: [images[imgIdx]] }; // images[idx].url is now a Cloudinary URL
  });
}

  // ─── Match Images to Stories ─────────────────────────────────────────────────
  async matchImagesToStories(stories, images, fullText) {
    if (images.length === 0 || stories.length === 0) {
      return stories.map((story) => ({ ...story, images: [] }));
    }

    return stories.map((story, idx) => {
      const imgIdx = idx % images.length;
      return { ...story, images: [images[imgIdx]] };
    });
  }
}

export const aiPdfProcessor = new AIPdfProcessor();
export default aiPdfProcessor;