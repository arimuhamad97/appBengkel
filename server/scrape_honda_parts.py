"""
Honda Cengkareng Parts Scraper
Scrapes all spare parts data from Honda Cengkareng website
"""
import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin

def scrape_page(page_num):
    """Scrape single page of products"""
    url = f"https://www.hondacengkareng.com/kategori-produk/suku-cadang-resmi-motor-honda/page/{page_num}/"
    
    print(f"Scraping page {page_num}...", end=" ")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        products = []
        
        # Find all product links
        product_links = soup.select('a.woocommerce-LoopProduct-link')
        
        for link in product_links:
            product = {}
            
            # Get product name
            h2 = link.select_one('h2.woocommerce-loop-product__title')
            product['name'] = h2.get_text(strip=True) if h2 else 'N/A'
            
            # Get price
            price_elem = link.select_one('.price bdi')
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                # Extract only numbers
                price_clean = re.sub(r'[^\d]', '', price_text)
                product['price'] = int(price_clean) if price_clean else 0
            else:
                product['price'] = 0
            
            # Get SKU/Kode Part
            sku = 'N/A'
            # Look for "Kode Part:" in various p tags
            p_tags = link.select('p')
            for p in p_tags:
                text = p.get_text(strip=True)
                if 'Kode Part:' in text:
                    sku = text.replace('Kode Part:', '').strip()
                    break
            
            product['sku'] = sku
            
            # Get category/group if available
            category = 'HGP'  # Default
            product['group'] = category
            
            # Get unit (default to pcs)
            product['unit'] = 'pcs'
            
            if product['name'] != 'N/A':
                products.append(product)
        
        print(f"✓ Found {len(products)} products")
        return products
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return []

def main():
    print("=" * 60)
    print("Honda Cengkareng Parts Scraper")
    print("=" * 60)
    print()
    
    # Test with first page to see structure
    print("Testing with first page...")
    test_products = scrape_page(1)
    
    if not test_products:
        print("Failed to scrape first page. Exiting.")
        return
    
    print(f"\nSample product from page 1:")
    print(json.dumps(test_products[0], indent=2, ensure_ascii=False))
    print()
    
    # Ask for confirmation
    total_pages = 395  # Based on website
    print(f"Total pages to scrape: {total_pages}")
    print(f"Estimated products: ~{total_pages * 48}")
    print(f"Estimated time: ~{total_pages * 2 / 60:.1f} minutes (assuming 2 sec/page)")
    print()
    
    response = input("Continue with full scrape? (yes/no): ")
    
    if response.lower() != 'yes':
        print("Scraping cancelled.")
        return
    
    print("\nStarting full scrape...")
    print("=" * 60)
    
    all_products = []
    failed_pages = []
    
    for page_num in range(1, total_pages + 1):
        products = scrape_page(page_num)
        
        if products:
            all_products.extend(products)
        else:
            failed_pages.append(page_num)
        
        # Be respectful to server - add delay
        time.sleep(1.5)
        
        # Save progress every 50 pages
        if page_num % 50 == 0:
            with open('honda_parts_progress.json', 'w', encoding='utf-8') as f:
                json.dump(all_products, f, indent=2, ensure_ascii=False)
            print(f"\nProgress saved! Total products so far: {len(all_products)}\n")
    
    # Save final results
    print("\n" + "=" * 60)
    print(f"Scraping completed!")
    print(f"Total products scraped: {len(all_products)}")
    print(f"Failed pages: {len(failed_pages)}")
    
    if failed_pages:
        print(f"Failed page numbers: {failed_pages[:10]}...")
    
    # Save to JSON
    output_file = 'honda_parts_complete.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)
    
    print(f"\nData saved to: {output_file}")
    
    # Generate statistics
    print("\n" + "=" * 60)
    print("Statistics:")
    print(f"- Total products: {len(all_products)}")
    print(f"- Products with SKU: {sum(1 for p in all_products if p['sku'] != 'N/A')}")
    print(f"- Products with price: {sum(1 for p in all_products if p['price'] > 0)}")
    print(f"- Average price: Rp {sum(p['price'] for p in all_products) / len(all_products):,.0f}")
    print("=" * 60)

if __name__ == "__main__":
    main()
