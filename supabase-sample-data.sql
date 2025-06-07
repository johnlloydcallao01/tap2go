-- Sample Data for WordPress-Style CMS
-- Run this AFTER creating the schema and policies

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Food & Dining', 'food-dining', 'Everything about food, restaurants, and dining experiences'),
('Technology', 'technology', 'Latest tech trends and innovations in food delivery'),
('Business', 'business', 'Restaurant business insights and industry news'),
('Health & Nutrition', 'health-nutrition', 'Healthy eating tips and nutritional information'),
('Local Stories', 'local-stories', 'Stories from local restaurants and communities');

-- Insert sample tags
INSERT INTO tags (name, slug, description) VALUES
('delivery', 'delivery', 'Food delivery related content'),
('restaurants', 'restaurants', 'Restaurant features and reviews'),
('recipes', 'recipes', 'Cooking recipes and food preparation'),
('tips', 'tips', 'Helpful tips and advice'),
('news', 'news', 'Latest news and updates'),
('featured', 'featured', 'Featured content'),
('trending', 'trending', 'Trending topics'),
('local', 'local', 'Local community content');

-- Insert sample blog posts
INSERT INTO blog_posts (
  title, slug, content, excerpt, status, 
  featured_image_url, meta_title, meta_description,
  author_name, author_email, is_featured, reading_time
) VALUES
(
  'The Future of Food Delivery: Trends to Watch in 2024',
  'future-food-delivery-trends-2024',
  '<p>The food delivery industry continues to evolve at a rapid pace. From drone deliveries to AI-powered recommendations, here are the key trends shaping the future of food delivery.</p>

<h2>1. Sustainable Delivery Options</h2>
<p>Environmental consciousness is driving demand for eco-friendly delivery methods. Electric bikes, reusable packaging, and carbon-neutral delivery options are becoming standard.</p>

<h2>2. AI-Powered Personalization</h2>
<p>Machine learning algorithms are revolutionizing how customers discover new restaurants and dishes based on their preferences and ordering history.</p>

<h2>3. Ghost Kitchens and Virtual Brands</h2>
<p>The rise of delivery-only restaurants continues to reshape the industry, offering lower overhead costs and specialized menus.</p>

<p>These trends represent just the beginning of a transformation that will make food delivery faster, more sustainable, and more personalized than ever before.</p>',
  'Explore the latest trends shaping the food delivery industry in 2024, from sustainable delivery to AI-powered personalization.',
  'published',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  'Future of Food Delivery: 2024 Trends | Tap2Go Blog',
  'Discover the key trends transforming food delivery in 2024. Learn about sustainable delivery, AI personalization, and ghost kitchens.',
  'Sarah Johnson',
  'sarah@tap2go.com',
  true,
  3
),
(
  'How to Choose the Perfect Restaurant for Your Next Order',
  'choose-perfect-restaurant-order',
  '<p>With thousands of restaurants available on delivery platforms, choosing the right one can be overwhelming. Here''s your guide to making the perfect choice every time.</p>

<h2>Consider Your Mood and Cravings</h2>
<p>Start by identifying what you''re in the mood for. Are you craving comfort food, something healthy, or perhaps trying a new cuisine?</p>

<h2>Check Reviews and Ratings</h2>
<p>Look beyond the star rating. Read recent reviews to understand the restaurant''s current quality and service levels.</p>

<h2>Delivery Time and Distance</h2>
<p>Consider how far the restaurant is and their estimated delivery time. Sometimes the best food isn''t worth a cold meal.</p>

<h2>Menu Variety and Dietary Options</h2>
<p>Ensure the restaurant can accommodate everyone in your group, including any dietary restrictions or preferences.</p>',
  'A comprehensive guide to selecting the best restaurant for your food delivery order, considering taste, quality, and convenience.',
  'published',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  'How to Choose the Perfect Restaurant | Tap2Go Tips',
  'Learn how to select the best restaurant for your delivery order with our comprehensive guide covering reviews, timing, and preferences.',
  'Mike Chen',
  'mike@tap2go.com',
  false,
  2
),
(
  '10 Local Restaurants You Must Try This Month',
  'local-restaurants-must-try-month',
  '<p>Discover hidden gems in your neighborhood with our curated list of must-try local restaurants that are making waves in the food scene.</p>

<h2>1. Mama''s Kitchen - Authentic Filipino Cuisine</h2>
<p>Family-owned restaurant serving traditional Filipino dishes with a modern twist. Don''t miss their adobo and lumpia.</p>

<h2>2. Green Bowl - Plant-Based Paradise</h2>
<p>Innovative vegan restaurant offering creative plant-based versions of classic comfort foods.</p>

<h2>3. Spice Route - Indian Street Food</h2>
<p>Authentic Indian street food experience with bold flavors and traditional cooking methods.</p>

<p>Each of these restaurants offers something unique and represents the diverse culinary landscape of our local food scene.</p>',
  'Explore our handpicked selection of local restaurants that are redefining the dining experience in your area.',
  'published',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  '10 Must-Try Local Restaurants | Tap2Go Local Guide',
  'Discover amazing local restaurants in your area with our curated guide featuring diverse cuisines and hidden gems.',
  'Lisa Rodriguez',
  'lisa@tap2go.com',
  true,
  4
);

