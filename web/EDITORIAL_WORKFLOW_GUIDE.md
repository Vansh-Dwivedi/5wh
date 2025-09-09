# Editorial Workflow & Draft News Management

## Overview

The 5WH News Platform now includes a comprehensive editorial workflow system that allows for proper review and approval of automatically scraped news articles before they are published on your website.

## Features

### 🔄 Automated News Collection
- **RSS Feeds**: Automatic fetching from various Punjabi news sources
- **Web Scraping**: Intelligent scraping from 5 major Punjabi news websites
- **Combined Approach**: Both RSS and web scraping work together for comprehensive coverage
- **Scheduled Updates**: Automatic fetching every 2 hours with quick RSS checks every 30 minutes

### 📝 Editorial Review System
- **Draft Status**: All scraped articles are automatically saved as drafts
- **Manual Review**: Editorial staff can review each article before publication
- **Bulk Actions**: Select and approve/reject multiple articles at once
- **Content Editing**: Modify titles, content, categories before publishing
- **Preview Mode**: Full article preview before making publishing decisions

### 🎛️ Admin Dashboard Integration
- **Real-time Stats**: Live count of pending draft articles
- **Quick Access**: Direct links to draft management from main dashboard
- **Status Overview**: Visual indicators for draft, published, and total article counts

## How to Use

### Accessing the Draft News Manager

1. **Login to Admin Panel**: Navigate to `/login` and login with admin credentials
2. **Access Dashboard**: Go to `/admin/dashboard`
3. **Review Drafts**: Click "Review Drafts" button or navigate to `/admin/draft-news`

### Managing Draft Articles

#### 1. **Article Overview**
- View all scraped articles in a comprehensive table
- Filter by status: All, Drafts, Published
- See article thumbnails, titles, sources, and metadata
- Real-time stats showing pending review count

#### 2. **Review Actions**
- **👁️ Preview**: View full article content with images and metadata
- **✏️ Edit**: Modify title, content, category, and special flags
- **✅ Publish**: Approve and publish article to live website
- **❌ Delete**: Remove unwanted or duplicate articles

#### 3. **Bulk Operations**
- Filter articles by status (Draft/Published)
- Select multiple articles for batch operations
- Mass approve or reject articles efficiently

### Article Editing Features

#### Content Management
- **Title Editing**: Modify headlines for better SEO and clarity
- **Content Editing**: Full text editing capabilities
- **Category Assignment**: Proper categorization for site organization
- **Featured Article**: Mark important articles as featured
- **Breaking News**: Flag urgent/breaking news stories

#### Metadata Enhancement
- **SEO Optimization**: Automatic slug generation for URLs
- **Image Handling**: Featured image management and optimization
- **Source Attribution**: Proper credit to original news sources
- **Publication Dates**: Controlled publishing timestamps

## Web Scraping Sources

The system automatically scrapes from these trusted Punjabi news sources:

1. **ABP Sanjha** (abpsanjha.com)
2. **Jagbani** (jagbani.com)
3. **Punjabi Tribune** (punjabitribune.com)
4. **Daily Ajit** (dailyajit.com)
5. **Rozana Spokesman** (rozanaspokesman.com)

### Anti-Detection Measures
- Randomized user agents
- Request delays to avoid rate limiting
- Respectful scraping practices
- Error handling and retry logic

## Administrative Features

### News Fetching Controls

1. **Manual Triggers**
   - Trigger RSS fetching manually
   - Initiate web scraping on demand
   - Combined fetch operation
   - Real-time status monitoring

2. **Automated Scheduling**
   - Full news fetch every 2 hours
   - Quick RSS updates every 30 minutes
   - Configurable timing intervals
   - Background processing

### Content Management API

#### Admin Endpoints
- `GET /api/news/admin` - Get all articles with filtering
- `PATCH /api/news/:id` - Update article status/content
- `DELETE /api/news/:id` - Remove articles
- `GET /api/fetch/status` - Get fetching system status

#### Filter Parameters
- `status`: draft, published, archived
- `category`: Filter by content category
- `author`: Filter by article author
- `limit`: Number of articles per page
- `page`: Pagination support

## Best Practices

### Editorial Review Guidelines

1. **Content Verification**
   - Verify article accuracy and credibility
   - Check for duplicate content
   - Ensure proper source attribution
   - Review image relevance and quality

2. **SEO Optimization**
   - Optimize headlines for search engines
   - Ensure proper categorization
   - Add relevant tags and metadata
   - Check URL slugs for readability

3. **Quality Control**
   - Maintain editorial standards
   - Ensure content relevance to audience
   - Check for broken links or images
   - Verify publication dates and sources

### Workflow Efficiency

1. **Batch Processing**
   - Review articles in batches during off-peak hours
   - Use filtering to prioritize breaking news
   - Process similar content types together
   - Maintain consistent publishing schedule

2. **Content Curation**
   - Focus on high-quality, relevant content
   - Avoid duplicate or similar articles
   - Maintain balance across different categories
   - Prioritize local and relevant news

## Technical Architecture

### Database Schema
```javascript
{
  title: String,
  content: String,
  status: 'draft' | 'published' | 'archived',
  category: String,
  featured: Boolean,
  breaking: Boolean,
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  seo: {
    slug: String,
    metaDescription: String,
    originalUrl: String
  },
  source: String,
  rssAuthor: String,
  scrapedAt: Date,
  publishedAt: Date
}
```

### Security Features
- JWT authentication for admin access
- Role-based access control
- Input validation and sanitization
- XSS protection
- Rate limiting on scraping requests

## Troubleshooting

### Common Issues

1. **Articles Not Appearing**
   - Check web scraping service status
   - Verify RSS feed URLs are accessible
   - Review error logs in admin panel
   - Ensure database connection is stable

2. **Slow Performance**
   - Monitor scraping frequency settings
   - Check for large image sizes
   - Review database indexing
   - Optimize query parameters

3. **Duplicate Content**
   - Use content deduplication features
   - Review similar article detection
   - Check source URL filtering
   - Implement content fingerprinting

### Support and Maintenance

- **Log Monitoring**: Check server logs for scraping errors
- **Performance Metrics**: Monitor response times and success rates
- **Content Quality**: Regular review of published content
- **Source Management**: Keep scraping targets updated and functional

## Future Enhancements

### Planned Features
- **AI Content Analysis**: Automatic content quality scoring
- **Advanced Deduplication**: Machine learning-based duplicate detection
- **Multi-language Support**: Support for more regional languages
- **Social Media Integration**: Auto-posting to social platforms
- **Analytics Dashboard**: Detailed performance and engagement metrics

### Customization Options
- **Scraping Intervals**: Configurable update frequencies
- **Content Filters**: Custom filtering rules for content quality
- **Notification Systems**: Email/SMS alerts for breaking news
- **Workflow Automation**: Rule-based auto-approval for trusted sources

---

*This documentation covers the complete editorial workflow system. For technical support or feature requests, contact the development team.*
