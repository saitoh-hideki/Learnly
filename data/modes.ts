import { Mode } from '@/store/useStore'

export const mainLearningModes: Mode[] = [
  {
    id: 'news-learning',
    name: 'ニュースで学ぶ',
    description: '毎日1つのニュースを起点に、自分の言葉で深く学び、デジタル提案までアウトプット',
    icon: '📰',
    popularity: 0,
    features: [
      '✅ デイリーニュースで最新トレンドをキャッチ',
      '✅ AIとの対話で深い理解を促進',
      '✅ 実践的なデジタル提案を作成'
    ]
  },
  {
    id: 'theme-learning',
    name: 'テーマで学ぶ',
    description: '7日間の体系的なテーマ学習で、分野別の専門知識を深める',
    icon: '📘',
    popularity: 0,
    features: [
      '✅ 7日間の段階的学習プログラム',
      '✅ 分野別の専門知識を体系的に習得',
      '✅ 最終日に総合的なアウトプット作成'
    ]
  }
]

export const learningModes: Mode[] = [
  {
    id: 'business',
    name: 'ビジネス・経営',
    description: '最新のビジネストレンドや経営戦略について学ぶ',
    icon: '💼',
    popularity: 0
  },
  {
    id: 'technology',
    name: 'テクノロジー・IT',
    description: 'AI、プログラミング、最新技術トレンドを追う',
    icon: '💻',
    popularity: 0
  },
  {
    id: 'science',
    name: '科学・研究',
    description: '最新の科学的発見や研究成果について深く理解する',
    icon: '🔬',
    popularity: 0
  },
  {
    id: 'economics',
    name: '経済・金融',
    description: '経済動向、投資、金融市場の理解を深める',
    icon: '📊',
    popularity: 0
  },
  {
    id: 'health',
    name: '健康・医療',
    description: '健康管理、最新医療情報、ウェルネストレンド',
    icon: '🏥',
    popularity: 0
  },
  {
    id: 'education',
    name: '教育・学習',
    description: '効果的な学習方法、教育改革、スキル開発',
    icon: '📚',
    popularity: 0
  },
  {
    id: 'culture',
    name: '文化・芸術',
    description: 'アート、文学、音楽などの文化的トピックス',
    icon: '🎨',
    popularity: 0
  },
  {
    id: 'society',
    name: '社会・政治',
    description: '社会問題、政治動向、グローバルイシュー',
    icon: '🏛️',
    popularity: 0
  },
  {
    id: 'environment',
    name: '環境・サステナビリティ',
    description: '気候変動、環境保護、持続可能な開発',
    icon: '🌱',
    popularity: 0
  },
  {
    id: 'psychology',
    name: '心理学・自己啓発',
    description: 'メンタルヘルス、自己成長、人間関係',
    icon: '🧠',
    popularity: 0
  },
  {
    id: 'history',
    name: '歴史・文明',
    description: '歴史的出来事、文明の発展、考古学的発見',
    icon: '📜',
    popularity: 0
  },
  {
    id: 'sports',
    name: 'スポーツ・フィットネス',
    description: 'スポーツニュース、トレーニング、アスリート研究',
    icon: '⚽',
    popularity: 0
  }
]