-- Insert sample static pages
INSERT INTO static_pages (
  title, slug, content, status, 
  meta_title, meta_description, show_in_navigation, 
  navigation_label, menu_order, author_name, page_template
) VALUES
(
  'About Tap2Go',
  'about',
  '<h1>About Tap2Go</h1>
  
  <p>Tap2Go is revolutionizing the food delivery experience by connecting food lovers with the best local restaurants in their area. Founded in 2023, we''re committed to making great food accessible to everyone.</p>
  
  <h2>Our Mission</h2>
  <p>To create a seamless bridge between hungry customers and amazing local restaurants, while supporting local businesses and communities.</p>
  
  <h2>What Makes Us Different</h2>
  <ul>
    <li>Lightning-fast delivery times</li>
    <li>Support for local restaurants</li>
    <li>Transparent pricing with no hidden fees</li>
    <li>Exceptional customer service</li>
  </ul>
  
  <h2>Our Values</h2>
  <p>We believe in supporting local communities, providing excellent service, and making great food accessible to everyone. Every order placed through Tap2Go helps support local restaurant owners and their teams.</p>',
  'published',
  'About Tap2Go - Your Local Food Delivery Partner',
  'Learn about Tap2Go''s mission to connect food lovers with the best local restaurants through fast, reliable delivery service.',
  true,
  'About',
  1,
  'Admin',
  'default'
),
(
  'Contact Us',
  'contact',
  '<h1>Contact Tap2Go</h1>
  
  <p>We''d love to hear from you! Whether you have questions, feedback, or need support, our team is here to help.</p>
  
  <h2>Customer Support</h2>
  <p>For order-related questions or technical support:</p>
  <ul>
    <li>Email: support@tap2go.com</li>
    <li>Phone: +63 (2) 8123-4567</li>
    <li>Live Chat: Available 24/7 in the app</li>
  </ul>
  
  <h2>Restaurant Partnerships</h2>
  <p>Interested in partnering with Tap2Go?</p>
  <ul>
    <li>Email: partners@tap2go.com</li>
    <li>Phone: +63 (2) 8765-4321</li>
  </ul>
  
  <h2>Business Hours</h2>
  <p>Customer Support: 24/7<br>
  Partnership Team: Monday - Friday, 9 AM - 6 PM</p>',
  'published',
  'Contact Tap2Go - Customer Support & Partnerships',
  'Get in touch with Tap2Go for customer support, restaurant partnerships, or general inquiries. We''re here to help 24/7.',
  true,
  'Contact',
  2,
  'Admin',
  'contact'
),
(
  'Privacy Policy',
  'privacy-policy',
  '<h1>Privacy Policy</h1>
  
  <p><em>Last updated: January 2024</em></p>
  
  <p>At Tap2Go, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
  
  <h2>Information We Collect</h2>
  <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support.</p>
  
  <h2>How We Use Your Information</h2>
  <ul>
    <li>To process and fulfill your orders</li>
    <li>To communicate with you about your orders</li>
    <li>To improve our services</li>
    <li>To send you promotional communications (with your consent)</li>
  </ul>
  
  <h2>Information Sharing</h2>
  <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
  
  <h2>Data Security</h2>
  <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>',
  'published',
  'Tap2Go Privacy Policy - How We Protect Your Data',
  'Read Tap2Go''s privacy policy to understand how we collect, use, and protect your personal information and data.',
  true,
  'Privacy',
  3,
  'Admin',
  'legal'
);

-- Link blog posts to categories and tags
INSERT INTO post_categories (post_id, category_id) VALUES
(1, 2), -- Future of Food Delivery -> Technology
(1, 3), -- Future of Food Delivery -> Business
(2, 1), -- Choose Perfect Restaurant -> Food & Dining
(3, 1), -- Local Restaurants -> Food & Dining
(3, 5); -- Local Restaurants -> Local Stories

INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), -- Future of Food Delivery -> delivery
(1, 5), -- Future of Food Delivery -> news
(1, 6), -- Future of Food Delivery -> featured
(2, 2), -- Choose Perfect Restaurant -> restaurants
(2, 4), -- Choose Perfect Restaurant -> tips
(3, 2), -- Local Restaurants -> restaurants
(3, 6), -- Local Restaurants -> featured
(3, 8); -- Local Restaurants -> local
