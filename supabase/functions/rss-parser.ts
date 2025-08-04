// XML要素を抽出する関数
export function extractElement(text: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi')
  const matches = text.match(regex)
  if (!matches) return []
  
  return matches.map(match => {
    const contentMatch = match.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'))
    return contentMatch ? contentMatch[1].trim() : ''
  }).filter(content => content.length > 0)
}

// 属性付きXML要素を抽出する関数（Atom用）
export function extractElementWithAttribute(text: string, tagName: string, attribute: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*${attribute}="([^"]*)"[^>]*>`, 'gi')
  const matches = text.match(regex)
  if (!matches) return []
  
  return matches.map(match => {
    const attrMatch = match.match(new RegExp(`${attribute}="([^"]*)"`, 'i'))
    return attrMatch ? attrMatch[1].trim() : ''
  }).filter(content => content.length > 0)
}

// RSS 2.0フィードをパース
export function parseRSS2Feed(text: string): any[] {
  const items: any[] = []
  
  // item要素を抽出
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  const itemMatches = text.match(itemRegex)
  
  if (!itemMatches) return items
  
  for (const itemText of itemMatches.slice(0, 5)) { // 最新5件
    const titles = extractElement(itemText, 'title')
    const links = extractElement(itemText, 'link')
    const descriptions = extractElement(itemText, 'description')
    const pubDates = extractElement(itemText, 'pubDate')
    const guids = extractElement(itemText, 'guid')
    
    if (titles.length > 0 && links.length > 0) {
      items.push({
        title: titles[0],
        link: links[0],
        description: descriptions.length > 0 ? descriptions[0] : '',
        pubDate: pubDates.length > 0 ? new Date(pubDates[0]) : new Date(),
        guid: guids.length > 0 ? guids[0] : links[0],
      })
    }
  }
  
  return items
}

// Atomフィードをパース
export function parseAtomFeed(text: string): any[] {
  const items: any[] = []
  
  // entry要素を抽出
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi
  const entryMatches = text.match(entryRegex)
  
  if (!entryMatches) return items
  
  for (const entryText of entryMatches.slice(0, 5)) { // 最新5件
    const titles = extractElement(entryText, 'title')
    const links = extractElementWithAttribute(entryText, 'link', 'href')
    const summaries = extractElement(entryText, 'summary')
    const contents = extractElement(entryText, 'content')
    const published = extractElement(entryText, 'published')
    const updated = extractElement(entryText, 'updated')
    const ids = extractElement(entryText, 'id')
    
    if (titles.length > 0 && links.length > 0) {
      items.push({
        title: titles[0],
        link: links[0],
        description: summaries.length > 0 ? summaries[0] : (contents.length > 0 ? contents[0] : ''),
        pubDate: published.length > 0 || updated.length > 0 ? 
          new Date(published.length > 0 ? published[0] : updated[0]) : new Date(),
        guid: ids.length > 0 ? ids[0] : links[0],
      })
    }
  }
  
  return items
}

// 堅牢なRSSパーサー
export async function parseRSS(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LearnlyRSSBot/1.0)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    
    // フィードタイプを判定
    const isRSS = /<rss[^>]*>/i.test(text)
    const isAtom = /<feed[^>]*>/i.test(text)
    
    let items: any[] = []
    
    if (isRSS) {
      // RSS 2.0
      items = parseRSS2Feed(text)
    } else if (isAtom) {
      // Atom
      items = parseAtomFeed(text)
    } else {
      // その他の形式を試行
      const rssItems = parseRSS2Feed(text)
      const atomItems = parseAtomFeed(text)
      items = rssItems.length > 0 ? rssItems : atomItems
    }
    
    return items
    
  } catch (error) {
    console.error(`RSS parsing error for ${url}:`, error)
    return []
  }
}

// HTMLタグを除去する関数
export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim()
}

// 要約を生成する関数（簡易版）
export function generateSummary(text: string, maxLength: number = 100): string {
  const cleanText = stripHtmlTags(text)
  if (cleanText.length <= maxLength) {
    return cleanText
  }
  return cleanText.substring(0, maxLength) + '...'
} 