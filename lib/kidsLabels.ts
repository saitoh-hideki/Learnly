// キッズモード用ラベル管理システム
export interface Labels {
  // 共通
  startLearning: string
  dashboardTitle: string
  dashboardSubtitle: string
  
  // ヒーローセクション
  hero: {
    title: string
    description: string
  }
  
  // フィーチャーセクション
  features: {
    title: string
    subtitle: string
  }
  
  // CTAセクション
  cta: {
    title: string
    description: string
  }
  
  // ニュース関連
  newsLearning: string
  newsLearningSubtitle: string
  savedNews: string
  savedNewsSubtitle: string
  newsStock: string
  newsStockSubtitle: string
  newsTopics: string
  newsTopicsSubtitle: string
  
  // 学習関連
  themeLearning: string
  themeLearningSubtitle: string
  learningHistory: string
  learningHistorySubtitle: string
  createReview: string
  createReviewSubtitle: string
  
  // カテゴリ
  categories: {
    business: string
    technology: string
    economics: string
    science: string
    education: string
    health: string
    environment: string
    society: string
    lifestyle: string
  }
  
  // ボタン・アクション
  buttons: {
    startFree: string
    demo: string
    settings: string
    back: string
    search: string
    filter: string
    save: string
    delete: string
    download: string
    chat: string
    review: string
  }
  
  // メッセージ
  messages: {
    noSavedNews: string
    noSavedNewsSubtitle: string
    viewNews: string
    loading: string
    error: string
    success: string
  }
  
  // FAQ
  faq: {
    title: string
    subtitle: string
    questions: {
      aiChat: string
      aiChatAnswer: string
      noKnowledge: string
      noKnowledgeAnswer: string
      cost: string
      costAnswer: string
      newsTypes: string
      newsTypesAnswer: string
    }
  }
}

// 通常モードのラベル
export const normalLabels: Labels = {
  startLearning: "学習を始める",
  dashboardTitle: "学習モードを選択",
  dashboardSubtitle: "Building intelligence through information from a changing world - a new form of learning",
  
  hero: {
    title: "AIと共に学びを深める",
    description: "保存したニュースを使って、AIと対話しながら深く学ぶ。難しい概念も、AIが分かりやすく説明してくれる。"
  },
  
  features: {
    title: "実際の画面イメージ",
    subtitle: "学習しやすい画面設計"
  },
  
  cta: {
    title: "今すぐ始めよう",
    description: "学びたい気持ちがあれば、すぐに始められます"
  },
  
  newsLearning: "ニュースで学ぶ",
  newsLearningSubtitle: "毎日のニュースを教材に、AIと対話しながら深く学ぶ",
  savedNews: "保存済みニュース",
  savedNewsSubtitle: "保存したニュース記事の管理",
  newsStock: "ニュースストック",
  newsStockSubtitle: "保存したニュース記事の管理",
  newsTopics: "ニューストピック",
  newsTopicsSubtitle: "興味のあるトピックを選択",
  
  themeLearning: "テーマ別学習",
  themeLearningSubtitle: "特定のテーマについて深く学ぶ",
  learningHistory: "学習履歴",
  learningHistorySubtitle: "過去の学習記録を確認",
  createReview: "レビューを作成",
  createReviewSubtitle: "学んだ内容をまとめる",
  
  categories: {
    business: "ビジネス・経営",
    technology: "テクノロジー・IT",
    economics: "経済・金融",
    science: "科学・研究",
    education: "教育・学習",
    health: "健康・医療",
    environment: "環境・サステナビリティ",
    society: "社会・政治",
    lifestyle: "文化・ライフスタイル"
  },
  
  buttons: {
    startFree: "無料ではじめる",
    demo: "デモを見る",
    settings: "設定",
    back: "戻る",
    search: "検索",
    filter: "絞り込み",
    save: "保存",
    delete: "削除",
    download: "ダウンロード",
    chat: "チャット",
    review: "レビュー"
  },
  
  messages: {
    noSavedNews: "まだニュースが保存されていません",
    noSavedNewsSubtitle: "ニュースダッシュボードで記事を保存しましょう",
    viewNews: "ニュースを見る",
    loading: "読み込み中...",
    error: "エラーが発生しました",
    success: "成功しました"
  },
  
  faq: {
    title: "よくある質問",
    subtitle: "よくある質問について",
    questions: {
      aiChat: "本当にAIと自然に話せますか？",
      aiChatAnswer: "保存されたニュースの文脈をもとに学習が始まります。AIがあなたの興味に合わせて最適な学習体験を提供します。",
      noKnowledge: "専門知識がなくても使えますか？",
      noKnowledgeAnswer: "テーマを選ぶだけで学習はスタートできます。AIが段階的にサポートし、初心者でも安心して学べます。",
      cost: "費用はかかりますか？",
      costAnswer: "現在は無料プランでご利用いただけます。学びたい気持ちがあれば、すぐに始められます。",
      newsTypes: "どのようなニュースが保存できますか？",
      newsTypesAnswer: "ビジネス、テクノロジー、経済、科学、教育、健康、環境、社会、ライフスタイルの9カテゴリのニュースを保存できます。"
    }
  }
}

