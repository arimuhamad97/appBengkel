/**
 * Honda Cengkareng Parts Scraper - Simple Version
 * No external dependencies, uses built-in Node.js modules only
 */

import https from 'https';
import fs from 'fs';

const BASE_URL = 'https://www.hondacengkareng.com/kategori-produk/suku-cadang-resmi-motor-honda';
const TOTAL_PAGES = 395; // Full scraping - all pages
const DELAY_MS = 2000;

// Simple HTML parser using regex (not perfect but works for this case)
function parseProducts(html) {
    const products = [];

    // Match product blocks - find all product links
    const productPattern = /<a[^>]*class="[^"]*woocommerce-LoopProduct-link[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
    let match;

    while ((match = productPattern.exec(html)) !== null) {
        const productHtml = match[1];

        // Extract name from h2
        const nameMatch = /<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]+)<\/h2>/.exec(productHtml);
        const name = nameMatch ? nameMatch[1].trim() : 'N/A';

        // Extract price
        const priceMatch = /<bdi[^>]*>([^<]+)<\/bdi>/.exec(productHtml);
        let price = 0;
        if (priceMatch) {
            const priceText = priceMatch[1];
            const priceClean = priceText.replace(/[^\d]/g, '');
            price = priceClean ? parseInt(priceClean) : 0;
        }

        // Extract SKU - look for "Kode Part:"
        let sku = 'N/A';
        const skuMatch = /Kode Part:\s*([A-Z0-9]+)/i.exec(productHtml);
        if (skuMatch) {
            sku = skuMatch[1].trim();
        }

        if (name !== 'N/A') {
            products.push({
                name,
                sku,
                price,
                group: 'HGP',
                unit: 'pcs'
            });
        }
    }

    return products;
}

// Function to fetch HTML content
function fetchPage(pageNum) {
    return new Promise((resolve, reject) => {
        const url = pageNum === 1
            ? `${BASE_URL}/`
            : `${BASE_URL}/page/${pageNum}/`;

        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }

            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });

        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to sleep/delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main scraping function
async function scrapePage(pageNum) {
    process.stdout.write(`Page ${pageNum}/${TOTAL_PAGES}... `);

    try {
        const html = await fetchPage(pageNum);
        const products = parseProducts(html);
        console.log(`✓ ${products.length} products`);
        return products;
    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
        return [];
    }
}

// Main function
async function main() {
    console.log('='.repeat(60));
    console.log('Honda Cengkareng Parts Scraper');
    console.log('='.repeat(60));
    console.log();

    // Test with first page
    console.log('Testing first page...');
    const testProducts = await scrapePage(1);

    if (testProducts.length === 0) {
        console.log('❌ Failed to scrape first page. Exiting.');
        return;
    }

    console.log('\n📦 Sample product:');
    console.log(JSON.stringify(testProducts[0], null, 2));
    console.log();

    console.log(`📊 Scraping ${TOTAL_PAGES} pages...`);
    console.log(`⏱️  Estimated: ~${(TOTAL_PAGES * DELAY_MS / 1000 / 60).toFixed(1)} minutes`);
    console.log();

    const allProducts = [];
    const failedPages = [];

    for (let pageNum = 1; pageNum <= TOTAL_PAGES; pageNum++) {
        const products = await scrapePage(pageNum);

        if (products.length > 0) {
            allProducts.push(...products);
        } else {
            failedPages.push(pageNum);
        }

        await sleep(DELAY_MS);
    }

    // Save final results
    console.log('\n' + '='.repeat(60));
    console.log('✅ Scraping completed!');
    console.log(`📦 Total products: ${allProducts.length}`);
    console.log(`❌ Failed pages: ${failedPages.length}`);

    const outputFile = 'server/honda_parts_scraped.json';
    fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2));

    console.log(`💾 Data saved to: ${outputFile}`);

    // Statistics
    const productsWithSKU = allProducts.filter(p => p.sku !== 'N/A').length;
    const productsWithPrice = allProducts.filter(p => p.price > 0).length;
    const avgPrice = allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length;

    console.log('\n📊 Statistics:');
    console.log(`   • Total: ${allProducts.length}`);
    console.log(`   • With SKU: ${productsWithSKU} (${(productsWithSKU / allProducts.length * 100).toFixed(1)}%)`);
    console.log(`   • With price: ${productsWithPrice} (${(productsWithPrice / allProducts.length * 100).toFixed(1)}%)`);
    console.log(`   • Avg price: Rp ${Math.round(avgPrice).toLocaleString('id-ID')}`);
    console.log('='.repeat(60));
    console.log();
    console.log('💡 To scrape ALL 395 pages (18,950 products):');
    console.log('   Edit TOTAL_PAGES to 395 in the script and run again.');
    console.log('   Estimated time: ~13 minutes');
}

// Run
main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
