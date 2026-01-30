# Pi Web Search

A web search extension for pi using the [Exa AI](https://exa.ai) API (free tier available).

Inspired by opencode's web search implementation.

## Features

- 🔍 **Neural & Keyword Search** - Uses Exa's neural search for semantic understanding
- 📄 **Content Extraction** - Returns page text, highlights, and summaries
- 🎯 **Domain Filtering** - Include/exclude specific domains
- ⚡ **Auto-prompt Enhancement** - Exa automatically improves your queries
- 🆓 **Free Tier** - Exa offers 1000 free searches/month

## Setup

### 1. Get an Exa API Key

1. Go to [https://exa.ai](https://exa.ai)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Set the Environment Variable

```bash
# Add to your shell profile (~/.zshrc, ~/.bashrc, etc.)
export EXA_API_KEY=your-api-key-here

# Or add to .env file in your project
echo "EXA_API_KEY=your-api-key" >> .env
```

### 3. Use with Pi

The extension is auto-discovered from `~/.pi/agent/extensions/pi-web-search/`.

```bash
# Start pi - extension loads automatically
pi

# Or load explicitly
pi -e ~/.pi/agent/extensions/pi-web-search
```

## Usage

### Ask the LLM to Search

```
> Search the web for "TypeScript best practices 2025"

> Find documentation for the Exa API

> Look up recent news about AI coding assistants
```

### Use the /search Command

```
> /search TypeScript async patterns
> /search site:github.com pi coding agent
```

### Tool Parameters

The LLM can call `web_search` with these parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query |
| `numResults` | number | 5 | Number of results (1-10) |
| `type` | string | "auto" | Search type: "auto", "keyword", or "neural" |
| `includeContent` | boolean | true | Include page content in results |
| `includeDomains` | string[] | - | Only search these domains |
| `excludeDomains` | string[] | - | Exclude these domains |

## Configuration

Create `.web-search.json` in your project or home directory:

```json
{
  "apiKey": "$EXA_API_KEY",
  "defaultNumResults": 5,
  "defaultSearchType": "auto",
  "includeDomains": [
    "github.com",
    "stackoverflow.com",
    "developer.mozilla.org"
  ],
  "excludeDomains": [
    "pinterest.com",
    "facebook.com"
  ],
  "defaultContents": {
    "text": { "maxCharacters": 3000 },
    "highlights": { "numSentences": 3 }
  }
}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `apiKey` | Exa API key (use `$ENV_VAR` for env reference) | `$EXA_API_KEY` |
| `defaultNumResults` | Default number of results | 5 |
| `defaultSearchType` | Default search type | "auto" |
| `includeDomains` | Default domains to include | - |
| `excludeDomains` | Default domains to exclude | - |
| `defaultContents` | Default content extraction options | text + highlights |

## Search Types

| Type | Description | Best For |
|------|-------------|----------|
| `auto` | Exa decides based on query | Most queries |
| `neural` | Semantic understanding | Conceptual questions |
| `keyword` | Traditional keyword matching | Exact phrases, names |

## Examples

### Technical Documentation

```
> Search for "React Server Components documentation" on github.com and react.dev
```

### Recent News

```
> Find recent articles about Claude AI from the last month
```

### Code Examples

```
> Search for TypeScript decorator examples on stackoverflow.com
```

### Domain-Specific Search

```
> Look up Python async patterns on docs.python.org
```

## Output Format

Results include:
- **Title** - Page title
- **URL** - Source URL
- **Published Date** - When the content was published
- **Relevance Score** - How well it matches your query
- **Highlights** - Key excerpts from the content
- **Content** - Extracted text (truncated for context)

## Troubleshooting

### "EXA_API_KEY not found"

Make sure you've set the environment variable:
```bash
export EXA_API_KEY=your-api-key
```

Or add it to a `.env` file in your project.

### Rate Limits

Exa's free tier includes:
- 1000 searches/month
- 10 requests/minute

For higher limits, upgrade your Exa plan.

### Poor Results

Try:
1. Be more specific in your query
2. Use `type: "neural"` for conceptual questions
3. Use `type: "keyword"` for exact phrases
4. Add domain filters to narrow results

## API Reference

### Exa API

This extension uses the [Exa Search API](https://docs.exa.ai/reference/search):
- Endpoint: `POST https://api.exa.ai/search`
- Authentication: `x-api-key` header

### Free Tier Limits

- 1000 searches/month
- 10 results per search
- Text content extraction
- Highlights and summaries

## License

MIT