// キッズモードのラベル
export const kidsLabels: Labels = {
  startLearning: "べんきょうを スタート！",
  dashboardTitle: "テーマを えらぼう",
  dashboardSubtitle: "Building intelligence through information from a changing world - a new form of learning",
  
  hero: {
    title: "AIと いっしょに まなぼう！",
    description: "ほぞんした ニュースを つかって、AIと おしゃべりしよう！むずかしいことも、AIが わかりやすく せつめいしてくれるよ。"
  },
  
  features: {
    title: "つかいやすい がめんを しょうかい",
    subtitle: "べんきょうしやすい がめんだよ"
  },
  
  cta: {
    title: "いま すぐ はじめてみよう！",
    description: "べんきょうしたい きもちがあれば、すぐに はじめられるよ"
  },
  
  newsLearning: "ニュースから まなぼう",
  newsLearningSubtitle: "まいにちの ニュースを つかって、AIと おしゃべりしながら まなぼう",
  savedNews: "とっておいた ニュース",
  savedNewsSubtitle: "ほぞんした ニュースの かんり",
  newsStock: "ニュースの とっておき",
  newsStockSubtitle: "ほぞんした ニュースの かんり",
  newsTopics: "ニュースの テーマ",
  newsTopicsSubtitle: "きょうみのある テーマを えらぼう",
  
  themeLearning: "テーマべつ べんきょう",
  themeLearningSubtitle: "とくべつな テーマについて ふかく まなぼう",
  learningHistory: "きょうの べんきょうログ",
  learningHistorySubtitle: "むかしの べんきょうを かくにん",
  createReview: "まとめを つくろう",
  createReviewSubtitle: "まなんだ ことを まとめる",
  
  categories: {
    business: "しごとや かいしゃのこと",
    technology: "でんし の もの・デジタルのこと",
    economics: "おかねや しょうばいのこと",
    science: "かがく の はっけん",
    education: "べんきょうや がくしゅう",
    health: "けんこうや びょういん",
    environment: "かんきょうや ちきゅうのこと",
    society: "しゃかい の ルール や もんだい",
    lifestyle: "せいかつや ぶんかのこと"
  },
  
  buttons: {
    startFree: "いま すぐ はじめてみよう！",
    demo: "ためしに みてみよう",
    settings: "せってい",
    back: "もどる",
    search: "さがす",
    filter: "しぼりこみ",
    save: "ほぞん",
    delete: "けす",
    download: "ダウンロード",
    chat: "おしゃべり",
    review: "まとめ"
  },
  
  messages: {
    noSavedNews: "まだ ニュースが ほぞんされていないよ",
    noSavedNewsSubtitle: "ニュースダッシュボードで きじを ほぞんしよう",
    viewNews: "ニュースを みる",
    loading: "よみこみちゅう...",
    error: "エラーが はっせいしたよ",
    success: "せいこうしたよ"
  },
  
  faq: {
    title: "みんなの ぎもん",
    subtitle: "よく きかれる しつもん",
    questions: {
      aiChat: "ほんとうに AIと しぜんに はなせるの？",
      aiChatAnswer: "ほぞんされた ニュースの ぶんみゃくを もとに がくしゅうが はじまります。AIが きみの きょうみに あわせて さいこうの がくしゅうたいけんを ていきょうしてくれるよ。",
      noKnowledge: "せんもんちしきが なくても つかえるの？",
      noKnowledgeAnswer: "テーマを えらぶだけで がくしゅうは スタートできるよ。AIが だんかいてきに サポートして、しょしんしゃでも あんしんして まなべるよ。",
      cost: "ひようは かかるの？",
      costAnswer: "げんざい は むりょうプランで ごりよういただけます。まなびたい きもちがあれば、すぐに はじめられるよ。",
      newsTypes: "どのような ニュースが ほぞんできるの？",
      newsTypesAnswer: "ビジネス、テクノロジー、経済、科学、教育、健康、環境、社会、ライフスタイルの 9カテゴリの ニュースを ほぞんできるよ。"
    }
  }
}

// ラベル取得フック
export function useLabels(isKidsMode: boolean): Labels {
  return isKidsMode ? kidsLabels : normalLabels
}

// ラベル取得関数
export function getLabels(isKidsMode: boolean): Labels {
  return isKidsMode ? kidsLabels : normalLabels
} 