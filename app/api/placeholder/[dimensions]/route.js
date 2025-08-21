// app/api/placeholder/[dimensions]/route.js

export async function GET(request, { params }) {
  try {
    // Get the dimensions from the URL (e.g., "350x250")
    const { dimensions } = await params;
    
    // Get query parameters (like ?text=Image+Not+Available)
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || 'No Image Available';
    
    // Validate and parse dimensions
    if (!dimensions || !dimensions.includes('x')) {
      return new Response('Invalid dimensions format. Use: widthxheight', { 
        status: 400 
      });
    }
    
    // Split "350x250" into [350, 250] and convert to numbers
    const [width, height] = dimensions.split('x').map(Number);
    
    // Validate the numbers
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      return new Response('Invalid dimensions. Must be positive numbers.', { 
        status: 400 
      });
    }
    
    // Limit maximum size to prevent abuse
    if (width > 2000 || height > 2000) {
      return new Response('Dimensions too large. Max: 2000x2000', { 
        status: 400 
      });
    }
    
    // Calculate font size based on image size
    const fontSize = Math.min(width, height) / 20;
    const maxFontSize = Math.min(24, fontSize);
    const finalFontSize = Math.max(12, maxFontSize);
    
    // Create SVG placeholder image
    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Background rectangle -->
        <rect width="${width}" height="${height}" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="2"/>
        
        <!-- Optional: Add a subtle pattern -->
        <defs>
          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="10" height="10">
            <path d="M 0,10 l 10,-10 M -2.5,2.5 l 5,-5 M 7.5,12.5 l 5,-5" stroke="#E5E7EB" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#diagonalHatch)" opacity="0.5"/>
        
        <!-- Camera icon (simple) -->
        <g transform="translate(${width/2 - 20}, ${height/2 - 30})">
          <rect x="0" y="10" width="40" height="30" fill="#9CA3AF" rx="4"/>
          <circle cx="20" cy="20" r="8" fill="#6B7280"/>
          <circle cx="20" cy="20" r="5" fill="#374151"/>
          <rect x="15" y="5" width="10" height="8" fill="#9CA3AF" rx="2"/>
        </g>
        
        <!-- Text -->
        <text 
          x="50%" 
          y="${height/2 + 50}" 
          font-family="Arial, sans-serif" 
          font-size="${finalFontSize}" 
          fill="#6B7280" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          ${text.replace(/\+/g, ' ')}
        </text>
        
        <!-- Dimensions text -->
        <text 
          x="50%" 
          y="${height/2 + 70}" 
          font-family="Arial, sans-serif" 
          font-size="${Math.max(10, finalFontSize - 4)}" 
          fill="#9CA3AF" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          ${width} × ${height}
        </text>
      </svg>
    `;

    // Return the SVG with proper headers
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
      }
    });

  } catch (error) {
    console.error('Placeholder API error:', error);
    
    // Return a simple error placeholder
    const errorSvg = `
      <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="100" fill="#FEF2F2" stroke="#FCA5A5"/>
        <text x="50%" y="50%" font-family="Arial" font-size="12" fill="#DC2626" text-anchor="middle" dominant-baseline="middle">
          Error loading placeholder
        </text>
      </svg>
    `;
    
    return new Response(errorSvg, {
      status: 500,
      headers: {
        'Content-Type': 'image/svg+xml',
      }
    });
  }
}