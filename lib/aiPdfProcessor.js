// lib/aiPdfProcessor.js - FREE VERSION with improved pattern detection
import { extractTextFromPDF } from './pdfExtractor';

class AIPdfProcessor {
  constructor() {
    this.useAI = false; // Set to false for free mode
    this.apiEndpoint = '/api/ai-analyze';
  }

  async processPDF(file, options = {}) {
    try {
      console.log('🤖 Starting PDF processing...');
      
      const fullText = await extractTextFromPDF(file);
      
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('No text could be extracted from PDF');
      }
      
      console.log('📄 Extracted text length:', fullText.length);
      
      const images = await this.extractImagesFromPDF(file);
      console.log('📷 Extracted images:', images.length);
      
      // Always use smart fallback detection (no API needed)
      const stories = this.smartFallbackDetection(fullText);
      console.log('📰 Detected stories:', stories.length);
      
      const storiesWithImages = await this.matchImagesToStories(stories, images, fullText);
      
      console.log('✅ PDF processing complete:', storiesWithImages.length, 'stories detected');
      
      return {
        success: true,
        storiesCount: storiesWithImages.length,
        stories: storiesWithImages,
        rawText: fullText,
        totalImages: images.length
      };
      
    } catch (error) {
      console.error('❌ PDF processing error:', error);
      return {
        success: false,
        error: error.message,
        stories: [],
        storiesCount: 0
      };
    }
  }

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
      
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 20); pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.0 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          const base64Image = canvas.toDataURL('image/png');
          
          if (base64Image.length > 10000) {
            images.push({
              id: `img_${pageNum}_0`,
              base64: base64Image,
              page: pageNum,
              position: 0,
              width: viewport.width,
              height: viewport.height
            });
          }
        } catch (pageError) {
          console.warn(`Could not extract image from page ${pageNum}:`, pageError);
        }
      }
      
      console.log('📷 Extracted', images.length, 'images from PDF');
      return images;
      
    } catch (error) {
      console.error('Error extracting images:', error);
      return [];
    }
  }

  smartFallbackDetection(fullText) {
    console.log('🧠 Using smart pattern detection (no AI needed)');
    
    const lines = fullText.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Multiple strategies to find article boundaries
    const articleBoundaries = [];
    
    // Strategy 1: Look for ALL CAPS headlines (common in newspapers)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if it's a potential headline
      if (
        line.length > 15 && 
        line.length < 200 && 
        line === line.toUpperCase() &&
        /^[A-Z]/.test(line) &&
        !/^\d+$/.test(line) && // Not just numbers
        !line.includes('PAGE') && // Not page numbers
        !line.includes('CONTINUED') // Not continuation markers
      ) {
        articleBoundaries.push({
          index: i,
          headline: line,
          type: 'headline'
        });
      }
    }
    
    console.log('🔍 Found', articleBoundaries.length, 'potential article headlines');
    
    // If we found multiple headlines, split into articles
    if (articleBoundaries.length > 1) {
      const stories = [];
      
      for (let i = 0; i < articleBoundaries.length; i++) {
        const start = articleBoundaries[i].index;
        const end = i < articleBoundaries.length - 1 
          ? articleBoundaries[i + 1].index 
          : lines.length;
        
        const articleLines = lines.slice(start + 1, end);
        
        // Look for byline
        let byline = '';
        const bylineIndex = articleLines.findIndex(line => 
          /^by\s+/i.test(line) || 
          /^written by\s+/i.test(line) ||
          /^reporter:\s*/i.test(line)
        );
        
        if (bylineIndex !== -1) {
          byline = articleLines[bylineIndex]
            .replace(/^by\s+/i, '')
            .replace(/^written by\s+/i, '')
            .replace(/^reporter:\s*/i, '')
            .trim();
        }
        
        // Look for location/dateline
        let location = '';
        const locationPattern = /^([A-Z][A-Za-z\s]+),\s*[-–—]\s*/;
        const locMatch = articleLines[0]?.match(locationPattern);
        if (locMatch) {
          location = locMatch[1].trim();
        }
        
        // Get content (skip byline if found)
        const contentStart = bylineIndex !== -1 ? bylineIndex + 1 : 0;
        const content = articleLines.slice(contentStart).join('\n\n');
        
        // Only add if content is substantial
        if (content.length > 200) {
          stories.push({
            headline: articleBoundaries[i].headline,
            byline: byline,
            location: location,
            content: content,
            position: i === 0 ? 'beginning' : i === articleBoundaries.length - 1 ? 'end' : 'middle',
            category: this.guessCategory(content),
            images: []
          });
        }
      }
      
      console.log('✅ Smart detection found:', stories.length, 'articles');
      stories.forEach((s, i) => console.log(`  ${i + 1}. ${s.headline}`));
      
      return stories;
    }
    
    // Fallback: Single article
    console.log('📄 Treating as single article');
    return [{
      headline: lines[0] || 'Untitled Article',
      byline: '',
      location: '',
      content: fullText,
      position: 'beginning',
      category: 'general',
      images: []
    }];
  }

  guessCategory(text) {
    const lowerText = text.toLowerCase();
    
    const categories = {
      sports: ['game', 'match', 'team', 'player', 'score', 'championship', 'league', 'coach', 'football', 'soccer', 'rugby'],
      politics: ['election', 'government', 'president', 'minister', 'parliament', 'vote', 'policy', 'political'],
      business: ['market', 'stock', 'economy', 'company', 'profit', 'investment', 'business'],
      technology: ['tech', 'software', 'app', 'digital', 'computer', 'internet'],
      health: ['health', 'medical', 'doctor', 'hospital', 'disease', 'patient'],
      entertainment: ['movie', 'film', 'music', 'celebrity', 'actor', 'concert'],
      education: ['school', 'university', 'student', 'teacher', 'education']
    };
    
    let bestCategory = 'news';
    let bestScore = 0;
    
    for (const [category, keywords] of Object.entries(categories)) {
      let score = 0;
      for (const keyword of keywords) {
        const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        score += matches;
      }
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  }

  async matchImagesToStories(stories, images, fullText) {
    if (images.length === 0) {
      return stories.map(story => ({ ...story, images: [] }));
    }

    // Distribute images evenly across stories
    const imagesPerStory = Math.ceil(images.length / stories.length);
    
    return stories.map((story, idx) => ({
      ...story,
      images: images.slice(idx * imagesPerStory, (idx + 1) * imagesPerStory)
    }));
  }

  async checkGrammarAndSpelling(text) {
    // Return mock data for free version
    return {
      corrections: [],
      overallScore: 100,
      readabilityLevel: 'good',
      message: 'Grammar checking requires Anthropic API credits'
    };
  }
}

export const aiPdfProcessor = new AIPdfProcessor();
export default aiPdfProcessor;